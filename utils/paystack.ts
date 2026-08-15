import https from "https";
import { IncomingMessage } from "http";
import config from "../config/config";

/**
 * Paystack talks to us over HTTPS.
 * Their host is usually `api.paystack.co` (no https:// prefix),
 * because Node's `https.request` wants a hostname, not a full URL.
 */
const paystackHost = (config.paystackBaseUrl || "api.paystack.co")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

type PaystackMethod = "GET" | "POST";

/**
 * Small helper so every Paystack call looks the same.
 *
 * Why a Promise wrapper?
 * The built-in `https.request` is callback-based. Wrapping it lets
 * our controllers use `await` instead of nesting callbacks.
 */
export const paystackRequest = <T>(
  method: PaystackMethod,
  path: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";

    const request = https.request(
      {
        hostname: paystackHost,
        port: 443,
        path,
        method,
        headers: {
          Authorization: `Bearer ${config.paystackSecret}`,
          "Content-Type": "application/json",
          // Content-Length is required when we send a body.
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (apiRes: IncomingMessage) => {
        let raw = "";

        // Paystack streams the response in chunks. We collect them first.
        apiRes.on("data", (chunk: Buffer) => {
          raw += chunk;
        });

        apiRes.on("end", () => {
          try {
            resolve(JSON.parse(raw) as T);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);

    // GET verify calls have no body. POST initialize does.
    if (payload) {
      request.write(payload);
    }

    request.end();
  });
};
