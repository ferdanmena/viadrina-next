import AuthPanel from "@/components/AuthPanel";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: "es" | "en" }>;
}) {
  const { lang } = await params;

  const safeLang: "es" | "en" =
    lang === "es" ? "es" : "en";

  return (
    <main className="container" style={{ maxWidth: 420 }}>
      <h1>
        {safeLang === "es" ? "Iniciar sesión" : "Login"}
      </h1>

      <AuthPanel lang={safeLang} />
    </main>
  );
}