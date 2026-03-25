import ToursArchiveClient from "@/components/ToursArchiveClient";
import { notFound } from "next/navigation";
import { translateCity } from "@/lib/locationNames";
import { Lang } from "@/lib/translations";

export default async function CityPage({
  params,
}: {
  params: Promise<{ lang: string; city: string }>;
}) {
  const { lang, city } = await params;

  const safeLang: Lang = lang === "es" ? "es" : lang === "pl" ? "pl" : "en";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/tours?lang=${safeLang}&city=${city}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    return notFound();
  }

  const tours = await res.json();

  if (!tours.length) {
    return notFound();
  }

  const originalCity = tours[0]?.city ?? city;
  const cityDisplay = translateCity(originalCity, safeLang);

  return (
    <>
      <section className="city-hero container">
        <h1>
          {safeLang === "es"
            ? `Tours en ${cityDisplay}`
            : `Tours in ${cityDisplay}`}
        </h1>

        <p>
          {safeLang === "es"
            ? `Descubre las mejores experiencias en ${cityDisplay}.`
            : `Discover the best experiences in ${cityDisplay}.`}
        </p>
      </section>

      <ToursArchiveClient
        lang={safeLang}
        tours={tours}
        title=""
      />
    </>
  );
}