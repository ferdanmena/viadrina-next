import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function POST(request: Request) {
  try {
    const { sessionId, lang } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const language = (lang || "EN").toUpperCase();

    const path =
      `/checkout.json/options/shopping-cart/${sessionId}?lang=${language}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      ...signRequest(path, "GET"),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("CHECKOUT OPTIONS ERROR:", err);
      throw new Error("Checkout options failed");
    }

    const data = await res.json();

    const cardProvider = data.options?.[0]?.paymentMethods?.cardProvider;

    return NextResponse.json(data);

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Checkout options error" },
      { status: 500 }
    );
  }
}