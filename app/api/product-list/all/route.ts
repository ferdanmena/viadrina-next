import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function GET() {
  try {
    const path = `/product-list.json/list`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      ...signRequest(path, "GET"),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("PRODUCT LIST ERROR:", err);
      return NextResponse.json([], { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}