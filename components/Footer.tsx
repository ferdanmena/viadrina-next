import Link from "next/link";
import Image from "next/image";
import { translations } from "@/lib/translations";

type FooterProps = {
  lang: "es" | "en";
};

export default function Footer({ lang }: FooterProps) {
  const t = translations[lang];

  return (
    <footer className="footer">
      <div className="container footer-grid">

        <div className="footer-col footer-brand">
          <Image
            src="/viadrina-logo.svg"
            alt="Viadrina Tours"
            width={140}
            height={40}
            className="footer-logo"
          />
          <p className="footer-tagline">
            {lang === "es"
              ? "Experiencias culturales en Europa Central."
              : "Cultural experiences across Central Europe."}
          </p>
        </div>

        <div className="footer-col">
          <h4>
            {lang === "es" ? "Destinos" : "Destinations"}
          </h4>
          <ul>
            <li>Wrocław</li>
            <li>Berlin</li>
            <li>Warsaw</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>
            {lang === "es" ? "Empresa" : "Company"}
          </h4>
          <ul>
            <li>About us</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.support}</h4>
          <ul>
            <li>FAQ</li>
            <li>Terms</li>
            <li>Help Center</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Viadrina Tours | Designed by MENA Studio
      </div>
    </footer>
  );
}