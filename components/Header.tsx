
"use client";

import { staticPages } from "@/lib/staticPages";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type HeaderProps = {
  lang: "es" | "en";
  locations: Record<string, string[]>;
};

function slugify(city: string) {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function Header({ lang, locations }: HeaderProps) {
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const [user, setUser] = useState<any>(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const fullName = user?.user_metadata?.full_name;

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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function switchLanguage(newLang: "es" | "en") {
    const segments = pathname.split("/").filter(Boolean);

    const currentLang = segments[0];
    const restSegments = segments.slice(1);

    if (!currentLang) return;

    // Translate first slug if it is a static page
    if (restSegments.length > 0) {
      const currentSlug = restSegments[0];

      Object.entries(staticPages).forEach(([_, value]) => {
        if (value[currentLang as "es" | "en"] === currentSlug) {
          restSegments[0] = value[newLang];
        }
      });
    }

    const newPath = `/${newLang}${restSegments.length ? "/" + restSegments.join("/") : ""}`;

    const queryString = searchParams.toString();

    router.push(queryString ? `${newPath}?${queryString}` : newPath);
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <div className="logo">
            <Link href={`/${lang}`}>
              <Image
                src="/viadrina-logo.svg"
                alt="Viadrina Tours"
                width={300}
                height={40}
                priority
              />
            </Link>
          </div>

          <div className="header-search">
            <input
              type="text"
              placeholder={
                lang === "es"
                  ? "Buscar tours o destinos"
                  : "Search tours or destinations"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            />

            {isFocused && (
              <div className="header-search-results">

                {query.length < 2 && (
                  <div className="search-section-title">
                    {lang === "es"
                      ? "Explorar destinos"
                      : "Explore destinations"}
                  </div>
                )}

                {query.length >= 2 && results.length > 0 && (
                  <>
                    <div className="search-section-title">
                      {lang === "es" ? "Resultados" : "Results"}
                    </div>

                    {results.map((tour: any) => (
                      <Link
                        key={tour.id}
                        href={`/${lang}/tour/${tour.id}`}
                      >
                        {tour.title}
                      </Link>
                    ))}
                  </>
                )}

                {query.length >= 2 && results.length === 0 && (
                  <div className="no-results">
                    {lang === "es"
                      ? "No se encontraron resultados"
                      : "No results found"}
                  </div>
                )}

              </div>
            )}
          </div>

          <nav className="header-nav">
            <div className="tours-dropdown">
              <span className="tours-trigger">
                {lang === "es" ? "Tours" : "Tours"}
              </span>

              <div className="tours-mega-menu">
                {Object.entries(locations).map(([country, cities]) => (
                  <div key={country} className="mega-country">
                    <strong>{country}</strong>

                    {cities.map((city) => (
                      <Link
                        key={city}
                        href={`/${lang}/${slugify(city)}`}
                      >
                        {city}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <Link href={`/${lang}/about`}>
              {lang === "es" ? "Nosotros" : "About"}
            </Link>

            <Link href={`/${lang}/contact`}>
              {lang === "es" ? "Contacto" : "Contact"}
            </Link>

            <div className="lang-switcher">
              <button
                className={lang === "es" ? "active" : ""}
                onClick={() => switchLanguage("es")}
              >
                ES
              </button>
              <button
                className={lang === "en" ? "active" : ""}
                onClick={() => switchLanguage("en")}
              >
                EN
              </button>
            </div>

            <div className="user-menu">
              <div className="user-trigger">
                <Image
                  src="/icons/user.svg"
                  alt="Account"
                  width={22}
                  height={22}
                />
                <span>
                  {user
                    ? fullName || user.email
                    : lang === "es"
                      ? "Perfil"
                      : "Profile"}
                </span>
              </div>

              <div className="user-dropdown">
                {user ? (
                  <>
                    <Link href={`/${lang}/account`}>
                      {lang === "es" ? "Mi Cuenta" : "My Account"}
                    </Link>

                    <Link href={`/${lang}/account#wishlist`}>
                      {lang === "es" ? "Favoritos" : "Wishlist"}
                    </Link>

                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.refresh();
                      }}
                    >
                      {lang === "es" ? "Cerrar sesión" : "Logout"}
                    </button>
                  </>
                ) : (
                  <Link href={`/${lang}/login`}>
                    {lang === "es" ? "Iniciar sesión" : "Login"}
                  </Link>
                )}
              </div>
            </div>
          </nav>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <Image
              src={
                mobileOpen
                  ? "/icons/hamburger-menu-close.svg"
                  : "/icons/hamburger-menu.svg"
              }
              alt=""
              width={24}
              height={24}
            />
          </button>

        </div>
      </header>
      <div className={`mobile-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`mobile-drawer ${mobileOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-drawer-inner">

            {/* CLOSE BUTTON */}
            <button
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <Image
                src="/icons/hamburger-menu-close.svg"
                alt=""
                width={22}
                height={22}
              />
            </button>

            {/* SEARCH */}
            <div className="mobile-search">
              <input
                type="text"
                placeholder={
                  lang === "es"
                    ? "Buscar tours o destinos"
                    : "Search tours or destinations"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* NAVIGATION */}
            <nav className="mobile-nav">
              <Link href={`/${lang}/tours`} onClick={() => setMobileOpen(false)}>
                Tours
              </Link>

              <Link href={`/${lang}/about`} onClick={() => setMobileOpen(false)}>
                {lang === "es" ? "Nosotros" : "About"}
              </Link>

              <Link href={`/${lang}/contact`} onClick={() => setMobileOpen(false)}>
                {lang === "es" ? "Contacto" : "Contact"}
              </Link>
            </nav>

            {/* LANGUAGE SWITCH */}
            <div className="lang-switcher mobile-lang">
              <button onClick={() => switchLanguage("es")}>ES</button>
              <button onClick={() => switchLanguage("en")}>EN</button>
            </div>

            {/* USER */}
            <div className="mobile-user">
              {user ? (
                <>
                  <Link href={`/${lang}/account`} onClick={() => setMobileOpen(false)}>
                    {lang === "es" ? "Mi Cuenta" : "My Account"}
                  </Link>

                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setMobileOpen(false);
                      router.refresh();
                    }}
                  >
                    {lang === "es" ? "Cerrar sesión" : "Logout"}
                  </button>
                </>
              ) : (
                <Link href={`/${lang}/login`} onClick={() => setMobileOpen(false)}>
                  {lang === "es" ? "Iniciar sesión" : "Login"}
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}