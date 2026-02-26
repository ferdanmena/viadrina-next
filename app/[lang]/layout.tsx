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

  return (
    <>
      <Header lang={safeLang} />

      <main className="container">
        {children}
      </main>

      <Footer lang={safeLang} />
    </>
  );
}