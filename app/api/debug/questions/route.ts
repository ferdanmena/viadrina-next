import { NextResponse } from "next/server";
import crypto from "crypto";

const API_BASE = "https://api.bokun.io";

function getBokunDate() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function signRequest(path: string, method: string) {
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
    },
  };
}

export async function GET() {
  const path = `/activity.json/212275?includeQuestions=true`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    ...signRequest(path, "GET"),
  });

  const data = await res.json();

  return NextResponse.json(data);
}