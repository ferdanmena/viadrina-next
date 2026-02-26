"use client";

import { translations } from "@/lib/translations";

type Props = {
  lang: "es" | "en";
};

export default function AboutClient({ lang }: Props) {
  const t = translations[lang];

  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <>
      {/* HERO */}
      <div className="about-hero">
        <div className="about-hero-content container">
          <h1>{t.aboutTitle}</h1>
          <p className="about-subtitle">
            {t.aboutSubtitle}
          </p>
        </div>
        <span className="about-tooltip">{t.aboutTooltip}</span>
      </div>

      {/* MAIN CONTENT */}
      <section className="about container">
        <div className="about-grid">

          {/* LEFT COLUMN */}
          <div className="about-text">
            <h2>{t.aboutSection1Title}</h2>
            <p>{t.aboutSection1Text}</p>

            <h2>{t.aboutSection2Title}</h2>
            <p>{t.aboutSection2Text}</p>

            <h2>{t.aboutSection3Title}</h2>
            <p>{t.aboutSection3Text}</p>
          </div>

          {/* RIGHT COLUMN */}
          <div className="about-highlight-card">
            <h3>{t.aboutCardTitle}</h3>
            <ul>
              <li>{t.aboutPoint1}</li>
              <li>{t.aboutPoint2}</li>
              <li>{t.aboutPoint3}</li>
              <li>{t.aboutPoint4}</li>
            </ul>
          </div>

        </div>
      </section>
    </>
  );
}