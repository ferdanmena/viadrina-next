import AuthPanel from "@/components/AuthPanel";

export default function LoginPage({
  params,
}: {
  params: { lang: "es" | "en" };
}) {
  const { lang } = params;

  return (
    <main className="container" style={{ maxWidth: 420 }}>
      <h1>
        {lang === "es" ? "Iniciar sesión" : "Login"}
      </h1>

      <AuthPanel lang={lang} />
    </main>
  );
}