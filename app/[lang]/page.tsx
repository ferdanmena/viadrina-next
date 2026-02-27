import HomeClient from "./HomeClient";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const safeLang = lang === "es" ? "es" : "en";

  const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://${process.env.VERCEL_URL}`;

  const [featuredRes, freeRes] = await Promise.all([
    fetch(`${baseUrl}/api/product-list/104678?lang=${safeLang}`, {
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/product-list/104677?lang=${safeLang}`, {
      cache: "no-store",
    }),
  ]);

  if (!featuredRes.ok) {
    console.error("Home fetch error:", await featuredRes.text());
    return <HomeClient lang={safeLang} tours={[]} freeTours={[]} />;
  }

  const tours = await featuredRes.json();
  const freeTours = freeRes.ok ? await freeRes.json() : [];

  return (
    <HomeClient
      lang={safeLang}
      tours={tours}
      freeTours={freeTours}
    />
  );
}