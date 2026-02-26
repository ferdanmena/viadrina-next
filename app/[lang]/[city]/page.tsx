import ToursArchiveClient from "@/components/ToursArchiveClient";
import { notFound } from "next/navigation";

export default async function CityPage({
  params,
}: {
  params: Promise<{ lang: string; city: string }>;
}) {
  const { lang, city } = await params;

  const safeLang = lang === "es" ? "es" : "en";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/tours?lang=${safeLang}&city=${city}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return notFound();
  }

  const tours = await res.json();

  if (!tours.length) {
    return notFound();
  }

  return (
    <>
      <section className="city-hero container">
        <h1>
          {safeLang === "es"
            ? `Tours en ${city}`
            : `Tours in ${city}`}
        </h1>

        <p>
          {safeLang === "es"
            ? `Descubre las mejores experiencias en ${city}.`
            : `Discover the best experiences in ${city}.`}
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