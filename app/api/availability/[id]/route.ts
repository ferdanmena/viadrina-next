import { NextResponse } from "next/server";
import crypto from "crypto";

const API_BASE = "https://api.bokun.io";

function signRequest(path: string, method: string) {
  const apiKey = process.env.BOKUN_API_KEY!;
  const secret = process.env.BOKUN_SECRET!;

  const date = new Date()
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "EN";

  const method = "GET";

  const from = new Date().toISOString().split("T")[0];
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 180);
  const to = toDate.toISOString().split("T")[0];

  // ry real availabilities
  const availabilityPath =
    `/activity.json/${id}/availabilities?start=${from}&end=${to}&lang=${lang}&includeSoldOut=false`;

  const availabilityRes = await fetch(
    API_BASE + availabilityPath,
    signRequest(availabilityPath, method)
  );

  const availabilityData = await availabilityRes.json();

  const availabilities = Array.isArray(availabilityData)
    ? availabilityData
    : availabilityData?.availabilities ?? [];
 const availableDates =
  availabilities
    .filter((a: any) => a.available)
    .map((a: any) => a.localDate) || [];

  if (availableDates.length > 0) {
    return NextResponse.json({
      mode: "calendar",
      availableDates
    });
  }

  // Fallback to price-range
  const pricePath =
    `/activity.json/${id}/price-list?lang=${lang}`;

  const priceRes = await fetch(
    API_BASE + pricePath,
    signRequest(pricePath, method)
  );

  const priceData = await priceRes.json();

  const range =
    priceData?.pricesByDateRange?.[0];

  if (range) {
    return NextResponse.json({
      mode: "range",
      range: {
        from: range.from,
        to: range.to
      }
    });
  }

  return NextResponse.json({
    mode: "none"
  });
}