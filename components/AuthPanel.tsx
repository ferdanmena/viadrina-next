"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Props = {
  lang: "es" | "en";
};

export default function AuthPanel({ lang }: Props) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login() {
    if (!email) return;

    setLoading(true);

    await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `http://localhost:3000/${lang}/account`,
      },
    });

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  // Not logged
  if (!user) {
    return (
      <div className="auth-panel">
        <h3>
          {lang === "es" ? "Iniciar sesión" : "Login"}
        </h3>

        <input
          placeholder={lang === "es" ? "Nombre" : "Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={login} disabled={loading}>
          {loading
            ? lang === "es"
              ? "Enviando..."
              : "Sending..."
            : lang === "es"
            ? "Recibir enlace"
            : "Send magic link"}
        </button>
      </div>
    );
  }

  // Logged
  const fullName = user.user_metadata?.full_name;

  return (
    <div className="auth-panel">
      <h3>
        {lang === "es" ? "Bienvenido" : "Welcome"}
      </h3>

      <p>
        {fullName || user.email}
      </p>

      <button onClick={logout}>
        {lang === "es" ? "Cerrar sesión" : "Logout"}
      </button>
    </div>
  );
}