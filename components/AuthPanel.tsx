"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { translations } from "@/lib/translations";

type Props = {
  lang: "es" | "en";
};

export default function AuthPanel({ lang }: Props) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

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
          {lang === "es" ? "Accede a tu cuenta" : "Login to your account"}
        </h3>

        <div className="auth-field">
          <label>{t.firstName}</label>
        <input
          placeholder={lang === "es" ? "Nombre" : "Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        </div>

        <div className="auth-field">
          <label>{t.authEmailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {!user && (
          <button
            type="button"
            className="auth-forgot"
            onClick={() => alert("Password recovery coming soon")}
          >
            {t.authForgotPassword}
          </button>
        )}

        <button 
        className="btn-primary"
        onClick={login} disabled={loading}>
          {loading
            ? lang === "es"
              ? "Enviando..."
              : "Sending..."
            : lang === "es"
            ? "Recibir enlace"
            : "Send magic link"}
        </button>

        <div className="auth-legal">
          <p>{t.authTermsText1}</p>
          <p>{t.authTermsText2}</p>
        </div>
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

      <button 
      className="btn-primary"
      onClick={logout}>
        {lang === "es" ? "Cerrar sesión" : "Logout"}
      </button>
    </div>
  );
}