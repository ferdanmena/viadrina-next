import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const langParam = searchParams.get("lang") || "en";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const bokunLang =
      langParam.toLowerCase() === "es" ? "ES" : "EN";

    const productListId = "16220"; // All tours

    const path = `/product-list.json/${productListId}?lang=${bokunLang}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      ...signRequest(path, "GET"),
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();

    if (!data.items) {
      return NextResponse.json([]);
    }

    const mapped = data.items.map((item: any) => {
      const activity = item.activity;

      return {
        id: activity.id,
        title: activity.title,
        city: activity.googlePlace?.city ?? "",
      };
    });

    const filtered = mapped.filter((tour: any) =>
      tour.title.toLowerCase().includes(query) ||
      tour.city.toLowerCase().includes(query)
    );

    return NextResponse.json(filtered.slice(0, 8));

  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json([]);
  }
}