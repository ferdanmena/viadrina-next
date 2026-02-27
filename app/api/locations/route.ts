import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const langParam = searchParams.get("lang") || "en";

    const bokunLang =
      langParam.toLowerCase() === "es" ? "ES" : "EN";

    const productListId = "16220";

    const path = `/product-list.json/${productListId}?lang=${bokunLang}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      ...signRequest(path, "GET"),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("LOCATIONS API ERROR:", err);
      return NextResponse.json({}, { status: 500 });
    }

    const data = await res.json();

    if (!data.items) {
      return NextResponse.json({});
    }

    const map: Record<string, Set<string>> = {};

    data.items.forEach((item: any) => {
      const activity = item.activity;

      const country = activity.googlePlace?.country;
      const city = activity.googlePlace?.city;

      if (!country || !city) return;

      if (!map[country]) {
        map[country] = new Set();
      }

      map[country].add(city);
    });

    const result: Record<string, string[]> = {};

    Object.entries(map).forEach(([country, cities]) => {
      result[country] = Array.from(cities).sort();
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("LOCATIONS API CRASH:", error);
    return NextResponse.json({}, { status: 500 });
  }
}