import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

type TourItem = {
  id: number;
  title: string;
  excerpt: string;
  price: number;
  currency: string;
  city: string;
  country: string;
  difficulty: string | null;
  categories: any[];
  image: string;
  duration: {
    hours: number;
    minutes: number;
  } | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const langParam = searchParams.get("lang") || "en";
    const cityParam = searchParams.get("city");

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
      console.error("TOURS API ERROR:", err);
      return NextResponse.json([], { status: 500 });
    }

    const data = await res.json();

    if (!data.items) {
      return NextResponse.json([]);
    }

    const mapped: TourItem[] = data.items.map((item: any) => {
      const activity = item.activity;

      let durationValue: TourItem["duration"] = null;

      if (activity.durationHours || activity.durationMinutes) {
        durationValue = {
          hours: activity.durationHours ?? 0,
          minutes: activity.durationMinutes ?? 0,
        };
      }

      return {
        id: activity.id,
        title: activity.title,
        excerpt: activity.excerpt,
        price: activity.nextDefaultPriceMoney?.amount ?? 0,
        currency: activity.nextDefaultPriceMoney?.currency ?? "EUR",
        city: activity.googlePlace?.city ?? "",
        country: activity.googlePlace?.country ?? "",
        difficulty: activity.difficultyLevel ?? null,
        categories: activity.activityCategories ?? [],
        image:
          activity.keyPhoto?.derived?.find((d: any) => d.name === "large")?.url ??
          activity.keyPhoto?.originalUrl ??
          "",
        duration: durationValue,
      };
    });

    const filtered: TourItem[] = cityParam
      ? mapped.filter((t: TourItem) =>
          t.city?.toLowerCase() === cityParam.toLowerCase()
        )
      : mapped;

    return NextResponse.json(filtered);

  } catch (error) {
    console.error("TOURS API CRASH:", error);
    return NextResponse.json([], { status: 500 });
  }
}