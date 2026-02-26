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

  /* -------------------------------------------
     1 TRY PRICE LIST FIRST
  -------------------------------------------- */

  const priceListPath = `/activity.json/${id}/price-list`;

  const priceListRes = await fetch(
    API_BASE + priceListPath,
    signRequest(priceListPath, "GET")
  );

  if (priceListRes.ok) {
    const priceListData = await priceListRes.json();

    const ranges = priceListData?.pricesByDateRange ?? [];

    const rate = ranges
      .flatMap((r: any) => r.rates || [])
      .find((r: any) => r.passengers?.length > 0);

    if (rate) {
      const currency = rate.passengers?.[0]?.price?.currency;

      const categories = rate.passengers
        .filter((p: any) => p.price?.amount !== undefined)
        .map((p: any) => ({
          pricingCategoryId: p.pricingCategoryId,
          title: p.title,
          price: p.price.amount,
          rateId: rate.rateId,
          currency,
        }));

      if (categories.length > 0) {
        return NextResponse.json(categories);
      }
    }
  }

  /* -------------------------------------------
     2 FALLBACK TO ACTIVITY.JSON
  -------------------------------------------- */

  const activityPath = `/activity.json/${id}`;

  const activityRes = await fetch(
    API_BASE + activityPath,
    signRequest(activityPath, "GET")
  );

  if (!activityRes.ok) {
    const errorText = await activityRes.text();
    console.error("PRICING FALLBACK ERROR:", errorText);
    return NextResponse.json([], { status: 500 });
  }

  const activity = await activityRes.json();

  const defaultRate = activity.rates?.find(
    (r: any) => r.id === activity.defaultRateId
  );

  if (!defaultRate) {
    return NextResponse.json([]);
  }

  const basePrice = activity.nextDefaultPriceMoney?.amount;
  const currency = activity.nextDefaultPriceMoney?.currency;

  const categories =
    activity.pricingCategories?.map((cat: any) => ({
      pricingCategoryId: cat.id,
      title: cat.title,
      price: basePrice ?? 0,
      rateId: defaultRate.id,
      currency,
    })) ?? [];

  return NextResponse.json(categories);
}