import dotenv from "dotenv";
import https from "https";
import { IncomingMessage } from "http";
import { Request, Response } from "express";
import BadRequestError from "../errors/bad-request";
import { StatusCodes } from "http-status-codes";
import config from "../config/config";
import crypto from "crypto";

dotenv.config();

const acceptPayment = async (req: Request, res: Response) => {
  const {
    body: { email, amount },
  } = req;

  if (!email || !amount) {
    throw new BadRequestError("Email and amount cannot be empty");
  }

  const params = JSON.stringify({
    email: email,
    amount: amount * 100,
  });

  const options = {
    hostname: config.paystackBaseUrl,
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
      "Content-Type": "application/json",
    },
  };

  const clientReq = https.request(options, (apiRes: IncomingMessage) => {
    let data = "";

    apiRes.on("data", (chunk: Buffer) => {
      data += chunk;
    });

    apiRes.on("end", () => {
      const responseData = JSON.parse(data);
      return res.status(StatusCodes.OK).json({
        responseData,
      });
    });
  });

  clientReq.on("error", (error) => {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  });

  clientReq.end(params);
};

const paymentCallback = async (req: Request, _res: Response) => {
  const ref = req.query.reference;
};

const paymentWebhook = async (req: Request, res: Response) => {
  const secret = config.paystackSecret ?? "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const paystackSignature = req.headers["x-paystack-signature"];

  console.log(paystackSignature);
  console.log(hash);
  if (hash == req.headers["x-paystack-signature"]) {
    const event = req.body;
    console.log(event);

    const reference = event.data.reference;
    if (!reference) {
      throw new BadRequestError("Invalid Transaction");
    }
  }

  res.status(200);
};

function verifyPaystackSignature(_signature: unknown, _event: unknown) {
  return true;
}

export { acceptPayment, paymentWebhook, paymentCallback };
