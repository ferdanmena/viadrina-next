"use client";

import { useState, useEffect } from "react";

type Props = {
  images: string[];
};

export default function TourGallery({ images }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) return null;

  const next = () => {
    setActive((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  const prev = () => {
    setActive((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // 🔐 Scroll lock
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [lightbox]);

  // ⌨ Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setLightbox(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, active]);

  return (
    <>
      {/* GRID */}
      <div className="tour-gallery-grid">
        <div
          className="gallery-main"
          onClick={() => setLightbox(true)}
        >
          <img src={images[0]} alt="" loading="lazy" />
        </div>

        <div className="gallery-side">
          {images.slice(1, 3).map((img, index) => (
            <div
              key={index}
              className="side-image"
              onClick={() => {
                setActive(index + 1);
                setLightbox(true);
              }}
            >
              <img src={img} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="lightbox">
          <div
            className="lightbox-bg"
            style={{ backgroundImage: `url(${images[active]})` }}
          />

          <button
            className="lightbox-close"
            onClick={() => setLightbox(false)}
          >
            ×
          </button>

          <button className="nav prev" onClick={prev}>
            ‹
          </button>

          <div className="lightbox-image-wrapper">
            <img
              key={active}
              src={images[active]}
              alt=""
              className="lightbox-image"
            />
          </div>

          <button className="nav next" onClick={next}>
            ›
          </button>

          <div className="counter">
            {active + 1} / {images.length}
          </div>

          {/* THUMBNAILS */}
          <div className="lightbox-thumbs">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className={`thumb ${
                  index === active ? "active" : ""
                }`}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}