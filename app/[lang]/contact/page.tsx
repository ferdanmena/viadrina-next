import ContactClient from "@/components/ContactClient";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const safeLang = lang === "es" ? "es" : "en";

  return <ContactClient lang={safeLang} />;
}