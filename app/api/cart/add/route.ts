import { NextResponse } from "next/server";
import crypto from "crypto";

const API_BASE = "https://api.bokun.io";

function getBokunDate() {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
}

function signRequest(path: string, method: string) {
  const apiKey = process.env.BOKUN_API_KEY!;
  const secret = process.env.BOKUN_SECRET!;
  const date = getBokunDate();

  const stringToSign = date + apiKey + method + path;

  const signature = crypto
    .createHmac("sha1", Buffer.from(secret, "utf8"))
    .update(Buffer.from(stringToSign, "utf8"))
    .digest("base64");

  return {
    headers: {
      "X-Bokun-Date": date,
      "X-Bokun-AccessKey": apiKey,
      "X-Bokun-Signature": signature,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { sessionId, booking } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Ensure cart exists
    const initPath = `/shopping-cart.json/session/${sessionId}`;

    const initRes = await fetch(`${API_BASE}${initPath}`, {
      method: "GET",
      ...signRequest(initPath, "GET"),
    });

    if (!initRes.ok) {
      const err = await initRes.text();
      console.error("CART INIT ERROR:", err);
      throw new Error("Cart init failed");
    }
    
    // Add activity to cart
    const addPath = `/shopping-cart.json/session/${sessionId}/activity`;

    const pricingCategoryBookings: any[] = [];

    booking.passengers.forEach((p: any) => {
      for (let i = 0; i < Number(p.quantity); i++) {
        pricingCategoryBookings.push({
          pricingCategoryId: Number(p.pricingCategoryId),
        });
      }
    });

    const cartBody = JSON.stringify({
      activityId: Number(booking.activityId),
      rateId: Number(booking.rateId),
      startTimeId: Number(booking.startTimeId),
      date: booking.date,
      pricingCategoryBookings,
    });

    console.log("CART BODY:", cartBody);

    const res = await fetch(`${API_BASE}${addPath}`, {
      method: "POST",
      ...signRequest(addPath, "POST"),
      body: cartBody,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("CART ADD ERROR FULL:", err);
      console.error("SENT BODY:", cartBody);
      throw new Error("Cart add failed");
    }

    const data = await res.json();

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Cart error" },
      { status: 500 }
    );
  }
}