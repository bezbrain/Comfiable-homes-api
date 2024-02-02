require("dotenv").config();
const express = require("express");
const https = require("https");
const BadRequestError = require("../errors/bad-request");
const { StatusCodes } = require("http-status-codes");
const config = require("../config/config");

// const payStack = {
//     acceptPayment: async(req, res)=> {

//     }
// }

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
// export const paymentCallback = async (req, res) => {
//   //
// };

module.exports = {
  acceptPayment,
};