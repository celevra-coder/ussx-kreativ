"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setError("Невалиден имейл или парола.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#17324f",
      padding: 20
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "min(420px, 100%)",
          background: "#f4efe7",
          padding: 32,
          borderRadius: 20,
          display: "grid",
          gap: 16
        }}
      >
        <h1>Администрация</h1>

        <input
          type="email"
          placeholder="Имейл"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12 }}
        />

        <input
          type="password"
          placeholder="Парола"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12 }}
        />

        {error && <p>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 13 }}
        >
          {loading ? "Влизане..." : "Вход"}
        </button>
      </form>
    </main>
  );
}
