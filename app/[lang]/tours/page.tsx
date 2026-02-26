import ToursArchiveClient from "@/components/ToursArchiveClient";
import { translations } from "@/lib/translations";

export default async function ToursPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const safeLang = lang === "es" ? "es" : "en";
  const t = translations[safeLang];

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/tours?lang=${safeLang}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return <div>Error loading tours</div>;
  }

  const tours = await res.json();

  return (
    <ToursArchiveClient
      lang={safeLang}
      tours={tours}
      title={t.allTours}
    />
  );
}