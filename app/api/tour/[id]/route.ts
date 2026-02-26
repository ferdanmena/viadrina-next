import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const langParam = searchParams.get("lang") || "en";

    // Convert to Bokun format
    const bokunLang = langParam.toLowerCase() === "es" ? "ES" : "EN";

    const apiKey = process.env.BOKUN_API_KEY!;
    const secret = process.env.BOKUN_SECRET!;

    const path = `/activity.json/${id}?lang=${bokunLang}`;
    const method = "GET";

    const date = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    const stringToSign =
      date +
      apiKey +
      method +
      path;

    const signature = crypto
      .createHmac("sha1", secret)
      .update(stringToSign)
      .digest("base64");

    const response = await fetch(
      `https://api.bokun.io${path}`,
      {
        headers: {
          "X-Bokun-Date": date,
          "X-Bokun-AccessKey": apiKey,
          "X-Bokun-Signature": signature,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text },
        { status: response.status }
      );
    }

    const data = await response.json();

    const tour = {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      description: data.description,
      price: data.nextDefaultPrice,
      currency: data.nextDefaultPriceMoney?.currency,
      duration: data.durationText,
      city: data.locationCode?.name,
      rating: data.tripadvisorReview?.rating,
      reviewCount: data.tripadvisorReview?.numReviews,
      images: data.photos?.map((p: any) =>
        p.derived?.find((d: any) => d.name === "large")?.cleanUrl
      ),
      included: data.included,
      excluded: data.excluded,
      attention: data.attention,
      startTimes: data.startTimes?.map(
        (t: any) =>
          `${t.hour}:${t.minute.toString().padStart(2, "0")}`
      ),
    };

    return NextResponse.json(tour);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    );
  }
}