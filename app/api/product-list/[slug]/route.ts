import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const { searchParams } = new URL(request.url);
    const langParam = searchParams.get("lang") || "en";

    const bokunLang =
      langParam.toLowerCase() === "es" ? "ES" : "EN";

    const path = `/product-list.json/${slug}?lang=${bokunLang}`;

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

    if (!data?.items) {
      return NextResponse.json([]);
    }

    const mapped = data.items.map((item: any) => {
      const activity = item.activity;

      let durationValue = null;

      if (activity.durationHours || activity.durationMinutes) {
        durationValue = {
          hours: activity.durationHours ?? 0,
          minutes: activity.durationMinutes ?? 0,
        };
      }

      return {
        id: activity.id,
        title: activity.title,
        price: activity.nextDefaultPriceMoney?.amount ?? 0,
        currency: activity.nextDefaultPriceMoney?.currency ?? "EUR",
        city: activity.googlePlace?.city ?? "",
        image:
          activity.keyPhoto?.derived?.find((d: any) => d.name === "large")?.url ??
          activity.keyPhoto?.originalUrl ??
          "",
        duration: durationValue,
      };
    });

    return NextResponse.json(mapped);

  } catch (error) {
    console.error("PRODUCT LIST CATCH ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }
}