import crypto from "crypto";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import config from "../config/config";
import { paystackRequest } from "../utils/paystack";
import CartCollection from "../models/Cart";
import OrderCollection from "../models/Order";
import TransactionCollection from "../models/Transaction";

type AuthedRequest = Request & { user: { userId: string; username: string } };

/**
 * Shape Paystack returns from /transaction/initialize
 * https://paystack.com/docs/api/transaction/#initialize
 */
interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
}

/**
 * Shape Paystack returns from /transaction/verify/:reference
 * https://paystack.com/docs/api/transaction/#verify
 */
interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    customer?: { email?: string };
  };
}

const toAmount = (value: number | string) => {
  const amount = Number(String(value).replace(/,/g, ""));
  return Number.isNaN(amount) ? 0 : amount;
};

/**
 * Turn the live cart into the snapshot we store on the transaction.
 * We copy only what an order needs — not cart-only flags like isIncreaseBlur.
 */
const snapshotCartItems = (
  items: Array<{
    productId: string;
    type: string;
    image: string;
    brand?: string;
    category?: string;
    sku?: string;
    price: number;
    counter: number;
  }>
) =>
  items.map((item) => ({
    productId: item.productId,
    type: item.type,
    image: item.image,
    brand: item.brand,
    category: item.category,
    sku: item.sku,
    price: toAmount(item.price),
    counter: item.counter,
  }));

/**
 * After Paystack says the charge succeeded, create the shop order once.
 *
 * Idempotent: if we already created an order for this reference
 * (browser callback AND webhook can both fire), we return that order
 * instead of inserting a second one.
 */
const fulfillSuccessfulPayment = async (reference: string) => {
  const transaction = await TransactionCollection.findOne({ reference });
  if (!transaction) {
    throw new NotFoundError("Payment record was not found");
  }

  // Already done — Paystack often hits both the callback and the webhook.
  if (transaction.status === "success" && transaction.orderId) {
    const existingOrder = await OrderCollection.findById(transaction.orderId);
    return existingOrder;
  }

  const order = await OrderCollection.create({
    createdBy: transaction.createdBy,
    status: "open",
    items: transaction.items,
    subtotal: transaction.subtotal,
    shippingFee: transaction.shippingFee,
    total: transaction.total,
    email: transaction.email,
    address: transaction.address,
    reference: transaction.reference,
  });

  // The items are now an order, so empty this user's cart.
  await CartCollection.deleteMany({ createdBy: transaction.createdBy });

  transaction.status = "success";
  transaction.orderId = order._id;
  await transaction.save();

  return order;
};

/**
 * STEP 1 — Start a Paystack checkout.
 *
 * Frontend calls this when the shopper clicks "Pay with Paystack".
 * We:
 *  1. Recalculate the total from the real cart (do not trust the browser).
 *  2. Ask Paystack for a checkout URL.
 *  3. Save a pending transaction with the cart + address snapshot.
 *  4. Send the checkout URL back so the frontend can redirect.
 */
const acceptPayment = async (req: Request, res: Response) => {
  const {
    user: { userId },
    body: { email, amount, address },
  } = req as AuthedRequest;

  if (!email || amount === undefined || amount === null) {
    throw new BadRequestError("Email and amount cannot be empty");
  }

  if (!address?.firstName || !address?.address) {
    throw new BadRequestError("Select a delivery address before paying");
  }

  const cartItems = await CartCollection.find({ createdBy: userId });
  if (cartItems.length === 0) {
    throw new BadRequestError("Your cart is empty");
  }

  const items = snapshotCartItems(cartItems);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.counter,
    0
  );
  const shippingFee = config.shippingFee;
  const serverTotal = Number((subtotal + shippingFee).toFixed(2));
  const clientTotal = Number(toAmount(amount).toFixed(2));

  // Small float wiggle room (e.g. 41.34 vs 41.3400001).
  if (Math.abs(serverTotal - clientTotal) > 0.05) {
    throw new BadRequestError("Amount does not match the current cart total");
  }

  // Paystack wants the smallest currency unit. For NGN that is kobo:
  // 41.34 naira => 4134 kobo. The shop prices are used the same way.
  const amountInKobo = Math.round(serverTotal * 100);

  const paystack = await paystackRequest<PaystackInitializeResponse>(
    "POST",
    "/transaction/initialize",
    {
      email,
      amount: amountInKobo,
      currency: "NGN",
      // After paying, Paystack sends the shopper back here with ?reference=
      callback_url: `${config.frontendUrl}/payment/callback`,
      metadata: {
        userId,
        custom_fields: [
          {
            display_name: "Customer",
            variable_name: "user_id",
            value: userId,
          },
        ],
      },
    }
  );

  if (!paystack.status || !paystack.data?.authorization_url || !paystack.data.reference) {
    throw new BadRequestError(paystack.message || "Could not start Paystack checkout");
  }

  await TransactionCollection.create({
    email,
    amount: serverTotal,
    reference: paystack.data.reference,
    status: "pending",
    createdBy: userId,
    items,
    address,
    shippingFee,
    subtotal: Number(subtotal.toFixed(2)),
    total: serverTotal,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: paystack.message || "Payment initialized",
    authorization_url: paystack.data.authorization_url,
    reference: paystack.data.reference,
  });
};

/**
 * STEP 2 — Confirm the payment after the shopper returns.
 *
 * The frontend /payment/callback page reads `reference` from the URL
 * and calls this endpoint. We ask Paystack "did this charge succeed?"
 * and only then create the order.
 */
const verifyPayment = async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;
  const reference = String(req.params.reference || req.query.reference || "");

  if (!reference) {
    throw new BadRequestError("Payment reference is missing");
  }

  const transaction = await TransactionCollection.findOne({
    reference,
    createdBy: user.userId,
  });
  if (!transaction) {
    throw new NotFoundError("Payment record was not found");
  }

  const paystack = await paystackRequest<PaystackVerifyResponse>(
    "GET",
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  const paid = paystack.status && paystack.data?.status === "success";
  if (!paid) {
    transaction.status = "failed";
    await transaction.save();
    throw new BadRequestError("Payment was not successful");
  }

  const order = await fulfillSuccessfulPayment(reference);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Payment verified",
    order,
  });
};

/**
 * Optional API callback.
 * If Paystack is ever pointed at the backend instead of the frontend,
 * we verify here and bounce the browser to the shop callback page.
 */
const paymentCallback = async (req: Request, res: Response) => {
  const reference = String(req.query.reference || "");
  const frontend = `${config.frontendUrl}/payment/callback${
    reference ? `?reference=${encodeURIComponent(reference)}` : ""
  }`;
  res.redirect(frontend);
};

/**
 * STEP 3 — Webhook (backup).
 *
 * Paystack also POSTs here when a charge succeeds. This matters if the
 * shopper closes the tab before our frontend can call verifyPayment.
 *
 * This route is public (no JWT). We trust it only after the HMAC matches.
 */
const paymentWebhook = async (req: Request, res: Response) => {
  const secret = config.paystackSecret ?? "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  // If the signature is wrong, someone other than Paystack hit this URL.
  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid Paystack signature",
    });
  }

  const event = req.body as {
    event?: string;
    data?: { reference?: string; status?: string };
  };
  const reference = event.data?.reference;

  // We only fulfill successful charge events.
  if (event.event === "charge.success" && reference) {
    await fulfillSuccessfulPayment(reference);
  }

  // Always 200 so Paystack does not keep retrying a handled event.
  res.status(StatusCodes.OK).json({ success: true });
};

export { acceptPayment, verifyPayment, paymentWebhook, paymentCallback };
