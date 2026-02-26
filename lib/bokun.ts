import crypto from "crypto";

export const API_BASE = "https://api.bokun.io";

function getBokunDate() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

export function signRequest(path: string, method: string) {
  const apiKey = process.env.BOKUN_API_KEY!;
  const secret = process.env.BOKUN_SECRET!;
  const date = getBokunDate();

  const stringToSign = date + apiKey + method + path;

  const signature = crypto
    .createHmac("sha1", secret)
    .update(stringToSign)
    .digest("base64");

  return {
    headers: {
      "X-Bokun-Date": date,
      "X-Bokun-AccessKey": apiKey,
      "X-Bokun-Signature": signature,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
}