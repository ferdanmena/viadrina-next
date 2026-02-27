import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations } from "@/lib/translations";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const safeLang = lang === "es" ? "es" : "en";

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.VERCEL_URL}`;

  const locations = await fetch(
    `${baseUrl}/api/locations?lang=${safeLang}`,
    { cache: "no-store" }
  ).then(res => res.json());

  return (
    <>
      <Header lang={safeLang} locations={locations} />

      <main className="container">
        {children}
      </main>

      <Footer lang={safeLang} />
    </>
  );
}