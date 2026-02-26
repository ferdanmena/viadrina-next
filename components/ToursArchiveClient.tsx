"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import TourCard from "./TourCard";
import { translations } from "@/lib/translations";

type Props = {
  lang: "es" | "en";
  tours: any[];
  title: string;
};

export default function ToursArchiveClient({
  lang,
  tours,
  title,
}: Props) {
  const t = translations[lang];

  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCity = searchParams.get("city");
  const selectedDifficulty = searchParams.get("difficulty");
  const selectedDuration = searchParams.get("duration");
  const selectedSort = searchParams.get("sort");

  // Unique cities
  const cities = useMemo(() => {
    return [...new Set(tours.map((t) => t.city).filter(Boolean))];
  }, [tours]);

  // Filtering
  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      if (selectedCity && t.city !== selectedCity) return false;

      if (selectedDifficulty && t.difficulty !== selectedDifficulty)
        return false;

      if (selectedDuration) {
        const hours = t.duration?.hours ?? 0;

        if (selectedDuration === "short" && hours > 3) return false;
        if (
          selectedDuration === "medium" &&
          (hours <= 3 || hours > 6)
        )
          return false;
        if (selectedDuration === "long" && hours <= 6)
          return false;
      }

      return true;
    });
  }, [tours, selectedCity, selectedDifficulty, selectedDuration]);

  // Sorting
  const sortedTours = useMemo(() => {
    const list = [...filteredTours];

    if (selectedSort === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    }

    if (selectedSort === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    }

    if (selectedSort === "duration_asc") {
      list.sort(
        (a, b) =>
          (a.duration?.hours ?? 0) -
          (b.duration?.hours ?? 0)
      );
    }

    if (selectedSort === "duration_desc") {
      list.sort(
        (a, b) =>
          (b.duration?.hours ?? 0) -
          (a.duration?.hours ?? 0)
      );
    }

    return list;
  }, [filteredTours, selectedSort]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get(key) === value) {
      params.delete(key);
    } else {
      if (value) params.set(key, value);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  }

  function clearFilters() {
    router.push(`?`, { scroll: false });
  }

  const difficultyOptions = [
    { value: "EASY", label: t.archiveDifficultyEasy },
    { value: "MODERATE", label: t.archiveDifficultyModerate },
    { value: "CHALLENGING", label: t.archiveDifficultyChallenging },
  ];

  return (
    <main className="archive-page container">
      <h1 className="page-title">{title}</h1>

      <div className="archive-layout">
        {/* SIDEBAR */}
        <aside className="archive-sidebar">
          <div className="archive-sidebar-header">
            <h3>{t.archiveFilterTitle}</h3>
            {(selectedCity ||
              selectedDifficulty ||
              selectedDuration) && (
                <div className="filter-group">
                  <button
                    className="clear-filters"
                    onClick={clearFilters}
                  >
                    {t.archiveClearFilters}
                  </button>
                </div>
              )}
          </div>

          {/* Cities */}
          {cities.length > 0 && (
            <div className="filter-group">
              <strong>{t.archiveCity}</strong>
              {cities.map((city) => (
                <button
                  key={city}
                  className={city === selectedCity ? "active" : ""}
                  onClick={() => updateParam("city", city)}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Difficulty */}
          <div className="filter-group">
            <strong>{t.archiveDifficulty}</strong>

            {difficultyOptions.map((level) => (
              <button
                key={level.value}
                className={
                  level.value === selectedDifficulty ? "active" : ""
                }
                onClick={() =>
                  updateParam("difficulty", level.value)
                }
              >
                {level.label}
              </button>
            ))}
          </div>

          {/* Duration */}
          <div className="filter-group">
            <strong>{t.archiveDuration}</strong>

            <button
              className={
                selectedDuration === "short" ? "active" : ""
              }
              onClick={() =>
                updateParam("duration", "short")
              }
            >
              {t.archiveDurationShort}
            </button>

            <button
              className={
                selectedDuration === "medium" ? "active" : ""
              }
              onClick={() =>
                updateParam("duration", "medium")
              }
            >
              {t.archiveDurationMedium}
            </button>

            <button
              className={
                selectedDuration === "long" ? "active" : ""
              }
              onClick={() =>
                updateParam("duration", "long")
              }
            >
              {t.archiveDurationLong}
            </button>
          </div>

          
        </aside>

        {/* RESULTS */}
        <div className="archive-results">
          {/* TOOLBAR */}
          <div className="archive-toolbar">
            <div className="archive-sort">
              <select
                value={selectedSort || ""}
                onChange={(e) =>
                  updateParam("sort", e.target.value || null)
                }
              >
                <option value="">
                  {t.archiveSortLabel}
                </option>

                <option value="price_asc">
                  {t.archiveSortPriceAsc}
                </option>

                <option value="price_desc">
                  {t.archiveSortPriceDesc}
                </option>

                <option value="duration_asc">
                  {t.archiveSortDurationAsc}
                </option>

                <option value="duration_desc">
                  {t.archiveSortDurationDesc}
                </option>
              </select>
            </div>

            <p className="results-count">
              {sortedTours.length} {t.archiveResultsFound}
            </p>
          </div>

          {/* GRID */}
          <div className="tour-grid">
            {sortedTours.map((tour) => (
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

            {sortedTours.length === 0 && (
              <p>{t.noResultsFound}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}