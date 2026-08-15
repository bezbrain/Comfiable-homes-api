import dns from "dns";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import config from "../config/config";

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);

const wrapEmail = (title: string, body: string) => `
  <div style="background:#f7f2ec;padding:32px 16px;font-family:Georgia,serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:24px;padding:32px;border:1px solid #e8ddd0;">
      <p style="letter-spacing:0.12em;text-transform:uppercase;color:#9a3412;font-size:12px;margin:0 0 8px;">ComfiableHomes</p>
      <h1 style="font-size:28px;margin:0 0 16px;">${title}</h1>
      ${body}
    </div>
  </div>
`;

const otpBlock = (otp: string, actionUrl: string, actionLabel: string) => `
  <p style="font-size:36px;letter-spacing:0.28em;font-weight:700;margin:24px 0;color:#9a3412;">${otp}</p>
  <p style="color:#57534e;">This code expires in 10 minutes. Enter it on this page:</p>
  <p><a href="${actionUrl}" style="color:#9a3412;font-weight:700;">${actionLabel}</a></p>
`;

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!config.emailUser || !config.emailPass) {
    return null;
  }
  if (!transporter) {
    // Render cannot reach Gmail over IPv6/port 465. Prefer IPv4 and STARTTLS 587.
    dns.setDefaultResultOrder("ipv4first");
    const smtpOptions: SMTPTransport.Options = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    };
    transporter = nodemailer.createTransport({
      ...smtpOptions,
      lookup: (
        hostname: string,
        _options: unknown,
        callback: (
          err: NodeJS.ErrnoException | null,
          address: string,
          family: number
        ) => void
      ) => {
        dns.lookup(hostname, { family: 4 }, callback);
      },
    } as SMTPTransport.Options);
  }
  return transporter;
};

export const sendMail = async ({
  to,
  subject,
  html,
  text,
  debugCode,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  debugCode?: string;
}) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(
      `[email:dev] EMAIL_USER or EMAIL_PASS is missing. OTP was not emailed to ${to}${
        debugCode ? `: ${debugCode}` : ""
      }`
    );
    return;
  }

  await mailer.sendMail({
    from: `"ComfiableHomes" <${config.emailFrom}>`,
    to,
    subject,
    html,
    text,
  });
  console.log(`[email] Sent "${subject}" to ${to}`);
};

export const sendVerificationEmail = (to: string, otp: string, actionUrl: string) =>
  sendMail({
    to,
    subject: "Your ComfiableHomes verification code",
    debugCode: otp,
    text: `Your verification code is ${otp}. It expires in 10 minutes. Enter it here: ${actionUrl}`,
    html: wrapEmail(
      "Verify your email",
      `<p>Use this one-time code to finish creating your account.</p>${otpBlock(
        otp,
        actionUrl,
        "Enter your code"
      )}`
    ),
  });

export const sendPasswordResetEmail = (to: string, otp: string, actionUrl: string) =>
  sendMail({
    to,
    subject: "Your ComfiableHomes password reset code",
    debugCode: otp,
    text: `Your password reset code is ${otp}. It expires in 10 minutes. Enter it here: ${actionUrl}`,
    html: wrapEmail(
      "Reset your password",
      `<p>Use this one-time code to choose a new password.</p>${otpBlock(
        otp,
        actionUrl,
        "Enter your reset code"
      )}`
    ),
  });

export const sendPasswordChangedEmail = (to: string) =>
  sendMail({
    to,
    subject: "Your ComfiableHomes password was changed",
    text: "Your password was changed. If this was not you, reset it again from the shop.",
    html: wrapEmail(
      "Password changed",
      "<p>Your password was updated. If you did not do this, reset it again from the shop.</p>"
    ),
  });

export const sendOrderPlacedEmail = (
  to: string,
  order: { total: number; reference?: string; items: Array<{ type: string; counter: number }> }
) => {
  const itemLines = order.items
    .map((item) => `${item.type} × ${item.counter}`)
    .join(", ");
  return sendMail({
    to,
    subject: "We received your ComfiableHomes order",
    text: `Your order ${order.reference || ""} totaling ${formatNaira(order.total)} is open. ${itemLines}`,
    html: wrapEmail(
      "Order received",
      `<p>Thanks for your order. It is open and on its way to being prepared.</p>
       <p><strong>Total:</strong> ${formatNaira(order.total)}</p>
       <p>${itemLines}</p>
       ${order.reference ? `<p>Reference: ${order.reference}</p>` : ""}`
    ),
  });
};

export const sendOrderCompletedEmail = (
  to: string,
  order: { total: number; reference?: string }
) =>
  sendMail({
    to,
    subject: "Your ComfiableHomes order is complete",
    text: `Your order ${order.reference || ""} totaling ${formatNaira(order.total)} has been marked completed.`,
    html: wrapEmail(
      "Order completed",
      `<p>Your order has been marked completed.</p>
       <p><strong>Total:</strong> ${formatNaira(order.total)}</p>
       ${order.reference ? `<p>Reference: ${order.reference}</p>` : ""}`
    ),
  });
