export async function deliverOtp({ phone, otp, config }) {
  if (config.otpMode === "dev") return { delivered: true, mode: "dev" };

  if (config.otpMode !== "webhook") {
    throw new Error("Unsupported OTP_MODE. Use dev or webhook.");
  }

  if (!config.otpWebhookUrl) {
    throw new Error("OTP_WEBHOOK_URL is not configured");
  }

  const headers = { "Content-Type": "application/json" };
  if (config.otpWebhookToken) headers.Authorization = `Bearer ${config.otpWebhookToken}`;

  const response = await fetch(config.otpWebhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone, otp })
  });

  if (!response.ok) {
    throw new Error(`OTP provider rejected the request (${response.status})`);
  }

  return { delivered: true, mode: "webhook" };
}
