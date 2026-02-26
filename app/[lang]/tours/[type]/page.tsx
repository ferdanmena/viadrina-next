import ToursArchiveClient from "@/components/ToursArchiveClient";
import { notFound } from "next/navigation";

const listMap: Record<string, string> = {
  private: "104679",
  "day-trips": "104680",
  free: "104677",

  // Spanish slugs
  privados: "104679",
  excursiones: "104680",
  gratis: "104677",
};

export default async function ToursTypePage({
  params,
}: {
  params: Promise<{ lang: string; type: string }>;
}) {
  const { lang, type } = await params;

  const safeLang = lang === "es" ? "es" : "en";

  const listId = listMap[type];

  if (!listId) {
    return notFound();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/product-list/${listId}?lang=${safeLang}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return notFound();
  }

  const tours = await res.json();

  return (
    <ToursArchiveClient
      lang={safeLang}
      tours={tours}
      title={type.replace("-", " ")}
    />
  );
}