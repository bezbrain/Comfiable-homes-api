require("dotenv").config();
const express = require("express");
const https = require("https");
const BadRequestError = require("../errors/bad-request");
const { StatusCodes } = require("http-status-codes");
const config = require("../config/config");
const crypto = require("crypto");

const acceptPayment = async (req, res) => {
  const {
    body: { email, amount },
  } = req;

  if (!email || !amount) {
    throw new BadRequestError("Email and amount cannot be empty");
  }

  // Check if amount is number and also check if aggregation coming from checkout is same as the one in the amount input field

  //   Params
  const params = JSON.stringify({
    email: email,
    amount: amount * 100,
  });

  // Options
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

  //   Make request to paystack API
  const clientReq = https.request(options, (apiRes) => {
    let data = "";

    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", () => {
      //   console.log(JSON.parse(data));
      const responseData = JSON.parse(data);
      return res.status(StatusCodes.OK).json({
        responseData,
      });
    });
  });

  //   Handle request error
  clientReq.on("error", (error) => {
    console.log(error);
    //   throw new null();
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  });

  // Write data and end request
  // clientReq.write(params);
  clientReq.end(params);
};

// HANDLE PAYSTACK CALLBACK
const paymentWebhook = async (req, res) => {
  // Validate event
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  // Verify the Paystack signature (for security)
  const paystackSignature = req.headers["x-paystack-signature"];

  console.log(paystackSignature);
  console.log(hash);
  // const isValidSignature = verifyPaystackSignature(paystackSignature, event);
  if (hash == paystackSignature) {
    const event = req.body;
    console.log(event);
    throw new BadRequestError("Invalid signature");
  }

  // Process the event data (e.g check if payment was successful)
  // if (event.event === "charge.success") {
  //   const { reference, amount, customer } = event.data;
  //   // Update your database with successful payment details
  //   // For example, mark the donation as paid
  //   // You can also send a confirmation email to the customer

  //   // Redirect the user to the order confirmation page
  //   console.log("I am success");
  //   res.redirect("http://localhost:5173/orders/open");
  // } else {
  //   // Handle other events (e.g., charge.failed, etc.)
  //   // You might want to log these events for debugging
  //   console.log(`Received Paystack event: ${event.event}`);
  res.status(200).send("Event received");
  // }
};

// Helper function to verify Paystack signature
function verifyPaystackSignature(signature, event) {
  // Implement your signature verification logic here
  // Compare the signature with the one generated using your secret key
  // Return true if valid, false otherwise
  // You can find sample code for signature verification in Paystack's documentation
  // Make sure to keep your secret key secure (e.g., use environment variables)
  // For demonstration purposes, I'm assuming it's valid
  return true;
}

module.exports = {
  acceptPayment,
  paymentWebhook,
};
