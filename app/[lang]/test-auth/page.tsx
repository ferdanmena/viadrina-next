"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function TestAuth() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Escuchar cambios de sesión (muy importante)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login() {
    if (!email) return alert("Enter email");

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          "http://localhost:3000/es/test-auth",
      },
    });

    alert("Check your email");
  }

  return (
    <div style={{ padding: 40 }}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        style={{ marginRight: 12 }}
      />

      <button onClick={login}>
        Login with Magic Link
      </button>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}