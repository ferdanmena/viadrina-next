import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const path = `/question.json/shopping-cart/${sessionId}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      ...signRequest(path, "GET"),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("CART QUESTIONS ERROR:", err);
      return NextResponse.json(
        { error: "Failed to fetch cart questions" },
        { status: 500 }
      );
    }

    const data = await res.json();

    console.log("CART QUESTIONS RAW:");
    console.log(JSON.stringify(data, null, 2));

    return NextResponse.json(data);

  } catch (error) {
    console.error("CART QUESTIONS ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Cart questions failed" },
      { status: 500 }
    );
  }
}