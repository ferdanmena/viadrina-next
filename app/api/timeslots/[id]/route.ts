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

  const date = searchParams.get("date");
  const lang = searchParams.get("lang") || "EN";

  if (!date) {
    return NextResponse.json([]);
  }

  const path =
    `/activity.json/${id}/availabilities?start=${date}&end=${date}&lang=${lang}&includeSoldOut=false`;

  const res = await fetch(
    API_BASE + path,
    signRequest(path, "GET")
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("TIMESLOTS ERROR:", errorText);
    return NextResponse.json([]);
  }

  const data = await res.json();
  const availabilities = Array.isArray(data)
    ? data
    : data?.availabilities ?? [];

  const times = availabilities
    .filter((item: any) => !item.soldOut)
    .map((item: any) => ({
      startTimeId: item.startTimeId,
      time: item.startTime,
      rateId: item.defaultRateId,
      minParticipants: item.minParticipants ?? 1,
    }));

  return NextResponse.json(times);
}