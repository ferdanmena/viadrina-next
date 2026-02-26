import AboutClient from "@/components/AboutClient";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const safeLang = lang === "es" ? "es" : "en";

  return <AboutClient lang={safeLang} />;
}