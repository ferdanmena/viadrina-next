import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AccountDashboard from "@/components/AccountDashboard";

export default async function AccountPage({
  params,
}: {
  params: { lang: "es" | "en" };
}) {
  const { lang } = params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/account?login=required`);
  }

  return (
    <main className="container">
      <h1>{lang === "es" ? "Mi Cuenta" : "My Account"}</h1>
      <AccountDashboard lang={lang} />
    </main>
  );
}