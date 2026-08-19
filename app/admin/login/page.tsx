"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useAdminLogin } from "@/hooks/useAdminLogin";

// Wireframe S5 states: Default, Loading (tombol disabled + spinner),
// Error (inline di bawah form), Success (redirect — ditangani di hook).
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, status, errorMessage } = useAdminLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void login(email, password);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={status === "loading"}
      className="w-full max-w-sm rounded-xl bg-latar p-8 shadow-card"
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={58}
        height={56}
        className="mb-3 h-14 w-auto"
        priority
        aria-hidden
      />
      <h1 className="mb-6 font-display text-2xl font-semibold text-nakhoda">
        Klinik Cahaya Medika
      </h1>
      <p className="mb-6 text-sm text-nakhoda/70">Masuk ke panel admin</p>

      <label htmlFor="email" className="mb-1 block text-sm font-medium text-nakhoda">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === "loading"}
        className="mb-4 w-full rounded-xl border border-nakhoda/20 px-4 py-3 text-base focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
      />

      <label htmlFor="password" className="mb-1 block text-sm font-medium text-nakhoda">
        Password
      </label>
      <div className="mb-4 flex items-center gap-2">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={status === "loading"}
          className="w-full rounded-xl border border-nakhoda/20 px-4 py-3 text-base focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          className="min-h-[44px] min-w-[44px] shrink-0 rounded-xl border border-nakhoda/20 text-sm text-nakhoda"
        >
          {showPassword ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>

      {status === "error" && errorMessage ? (
        <p role="alert" className="mb-4 text-sm text-error">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="min-h-[44px] w-full rounded-xl bg-nakhoda px-4 py-3 font-medium text-latar disabled:opacity-40"
      >
        {status === "loading" ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}

// useSearchParams() (dipakai di useAdminLogin lewat redirectedFrom) wajib
// dibungkus Suspense boundary di App Router, kalau tidak build gagal saat
// prerendering (Next.js CSR bailout rule).
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-nakhoda px-6 font-body">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
