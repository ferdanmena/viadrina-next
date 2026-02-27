import type { Metadata } from "next";
import TourGallery from "@/components/TourGallery";
import { notFound } from "next/navigation";
import { translations } from "@/lib/translations";
import RatingStars from "@/components/RatingStars";
import Link from "next/link";
import BookingBox from "@/components/BookingBox";

type PageProps = {
  params: Promise<{
    lang: "es" | "en";
    id: string;
  }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {

  const { lang, id } = await params;

  const safeLang = lang === "es" ? "es" : "en";

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.VERCEL_URL}`;

  const res = await fetch(
    `${baseUrl}/api/tour/${id}?lang=${safeLang}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      title: "Tour not found",
    };
  }

  const tour = await res.json();

  return {
    title: tour.title,
    description: tour.excerpt ?? "Discover this tour with Viadrina Tours.",
    openGraph: {
      title: tour.title,
      description: tour.excerpt,
      images: tour.images?.length ? [tour.images[0]] : [],
    },
  };
}

export default async function TourPage({ params }: PageProps) {

  const { lang, id } = await params;

  const safeLang = lang === "es" ? "es" : "en";
  const t = translations[safeLang];

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.VERCEL_URL}`;

  const res = await fetch(
    `${baseUrl}/api/tour/${id}?lang=${safeLang}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return notFound();
  }

  const tour = await res.json();

  return (
    <main className="page">
      <div className="tour-back-link">
        <Link href={`/${safeLang}/tours?city=${encodeURIComponent(tour.city)}`}>
          ← {safeLang === "es" ? `Más en ${tour.city}` : `More in ${tour.city}`}
        </Link>
      </div>

      <section className="tour-hero">
        <div className="tour-meta-first">
          <span className="tour-city">{tour.city}</span>
          <span>{tour.duration}</span>
        </div>

        <h1>{tour.title}</h1>

        <div className="tour-meta">
          {tour.difficulty && <span>{tour.difficulty}</span>}
          {tour.rating && (
            <RatingStars
              rating={tour.rating}
              reviewCount={tour.reviewCount}
            />
          )}
        </div>

        <TourGallery images={tour.images} />
      </section>

      <section className="tour-layout">
        <div className="tour-main">
          <h2>{t.overview}</h2>
          <div
            dangerouslySetInnerHTML={{ __html: tour.description }}
          />

          {tour.included && (
            <div className="vt-content-row">
              <h3>{t.included}</h3>
              <div
                className="vt-content vt-included"
                dangerouslySetInnerHTML={{ __html: tour.included }}
              />
            </div>
          )}

          {tour.excluded && (
            <div className="vt-content-row">
              <h3>{t.notIncluded}</h3>
              <div
                className="vt-content vt-excluded"
                dangerouslySetInnerHTML={{ __html: tour.excluded }}
              />
            </div>
          )}

          {tour.attention && (
            <div className="vt-content-row">
              <h3>{t.importantInfo}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: tour.attention }}
              />
            </div>
          )}
        </div>

        <aside className="tour-sidebar">
          <BookingBox
            price={tour.price}
            currency={tour.currency}
            lang={safeLang}
            tourId={tour.id}
            title={tour.title}
            image={tour.images?.[0] || ""}
            city={tour.city}
            duration={tour.duration}
          />
        </aside>
      </section>
    </main>
  );
}