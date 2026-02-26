"use client";

import { useState, useEffect } from "react";
import TourCard from "@/components/TourCard";
import { translations } from "@/lib/translations";

type HomeClientProps = {
  lang: "es" | "en";
  tours: any[];       // Featured
  freeTours?: any[];  // Free tours (optional)
};

export default function HomeClient({
  lang,
  tours,
  freeTours = [],
}: HomeClientProps) {
  const safeLang = lang === "es" ? "es" : "en";
  const t = translations[safeLang];
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content container">
          <h1>{t.heroTitle}</h1>
          <h2>{t.heroSubtitle}</h2>
          <p className="hero-subtitle">{t.heroText}</p>

          <div className="hero-search-wrapper">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="hero-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            />

            {isFocused && (
              <div className="search-results">

                {query.length < 2 && (
                  <>
                    <div className="search-section-title">
                      {t.bestPicksTitle}
                    </div>

                    {tours.slice(0, 4).map((tour) => (
                      <a key={tour.id} href={`/${lang}/tour/${tour.id}`}>
                        {tour.title}
                      </a>
                    ))}
                  </>
                )}

                {query.length >= 2 && results.length > 0 && (
                  <>
                    <div className="search-section-title">
                      {t.searchResultsTitle}
                    </div>

                    {results.map((tour: any) => (
                      <a key={tour.id} href={`/${lang}/tours/${tour.id}`}>
                        {tour.title}
                      </a>
                    ))}
                  </>
                )}

                {query.length >= 2 && results.length === 0 && (
                  <div className="no-results">
                    {t.noResultsFound}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
        <p className="tooltip-hero">{t.wroclawuniversity}</p>
      </section>

      {/* FEATURED */}
      <section className="home-tours container">
        <h2>
          {t.featuredToursTitle}
        </h2>

        <div className="tour-grid">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              id={tour.id}
              lang={lang}
              title={tour.title}
              price={tour.price}
              currency={tour.currency}
              city={tour.city}
              image={tour.image}
              duration={tour.duration}
            />
          ))}
        </div>
      </section>

      {/* FREE TOURS */}
      {freeTours.length > 0 && (<section className="home-freetours container">
        <h2>
          {t.freeToursTitle}
        </h2>

          <div className="tour-grid">
            {freeTours.map((tour) => (
              <TourCard
                key={tour.id}
                id={tour.id}
                lang={lang}
                title={tour.title}
                price={tour.price}
                currency={tour.currency}
                city={tour.city}
                image={tour.image}
                duration={tour.duration}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}