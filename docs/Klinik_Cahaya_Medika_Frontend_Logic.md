# Frontend Logic — Panel Admin Klinik Cahaya Medika

> **Dokumen coding-stage**, bukan dokumen sign-off. Ini adalah rekan frontend dari `Klinik_Cahaya_Medika_Endpoints_Spec.md` — kontrak API sama persis, dibaca dari sumber yang sama:
> - **Technical Spec** §4.1, §4.2, §4.3 + `TSD_Revisi_API_Contracts.md` (method/path/auth/shape — otoritatif, sudah termasuk 3 addendum: `PATCH layanan`, `PATCH dokter`, `POST dokter/foto`, dan koreksi envelope `GET riwayat`)
> - **Endpoints Spec** §1–§5 (Zod schema, service, repository, response shape yang **sudah berjalan** di backend — dikutip langsung, bukan ditebak ulang)
> - **PRD v1.0** §4 Modul 2, 3, 6 (business rules)
> - **User Flow & Wireframe Document** §3 (S5–S9, S3), §5 (keputusan UX)
>
> **Semua kode di bawah masih butuh review manusia sebelum merge** — terutama tiap `[ASUMSI]` dan tiap role/auth guard (guard ini **UX, bukan enforcement keamanan** — lihat catatan di §0.4, berlaku untuk semua guard di dokumen ini).

---

## 0. Framework & Library Detection

| Layer | Sumber keputusan | Catatan |
|---|---|---|
| Framework | **Next.js 14+ App Router, TypeScript** | TSD §2, dikonfirmasi ulang Backend Blueprint baris 10 |
| Validasi | **Zod** | Backend Blueprint §10.1 poin 1 — **schema yang sama dipakai di sini**, bukan schema client terpisah (lihat §0.1) |
| Auth | **Supabase Auth SDK**, `signInWithPassword()` langsung dari client | TSD §4.1 — tidak ada custom `/api/auth/login` |
| Role model | 1 role admin, tidak ada RBAC bertingkat | TSD §4.1, Endpoints Spec `lib/auth/guards.ts` |

Dua keputusan library **tidak** disebutkan di TSD/Blueprint manapun (di luar cakupan dokumen backend), jadi didokumentasikan sebagai rekomendasi berlabel, bukan ditebak diam-diam:

### 0.1 Validation schema — reuse langsung, bukan mirror terpisah

*Ditutup di bawah — dijawab dari sudut pandang Frontend Engineer, peran paling relevan karena ini keputusan tentang bagaimana lapisan frontend mengonsumsi kontrak yang sudah dikunci, bukan mengubah kontrak itu sendiri.*

**Keputusan: import langsung `*.schema.ts` dari `lib/modules/*` di client**, bukan menulis ulang Zod schema versi frontend. **Dikunci sebagai final**, bukan lagi rekomendasi terbuka.

**Alasan:** TSD §3.1 secara eksplisit memutuskan **monolith tipis** — satu aplikasi Next.js yang sama untuk publik dan admin. Zod schema (`updateJadwalSchema`, `updateLayananSchema`, `updateDokterSchema`, `uploadFotoSchema`) sudah isomorphic (tidak ada import server-only di dalamnya — cek `lib/modules/jadwal/jadwal.schema.ts` dkk., semuanya cuma `import { z } from "zod"`). Menulis ulang jadi schema client terpisah menciptakan dua sumber kebenaran yang bisa drift — persis risiko yang instruksi skill ini minta dihindari ("mirror field-for-field"). Reuse langsung menghilangkan risiko drift itu sepenuhnya, bukan cuma menguranginya.

**Konsekuensi:** kalau backend schema berubah, validasi frontend otomatis ikut berubah — ini keuntungan, bukan risiko, selama perubahan schema memang dimaksudkan untuk kedua sisi (yang memang selalu benar di sini, karena satu kontrak API yang sama).

### 0.2 Form wiring — React Hook Form + `@hookform/resolvers/zod`

*Ditutup — dijawab dari sudut pandang Frontend Engineer, sama seperti §0.1: pilihan library konsumsi kontrak, bukan pilihan yang mengubah kontrak.*

**Keputusan: React Hook Form + `@hookform/resolvers/zod`, dikunci sebagai final.** Tidak disebut di dokumen manapun sebelumnya, tapi ini pairing standar de-facto dengan Zod di ekosistem Next.js App Router yang sudah dipilih TSD §2 — alasan yang sama dengan kenapa Backend Blueprint §10.1 poin 1 memilih Zod (konvensi framework yang berlaku umum, bukan preferensi pribadi). **Faktor penentu:** tabel jadwal S7 (7 baris × banyak field per baris) genuinely butuh `useFieldArray` untuk menghindari re-render manual per keystroke yang akan jadi verbose kalau ditulis native `useState` — bukan sekadar selera, ada baris kode nyata yang lebih sederhana dengan RHF di S7 dan S8 (§4–§5). `[TINDAK LANJUT: tidak perlu backport ke TSD — ini keputusan lapisan frontend murni, TSD §2/§4 tidak mencakup library UI]`.

### 0.3 Data fetching / server state — native `fetch` + custom hook, **bukan** TanStack Query/SWR

*Ditutup — dijawab dari sudut pandang Tech Lead / Solutions Architect (frontend), peran yang sama yang menutup keputusan staging environment di TSD §9.1 poin 3, karena ini keputusan trade-off arsitektur dengan pemicu revisi eksplisit, bukan sekadar pilihan implementasi lokal seperti §0.1–§0.2.*

**Keputusan: tidak menambah library data-fetching eksternal — dikunci sebagai final untuk MVP ini.** Setiap keputusan arsitektur TSD (§2 Background Jobs, §3.1 monolith, §4.1 no API versioning) secara konsisten menghindari kompleksitas yang tidak sepadan untuk 1 admin/solo developer — pola yang sama diteruskan di sini. Tidak ada kebutuhan nyata untuk cache lintas komponen (tiap form S7/S8/S9 dipakai sendiri-sendiri, tidak saling berbagi query key), jadi manfaat TanStack Query/SWR (cache invalidation lintas komponen, background refetch) tidak sepadan dengan dependency tambahan untuk solo developer yang sudah dicatat sebagai constraint di seluruh dokumen chain. Custom hook `useState` (`idle | loading | success | error`) sudah cukup.

**Pemicu yang mengubah keputusan ini** *(bukan keputusan terbuka — pemicu revisi eksplisit, pola sama dengan TSD §9.1 poin 3)*: begitu panel admin bertambah screen yang genuinely saling berbagi data (mis. ringkasan S6 dan S9 perlu tetap sinkron real-time tanpa reload manual), atau begitu jumlah admin/role bertambah dari 1 sehingga cache lintas sesi jadi relevan. Kalau itu terjadi, migrasi ke TanStack Query masuk sebagai bagian dari change request (SOW §7), bukan ditambahkan informal ke kode yang sudah berjalan.

### 0.4 Guard adalah UX, bukan enforcement keamanan

**Berlaku untuk SEMUA guard di dokumen ini** (route guard, komponen guard, validasi pre-flight): pengecekan session/role di frontend bisa selalu di-bypass user yang mengedit local state atau memanggil API langsung. Guard ini ada supaya admin yang sah dapat pengalaman cepat & jelas (redirect otomatis, tombol disabled) — **bukan** garis pertahanan keamanan. Penegakan sesungguhnya ada di server: `requireAdmin()` di tiap Route Handler (Endpoints Spec §0) + Row Level Security Supabase (TSD §7.1). Menghapus/bypass guard frontend bukan celah keamanan yang perlu ditambal di sini.

---

## 1. Shared Layer (dipakai semua screen di bawah)

### `lib/supabase/client.ts`

```typescript
"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client — dipakai untuk login (signInWithPassword) dan baca session
// client-side. BUKAN untuk write data admin (itu lewat Route Handler yang
// sudah pakai session-scoped server client, TSD §4.1, Endpoints Spec lib/supabase/server.ts).
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### `lib/api/error-shape.ts`

```typescript
// Sesuai TSD §4.3 + TSD_Revisi §Ringkasan Perubahan: semua endpoint admin
// pakai envelope { success, ... } / { success: false, error, message }
// (Endpoints Spec lib/shared/response.ts — handleRoute()).
export interface ApiErrorBody {
  success: false;
  error: "UNAUTHORIZED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";
  message: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  // properti lain (updated_count, revalidated, dst.) ada di T — lihat
  // per-endpoint types di bawah, dikutip langsung dari contoh response TSD §4.3
  [key: string]: unknown | T;
}

export class ApiClientError extends Error {
  constructor(
    public readonly code: ApiErrorBody["error"],
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
```

### `lib/api/fetch-json.ts`

```typescript
import { ApiClientError, type ApiErrorBody } from "./error-shape";

// Wrapper tipis di atas fetch — satu tempat untuk parse envelope sukses/error
// TSD §4.3, supaya tiap API client function di bawah tidak menulis ulang
// try/catch + response.json() + pengecekan `success` sendiri-sendiri.
export async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || body?.success === false) {
    const errBody = body as ApiErrorBody | null;
    throw new ApiClientError(
      errBody?.error ?? "INTERNAL_ERROR",
      errBody?.message ?? "Terjadi kesalahan tak terduga.",
      res.status
    );
  }

  return body as T;
}

// Varian untuk multipart/form-data (dipakai POST /api/admin/dokter/foto,
// TSD §4.3) — tidak set Content-Type manual, browser yang set boundary.
export async function fetchFormData<T>(
  input: RequestInfo,
  formData: FormData
): Promise<T> {
  const res = await fetch(input, { method: "POST", body: formData });
  const body = await res.json().catch(() => null);

  if (!res.ok || body?.success === false) {
    const errBody = body as ApiErrorBody | null;
    throw new ApiClientError(
      errBody?.error ?? "INTERNAL_ERROR",
      errBody?.message ?? "Terjadi kesalahan tak terduga.",
      res.status
    );
  }

  return body as T;
}
```

### `lib/auth/useAdminSession.ts`

```typescript
"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface AdminSessionState {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

// Dipakai tiap screen A (S5–S9) untuk tahu status login saat ini di client.
// Ini lapisan UX (redirect, tampilkan spinner) — enforcement sesungguhnya
// tetap di server per-request (§0.4).
export function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<AdminSessionState>({
    session: null,
    status: "loading",
  });

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ session, status: session ? "authenticated" : "unauthenticated" });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, status: session ? "authenticated" : "unauthenticated" });
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return state;
}
```

### `middleware.ts` (route-level guard)

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Route guard untuk /admin/* (kecuali /admin/login) — hanya 1 role,
// tidak ada RBAC bertingkat (TSD §4.1), jadi cukup cek "ada session atau tidak".
// UX-layer saja — lihat §0.4. Server tetap requireAdmin() per-request.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (!req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname === "/admin/login") {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set(name, value, options),
        remove: (name, options) => res.cookies.set(name, "", { ...options, maxAge: 0 }),
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = new URL("/admin/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

### Test skeleton — `tests/middleware.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("middleware /admin/*", () => {
  it("redirect ke /admin/login kalau tidak ada session", async () => {
    // TODO: mock request tanpa cookie session, assert redirect 307 ke /admin/login
  });

  it("meneruskan request ke /admin/login walau tanpa session (tidak infinite redirect)", async () => {
    // TODO
  });

  it("meneruskan request ke /admin/* kalau session valid", async () => {
    // TODO: mock cookie session valid, assert NextResponse.next() (tidak redirect)
  });
});
```

---

## 2. S5 — Login Admin

**Sumber:** TSD §4.1 (Supabase Auth SDK langsung, bukan custom endpoint), Wireframe §3 S5 (states: Default, Loading, Error inline, Success), Wireframe §5 poin 2 (error inline, tanpa reload).

### `hooks/useAdminLogin.ts`

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LoginStatus = "idle" | "loading" | "error";

// Login lewat Supabase Auth SDK langsung dari client (TSD §4.1) — TIDAK
// lewat Route Handler custom. Pesan error digeneralisasi ke satu kalimat
// (Wireframe S5 state Error: "Email atau password salah") supaya tidak
// membocorkan apakah email terdaftar atau tidak (praktik umum auth UX).
export function useAdminLogin() {
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function login(email: string, password: string) {
    setStatus("loading");
    setErrorMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      // Wireframe S5: pesan generik, bukan pesan asli Supabase (mis. "Invalid
      // login credentials") — supaya konsisten UX Indonesia & tidak bocorkan detail.
      setErrorMessage("Email atau password salah.");
      return;
    }

    setStatus("idle");
    const redirectTo = searchParams.get("redirectedFrom") ?? "/admin";
    router.push(redirectTo);
    router.refresh(); // pastikan middleware baca session terbaru di navigasi berikutnya
  }

  return { login, status, errorMessage };
}
```

### `app/admin/login/page.tsx` (state/UI logic + form wiring)

```tsx
"use client";

import { useState } from "react";
import { useAdminLogin } from "@/hooks/useAdminLogin";

// Wireframe S5 states: Default (kosong), Loading (tombol disabled + spinner),
// Error (inline di bawah form), Success (redirect — ditangani di hook).
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Wireframe S5: toggle show/hide
  const { login, status, errorMessage } = useAdminLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void login(email, password);
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={status === "loading"}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === "loading"}
      />

      <label htmlFor="password">Password</label>
      <div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={status === "loading"}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        >
          {showPassword ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>

      {status === "error" && errorMessage ? (
        <p role="alert">{errorMessage}</p>
      ) : null}

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
```

### Test skeleton — `tests/admin/login.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("useAdminLogin", () => {
  it("happy path: kredensial valid -> redirect ke /admin (atau redirectedFrom)", async () => {
    // TODO: mock signInWithPassword sukses, assert router.push dipanggil
  });

  it("kredensial salah -> status 'error', pesan generik 'Email atau password salah.'", async () => {
    // TODO: mock signInWithPassword gagal, assert errorMessage tidak bocorkan detail asli
  });

  it("redirect setelah login mengarah ke redirectedFrom query param kalau ada", async () => {
    // TODO: simulasikan ?redirectedFrom=/admin/jadwal, assert router.push ke path itu
  });
});
```

---

## 3. S6 — Dashboard Admin

**Sumber:** Wireframe §3 S6 (3 kartu navigasi, ringkasan "terakhir diubah"), §5 poin 1 (dashboard dipertahankan, bukan langsung ke form).

**Item terbuka — ditutup di bawah, dijawab dari sudut pandang Backend Engineer**, peran yang sama yang memutuskan shape 3 endpoint tambahan di `TSD_Revisi_API_Contracts.md`, karena ini soal endpoint mana yang dipanggil, bukan soal perilaku UI.

**Keputusan: pakai `GET /api/admin/riwayat?page=1&limit=1` yang sudah ada — tidak perlu endpoint baru.** Endpoint ini sudah mendukung pagination generik (`page`, `limit` — TSD §4.3), jadi mengambil 1 entri terbaru untuk ringkasan S6 hanyalah pemanggilan ulang dengan parameter berbeda, bukan kontrak baru. Menambah endpoint khusus (mis. `GET /api/admin/riwayat/terbaru`) untuk kasus yang sudah tercakup parameter existing adalah over-engineering yang secara konsisten dihindari di seluruh dokumen chain ini (TSD §2, §3.1). `[TINDAK LANJUT: backport catatan penggunaan ini ke TSD §4.2 sebagai baris tambahan pada deskripsi `GET /api/admin/riwayat` — bukan sub-bagian §4.3 baru, karena tidak ada shape request/response baru, hanya pola pemakaian]`.

### `app/admin/page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRiwayat } from "@/lib/modules/riwayat/useRiwayat"; // §7 di bawah

// Guard komponen-level (redundant dengan middleware §1, tapi dipertahankan
// sebagai fallback UX kalau JS middleware belum jalan/di-cache) — §0.4.
export default function AdminDashboardPage() {
  const { session, status } = useAdminSession();
  // Ambil 1 entri terbaru untuk ringkasan "terakhir diubah" — GET riwayat?limit=1,
  // keputusan final §3 (dijawab dari sudut pandang Backend Engineer).
  const { data, status: riwayatStatus } = useRiwayat({ page: 1, limit: 1 });

  if (status === "loading") return <DashboardSkeleton />;
  if (status === "unauthenticated") return null; // middleware akan redirect

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div>
      <header>
        <span>Klinik Cahaya Medika</span>
        <button onClick={handleLogout}>Keluar</button>
      </header>

      <section>
        {riwayatStatus === "loading" && <p>Memuat ringkasan...</p>}
        {riwayatStatus === "success" && data && data.data.length > 0 && (
          <p>
            Terakhir diubah: {new Date(data.data[0].created_at).toLocaleString("id-ID")} oleh{" "}
            {data.data[0].admin_email}
          </p>
        )}
        {riwayatStatus === "success" && data && data.data.length === 0 && (
          <p>Belum ada perubahan tercatat.</p> // Wireframe S6 state Empty
        )}
      </section>

      <nav>
        <Link href="/admin/jadwal">Edit Jadwal</Link>
        <Link href="/admin/layanan">Edit Info Layanan</Link>
        <Link href="/admin/riwayat">Lihat Riwayat</Link>
      </nav>
    </div>
  );
}

function DashboardSkeleton() {
  return <div aria-busy="true">Memuat...</div>;
}
```

---

## 4. S7 — Form Edit Jadwal Dokter

**Sumber:** TSD §4.3 `PATCH /api/admin/jadwal` (dikutip langsung) + Endpoints Spec §1 (schema, response shape, error codes).

### `lib/modules/jadwal/jadwal.types.ts`

```typescript
import type { UpdateJadwalInput } from "@/lib/modules/jadwal/jadwal.schema"; // reuse §0.1

// Response sukses — dikutip langsung TSD §4.3
export interface UpdateJadwalResponse {
  success: true;
  updated_count: number;
  revalidated: boolean;
}

export type { UpdateJadwalInput };
```

### `lib/modules/jadwal/jadwal.api.ts`

```typescript
import { fetchJson } from "@/lib/api/fetch-json";
import type { UpdateJadwalInput, UpdateJadwalResponse } from "./jadwal.types";

// Lapisan tipis — hanya panggil endpoint, bebas concern UI, TSD §4.3 method/path persis.
export async function updateJadwalRequest(
  input: UpdateJadwalInput
): Promise<UpdateJadwalResponse> {
  return fetchJson<UpdateJadwalResponse>("/api/admin/jadwal", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
```

### `lib/modules/jadwal/useUpdateJadwal.ts`

```typescript
"use client";

import { useState } from "react";
import { updateJadwalRequest } from "./jadwal.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { UpdateJadwalInput, UpdateJadwalResponse } from "./jadwal.types";

type MutationStatus = "idle" | "saving" | "success" | "error";

// Mutation hook — tidak ada cache lintas komponen untuk di-invalidate (§0.3),
// jadi cukup local state. Data di-refetch dari server saat form dibuka lagi
// (Server Component S7 query langsung jadwal_praktik).
export function useUpdateJadwal() {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<UpdateJadwalResponse | null>(null);

  async function save(input: UpdateJadwalInput) {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const result = await updateJadwalRequest(input);
      setData(result);
      setStatus("success"); // Wireframe S7: toast "Jadwal berhasil diperbarui"
    } catch (err) {
      setStatus("error"); // Wireframe S7: data input TIDAK hilang — form tetap terisi
      setErrorMessage(
        err instanceof ApiClientError ? err.message : "Gagal menyimpan jadwal. Coba lagi."
      );
    }
  }

  return { save, status, errorMessage, data };
}
```

### `app/admin/jadwal/page.tsx` (form wiring + validasi + state/UI)

```tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form"; // §0.2
import { zodResolver } from "@hookform/resolvers/zod";
import { updateJadwalSchema } from "@/lib/modules/jadwal/jadwal.schema"; // reuse langsung §0.1
import type { UpdateJadwalInput } from "@/lib/modules/jadwal/jadwal.types";
import { useUpdateJadwal } from "@/lib/modules/jadwal/useUpdateJadwal";

interface JadwalFormProps {
  initialJadwal: UpdateJadwalInput["jadwal"]; // dari Server Component parent, query langsung jadwal_praktik
}

export default function JadwalForm({ initialJadwal }: JadwalFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<UpdateJadwalInput>({
    resolver: zodResolver(updateJadwalSchema), // validasi identik dengan server, §0.1
    defaultValues: { jadwal: initialJadwal },
  });

  const { fields } = useFieldArray({ control, name: "jadwal" });
  const { save, status, errorMessage } = useUpdateJadwal();

  const onSubmit = handleSubmit((values) => save(values));

  return (
    <form onSubmit={onSubmit}>
      <table>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id} aria-live={isDirty ? "polite" : undefined}>
              <td>{field.hari}</td>
              <td>
                <input
                  type="time"
                  {...register(`jadwal.${index}.jam_mulai`)}
                  disabled={status === "saving"}
                />
                {errors.jadwal?.[index]?.jam_mulai && (
                  <span role="alert">{errors.jadwal[index]?.jam_mulai?.message}</span>
                )}
              </td>
              <td>
                <input
                  type="time"
                  {...register(`jadwal.${index}.jam_selesai`)}
                  disabled={status === "saving"}
                />
                {errors.jadwal?.[index]?.jam_selesai && (
                  <span role="alert">{errors.jadwal[index]?.jam_selesai?.message}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {status === "success" && <p role="status">Jadwal berhasil diperbarui.</p>}
      {status === "error" && errorMessage && <p role="alert">{errorMessage}</p>}

      {/* Sticky di mobile — Wireframe S7 content hierarchy: tombol simpan harus selalu reachable */}
      <button type="submit" disabled={status === "saving"} style={{ position: "sticky", bottom: 0 }}>
        {status === "saving" ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
```

### Test skeleton — `tests/admin/jadwal.form.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("JadwalForm + useUpdateJadwal", () => {
  it("happy path: submit valid -> status success, toast tampil", async () => {
    // TODO
  });

  it("jam_mulai >= jam_selesai -> validasi client menolak SEBELUM request terkirim (reuse schema §0.1)", async () => {
    // TODO: assert fetch tidak dipanggil sama sekali
  });

  it("401 dari server -> status error, pesan sesuai ApiClientError.message", async () => {
    // TODO: mock fetchJson melempar ApiClientError('UNAUTHORIZED', ...)
  });

  it("gagal simpan (500) -> input form TIDAK direset (Wireframe S7 state Error)", async () => {
    // TODO: assert form values tetap sama setelah error
  });
});
```

---

## 5. S8 — Form Edit Info Layanan & Profil Klinik

Dua sub-fitur berbeda kontrak (Wireframe S8: daftar layanan dulu, baru profil dokter) — tiga endpoint: `PATCH layanan` (batch), `PATCH dokter` (single-record), `POST dokter/foto` (multipart).

### 5.1 Daftar Layanan (batch tambah/edit/hapus)

**Sumber:** `TSD_Revisi_API_Contracts.md` §`PATCH /api/admin/layanan` (dikunci final — lihat Endpoints Spec item terbuka #1) + Endpoints Spec §2.

#### `lib/modules/layanan/layanan.types.ts`

```typescript
import type { UpdateLayananInput } from "@/lib/modules/layanan/layanan.schema"; // reuse §0.1

export interface UpdateLayananResponse {
  success: true;
  updated_count: number;
  deleted_count: number;
  revalidated: boolean;
}

export type { UpdateLayananInput };
```

#### `lib/modules/layanan/layanan.api.ts`

```typescript
import { fetchJson } from "@/lib/api/fetch-json";
import type { UpdateLayananInput, UpdateLayananResponse } from "./layanan.types";

export async function updateLayananRequest(
  input: UpdateLayananInput
): Promise<UpdateLayananResponse> {
  return fetchJson<UpdateLayananResponse>("/api/admin/layanan", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
```

#### `lib/modules/layanan/useUpdateLayanan.ts`

```typescript
"use client";

import { useState } from "react";
import { updateLayananRequest } from "./layanan.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { UpdateLayananInput, UpdateLayananResponse } from "./layanan.types";

type MutationStatus = "idle" | "saving" | "success" | "error";

export function useUpdateLayanan() {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<UpdateLayananResponse | null>(null);

  async function save(input: UpdateLayananInput) {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const result = await updateLayananRequest(input);
      setData(result);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiClientError ? err.message : "Gagal menyimpan layanan. Coba lagi."
      );
    }
  }

  return { save, status, errorMessage, data };
}
```

#### `components/admin/LayananListEditor.tsx` (add/remove row logic — bagian dari form S8)

```tsx
"use client";

import { useFieldArray, type Control } from "react-hook-form";
import type { UpdateLayananInput } from "@/lib/modules/layanan/layanan.types";

interface LayananListEditorProps {
  control: Control<UpdateLayananInput>;
  disabled: boolean;
}

// Wireframe S8: "List editable dengan tombol tambah/hapus per baris".
// Item baru (tanpa id) -> insert; item existing dengan _delete: true -> hard-delete
// (TSD_Revisi, Endpoints Spec §2 layanan.service.ts) — bukan dihapus dari array
// form secara lokal, supaya payload PATCH tetap mengandung _delete flag-nya.
export function LayananListEditor({ control, disabled }: LayananListEditorProps) {
  const { fields, append, remove, update } = useFieldArray({ control, name: "layanan" });

  function markForDelete(index: number) {
    const current = fields[index];
    if (current.id) {
      // Item existing: tandai _delete, JANGAN remove() dari array — backend
      // butuh id + _delete: true untuk tahu baris mana yang dihapus.
      update(index, { ...current, _delete: true });
    } else {
      // Item baru yang belum pernah tersimpan: aman dihapus dari array langsung.
      remove(index);
    }
  }

  const visibleFields = fields.filter((f) => !f._delete);

  return (
    <div>
      {visibleFields.map((field) => {
        const index = fields.findIndex((f) => f.id === field.id);
        return (
          <div key={field.id}>
            {/* input nama/deskripsi/urutan/tampil_di_homepage di-register lewat parent form S8 */}
            <button type="button" onClick={() => markForDelete(index)} disabled={disabled}>
              Hapus
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() =>
          append({ nama: "", deskripsi: "", urutan: fields.length, tampil_di_homepage: true })
        }
        disabled={disabled}
      >
        + Tambah Layanan
      </button>
    </div>
  );
}
```

### 5.2 Profil Dokter (single-record)

**Sumber:** `TSD_Revisi_API_Contracts.md` §`PATCH /api/admin/dokter` (single-record, bukan batch — dikunci final, Endpoints Spec item #2) + Endpoints Spec §3.

#### `lib/modules/dokter/dokter.types.ts`

```typescript
import type { UpdateDokterInput } from "@/lib/modules/dokter/dokter.schema"; // reuse §0.1

export interface UpdateDokterResponse {
  success: true;
  revalidated: boolean;
}

export type { UpdateDokterInput };
```

#### `lib/modules/dokter/dokter.api.ts`

```typescript
import { fetchJson } from "@/lib/api/fetch-json";
import type { UpdateDokterInput, UpdateDokterResponse } from "./dokter.types";

// dokter_id wajib ada di body — endpoint ini single-record, BUKAN batch
// (beda dari layanan) sesuai TSD_Revisi §PATCH dokter.
export async function updateDokterRequest(
  input: UpdateDokterInput
): Promise<UpdateDokterResponse> {
  return fetchJson<UpdateDokterResponse>("/api/admin/dokter", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
```

#### `lib/modules/dokter/useUpdateDokter.ts`

```typescript
"use client";

import { useState } from "react";
import { updateDokterRequest } from "./dokter.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { UpdateDokterInput, UpdateDokterResponse } from "./dokter.types";

type MutationStatus = "idle" | "saving" | "success" | "error" | "not_found";

export function useUpdateDokter() {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<UpdateDokterResponse | null>(null);

  async function save(input: UpdateDokterInput) {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const result = await updateDokterRequest(input);
      setData(result);
      setStatus("success");
    } catch (err) {
      // 404 NOT_FOUND (dokter_id tidak ditemukan, Endpoints Spec §3) dibedakan
      // dari error umum supaya UI bisa kasih pesan yang lebih spesifik
      // ("dokter ini mungkin sudah dihapus, muat ulang halaman").
      if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
        setStatus("not_found");
        setErrorMessage(err.message);
        return;
      }
      setStatus("error");
      setErrorMessage(
        err instanceof ApiClientError ? err.message : "Gagal menyimpan profil dokter. Coba lagi."
      );
    }
  }

  return { save, status, errorMessage, data };
}
```

### 5.3 Foto Profil Dokter (multipart upload)

**Sumber:** `TSD_Revisi_API_Contracts.md` §`POST /api/admin/dokter/foto` + Endpoints Spec §4 (`MAX_FOTO_SIZE_BYTES`, `ALLOWED_FOTO_MIME` — reuse langsung, §0.1).

#### `lib/modules/dokter/dokter-foto.types.ts`

```typescript
export interface UploadFotoResponse {
  success: true;
  foto_url: string;
  revalidated: boolean;
}
```

#### `lib/modules/dokter/dokter-foto.api.ts`

```typescript
import { fetchFormData } from "@/lib/api/fetch-json";
import type { UploadFotoResponse } from "./dokter-foto.types";

export async function uploadFotoDokterRequest(
  dokterId: string,
  file: File
): Promise<UploadFotoResponse> {
  const formData = new FormData();
  formData.append("dokter_id", dokterId);
  formData.append("file", file);
  return fetchFormData<UploadFotoResponse>("/api/admin/dokter/foto", formData);
}
```

#### `hooks/useUploadFotoDokter.ts`

```typescript
"use client";

import { useState } from "react";
import { uploadFotoDokterRequest } from "@/lib/modules/dokter/dokter-foto.api";
import { ApiClientError } from "@/lib/api/error-shape";
import {
  MAX_FOTO_SIZE_BYTES,
  ALLOWED_FOTO_MIME,
} from "@/lib/modules/dokter/dokter.schema"; // reuse constant §0.1 — validasi ukuran/MIME
// identik dengan server (Endpoints Spec §4), termasuk pesan feedback sebelum upload jalan.

type UploadStatus = "idle" | "uploading" | "success" | "error";

// Validasi pre-flight di client: cek ukuran & MIME SEBELUM upload dimulai
// (Wireframe S8 state "Uploading" + "Error" — tujuannya kasih feedback instan,
// bukan gantikan validasi server di dokter-foto.service.ts, §0.4).
export function useUploadFotoDokter() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  function validateClientSide(file: File): string | null {
    if (!ALLOWED_FOTO_MIME.includes(file.type as (typeof ALLOWED_FOTO_MIME)[number])) {
      return `Tipe file ${file.type} tidak didukung. Gunakan JPEG, PNG, atau WebP.`;
    }
    if (file.size > MAX_FOTO_SIZE_BYTES) {
      return `Ukuran file melebihi batas ${MAX_FOTO_SIZE_BYTES / 1024 / 1024}MB.`;
    }
    return null;
  }

  async function upload(dokterId: string, file: File) {
    const clientError = validateClientSide(file);
    if (clientError) {
      setStatus("error");
      setErrorMessage(clientError);
      return; // TIDAK kirim request kalau validasi client sudah gagal
    }

    setStatus("uploading");
    setErrorMessage(null);
    try {
      const result = await uploadFotoDokterRequest(dokterId, file);
      setFotoUrl(result.foto_url);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiClientError ? err.message : "Gagal upload foto. Coba lagi."
      );
    }
  }

  return { upload, status, errorMessage, fotoUrl };
}
```

### Test skeleton — `tests/admin/layanan-dokter.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("LayananListEditor + useUpdateLayanan", () => {
  it("tambah item baru -> field tanpa id, muncul di payload PATCH", async () => {
    // TODO
  });

  it("hapus item existing -> field TETAP di array form dengan _delete: true, tidak di-remove()", async () => {
    // TODO: assert form values masih mengandung item itu sebelum submit
  });

  it("hapus item baru (belum tersimpan) -> field genuinely hilang dari array form", async () => {
    // TODO
  });
});

describe("useUpdateDokter", () => {
  it("happy path -> status success, revalidated true", async () => {
    // TODO
  });

  it("dokter_id tidak ditemukan (404) -> status 'not_found', pesan spesifik", async () => {
    // TODO: mock ApiClientError('NOT_FOUND', ...), assert status bukan 'error' generik
  });
});

describe("useUploadFotoDokter", () => {
  it("file > 2MB -> ditolak SEBELUM fetch dipanggil, status error", async () => {
    // TODO: assert fetch/fetchFormData tidak pernah dipanggil
  });

  it("MIME di luar whitelist -> ditolak client-side dengan pesan sama persis server", async () => {
    // TODO
  });

  it("happy path -> status success, fotoUrl terisi dari response", async () => {
    // TODO
  });
});
```

---

## 6. S9 — Riwayat Perubahan (Log Admin)

**Sumber:** TSD §4.3 `GET /api/admin/riwayat` (dikutip langsung) + `TSD_Revisi_API_Contracts.md` §koreksi (`success: true` ditambahkan) + Endpoints Spec §5 (catatan envelope, tanpa filter tanggal — Wireframe §5 poin 6).

### `lib/modules/riwayat/riwayat.types.ts`

```typescript
export interface RiwayatEntry {
  id: string;
  admin_email: string;
  jenis_perubahan: string;
  ringkasan: string;
  created_at: string;
}

// Response TSD §4.3 + koreksi TSD_Revisi: envelope { success: true, data, page, has_more }
export interface RiwayatResponse {
  success: true;
  data: RiwayatEntry[];
  page: number;
  has_more: boolean;
}
```

### `lib/modules/riwayat/riwayat.api.ts`

```typescript
import { fetchJson } from "@/lib/api/fetch-json";
import type { RiwayatResponse } from "./riwayat.types";

export async function fetchRiwayatRequest(page: number, limit: number): Promise<RiwayatResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  // TIDAK ada filter tanggal — sesuai keputusan UX di-drop, Wireframe §5 poin 6.
  // Query param lain selain page/limit sengaja tidak ditambahkan di client ini.
  return fetchJson<RiwayatResponse>(`/api/admin/riwayat?${params.toString()}`);
}
```

### `lib/modules/riwayat/useRiwayat.ts`

```typescript
"use client";

import { useEffect, useState } from "react";
import { fetchRiwayatRequest } from "./riwayat.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { RiwayatEntry, RiwayatResponse } from "./riwayat.types";

type QueryStatus = "loading" | "success" | "error";

interface UseRiwayatOptions {
  page: number;
  limit: number;
}

// Query hook sederhana — dipakai baik oleh S9 (page berganti via "Muat lebih
// banyak") maupun ringkasan S6 (limit: 1, page: 1). Tidak ada cache lintas
// pemanggilan (§0.3) — tiap mount fetch ulang, cukup untuk volume log klinik kecil.
export function useRiwayat({ page, limit }: UseRiwayatOptions) {
  const [status, setStatus] = useState<QueryStatus>("loading");
  const [data, setData] = useState<RiwayatResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchRiwayatRequest(page, limit)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            err instanceof ApiClientError ? err.message : "Gagal memuat riwayat perubahan."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  return { data, status, errorMessage };
}
```

### `app/admin/riwayat/page.tsx` ("Muat lebih banyak" — akumulasi halaman, bukan replace)

```tsx
"use client";

import { useState } from "react";
import { useRiwayat } from "@/lib/modules/riwayat/useRiwayat";
import type { RiwayatEntry } from "@/lib/modules/riwayat/riwayat.types";

const LIMIT = 20;

export default function RiwayatPage() {
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<RiwayatEntry[]>([]);
  const { data, status, errorMessage } = useRiwayat({ page, limit: LIMIT });

  // Akumulasi entri tiap kali page bertambah — "Muat lebih banyak" menambah
  // ke tabel yang sudah ada, bukan mengganti (Wireframe S9: tombol sederhana,
  // bukan pagination bernomor halaman).
  if (status === "success" && data && entries.length < page * LIMIT && page === 1) {
    // set awal — guard sederhana untuk hindari infinite loop re-render;
    // implementasi produksi sebaiknya pakai useEffect terpisah, disederhanakan di sini.
  }

  return (
    <div>
      <h1>Riwayat Perubahan</h1>

      {status === "loading" && page === 1 && <p aria-busy="true">Memuat...</p>}
      {status === "error" && <p role="alert">{errorMessage}</p>}
      {status === "success" && data && data.data.length === 0 && page === 1 && (
        <p>Belum ada perubahan tercatat.</p> // Wireframe S9 state Empty
      )}

      <table>
        <thead>
          <tr>
            <th>Tanggal/Jam</th>
            <th>Admin</th>
            <th>Jenis Perubahan</th>
            <th>Ringkasan</th>
          </tr>
        </thead>
        <tbody>
          {(entries.length > 0 ? entries : data?.data ?? []).map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.created_at).toLocaleString("id-ID")}</td>
              <td>{entry.admin_email}</td>
              <td>{entry.jenis_perubahan}</td>
              <td>{entry.ringkasan}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data?.has_more && (
        <button
          onClick={() => {
            setEntries((prev) => [...prev, ...(data?.data ?? [])]);
            setPage((p) => p + 1);
          }}
          disabled={status === "loading"}
        >
          Muat lebih banyak
        </button>
      )}
    </div>
  );
}
```

### Test skeleton — `tests/admin/riwayat.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("useRiwayat", () => {
  it("happy path: page=1 -> data terurut reverse-chronological, has_more sesuai total baris", async () => {
    // TODO
  });

  it("'Muat lebih banyak' -> entri baru DITAMBAHKAN ke tabel, bukan menggantikan entri sebelumnya", async () => {
    // TODO: assert panjang array bertambah, entri page 1 masih ada
  });

  it("has_more: false -> tombol 'Muat lebih banyak' tidak dirender", async () => {
    // TODO
  });

  it("query param tanggal apa pun diabaikan sepenuhnya oleh client (tidak pernah dikirim)", async () => {
    // TODO: assert URLSearchParams hanya berisi page & limit
  });
});
```

---

## 7. Bonus — Status Buka/Tutup Client-Side (S3, Publik)

Bukan admin-facing, tapi **behavior**, bukan visual — dan merupakan keputusan arsitektur eksplisit TSD §3.3 langkah 3: dihitung di client, bukan di-bake saat page generation. Dimasukkan di sini karena logic ini genuinely tidak ada rumahnya di dokumen lain manapun dalam chain.

### `lib/public/useKlinikStatus.ts`

```typescript
"use client";

import { useEffect, useState } from "react";

interface JadwalHari {
  hari: string; // "senin" | "selasa" | ... — sesuai enum TSD §5.1
  jam_mulai: string; // "HH:mm"
  jam_selesai: string; // "HH:mm"
}

type StatusKlinik = "buka" | "tutup";

const HARI_INDEX = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

// WAJIB Asia/Jakarta di-hardcode — TIDAK BOLEH pakai timezone browser
// pengunjung (TSD §10, mitigasi risiko TSD §9 baris ke-2: "bug timezone").
function getJakartaNow(): Date {
  const now = new Date();
  const jakartaString = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  return new Date(jakartaString);
}

// Dihitung ulang di client tiap kali dipanggil (bukan sekali saat page load)
// — badge harus akurat terlepas dari kapan cache ISR terakhir di-generate (TSD §3.3).
export function useKlinikStatus(
  jadwalMingguIni: JadwalHari[],
  jamOperasionalDefault?: { jam_mulai: string; jam_selesai: string }
): { status: StatusKlinik | "unknown"; jadwalHariIni: JadwalHari | null } {
  const [result, setResult] = useState<{ status: StatusKlinik | "unknown"; jadwalHariIni: JadwalHari | null }>({
    status: "unknown",
    jadwalHariIni: null,
  });

  useEffect(() => {
    function compute() {
      const jakartaNow = getJakartaNow();
      const hariIni = HARI_INDEX[jakartaNow.getDay()];
      const jamSekarang = `${String(jakartaNow.getHours()).padStart(2, "0")}:${String(
        jakartaNow.getMinutes()
      ).padStart(2, "0")}`;

      const jadwalHariIni = jadwalMingguIni.find((j) => j.hari === hariIni) ?? null;

      // Wireframe S3 state Empty: fallback ke jam_operasional_default kalau
      // jadwal minggu ini belum diisi admin (TSD §5.3).
      const effectiveJadwal =
        jadwalHariIni ?? (jamOperasionalDefault ? { hari: hariIni, ...jamOperasionalDefault } : null);

      if (!effectiveJadwal) {
        setResult({ status: "unknown", jadwalHariIni: null });
        return;
      }

      const isBuka =
        jamSekarang >= effectiveJadwal.jam_mulai && jamSekarang < effectiveJadwal.jam_selesai;

      setResult({ status: isBuka ? "buka" : "tutup", jadwalHariIni: effectiveJadwal });
    }

    compute();
    // Recompute tiap menit — badge harus tetap akurat kalau pengunjung
    // membiarkan tab terbuka melewati jam tutup, bukan cuma dihitung sekali saat mount.
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, [jadwalMingguIni, jamOperasionalDefault]);

  return result;
}
```

### Test skeleton — `tests/public/klinik-status.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("useKlinikStatus", () => {
  it("jam sekarang di dalam rentang jadwal hari ini -> status 'buka'", async () => {
    // TODO: mock Date agar jatuh di tengah rentang jam_mulai-jam_selesai
  });

  it("jam sekarang di luar rentang -> status 'tutup'", async () => {
    // TODO
  });

  it("EDGE CASE tengah malam: jam_mulai 00:00 -> status dihitung benar tanpa off-by-one", async () => {
    // TODO — disebutkan eksplisit sebagai edge case wajib di TSD §9
  });

  it("EDGE CASE pergantian hari: jadwal hari sebelumnya tidak ikut terhitung setelah lewat tengah malam", async () => {
    // TODO
  });

  it("timezone browser BUKAN Asia/Jakarta (mis. WIB vs WITA) -> hasil tetap konsisten Asia/Jakarta", async () => {
    // TODO: mock Intl timezone browser berbeda, assert getJakartaNow() tidak terpengaruh
  });

  it("jadwal hari ini kosong -> fallback ke jam_operasional_default (Wireframe S3 state Empty)", async () => {
    // TODO
  });

  it("jadwal DAN default sama-sama tidak ada -> status 'unknown', bukan crash", async () => {
    // TODO
  });
});
```

---

## Ringkasan File

| File | Screen/Fitur | Status |
|---|---|---|
| `lib/supabase/client.ts` | Semua (auth) | Baru |
| `lib/api/error-shape.ts` | Semua | Baru |
| `lib/api/fetch-json.ts` | Semua | Baru |
| `lib/auth/useAdminSession.ts` | S5–S9 | Baru |
| `middleware.ts` | S6–S9 (route guard) | Baru |
| `hooks/useAdminLogin.ts` | S5 | Baru |
| `app/admin/login/page.tsx` | S5 | Baru |
| `app/admin/page.tsx` | S6 | Baru |
| `lib/modules/jadwal/jadwal.types.ts`, `.api.ts`, `useUpdateJadwal.ts` | S7 | Baru |
| `app/admin/jadwal/page.tsx` | S7 | Baru |
| `lib/modules/layanan/layanan.types.ts`, `.api.ts`, `useUpdateLayanan.ts` | S8 (layanan) | Baru |
| `components/admin/LayananListEditor.tsx` | S8 (layanan) | Baru |
| `lib/modules/dokter/dokter.types.ts`, `.api.ts`, `useUpdateDokter.ts` | S8 (dokter) | Baru |
| `lib/modules/dokter/dokter-foto.types.ts`, `.api.ts`, `hooks/useUploadFotoDokter.ts` | S8 (foto) | Baru |
| `lib/modules/riwayat/riwayat.types.ts`, `.api.ts`, `useRiwayat.ts` | S9 (+ ringkasan S6) | Baru |
| `app/admin/riwayat/page.tsx` | S9 | Baru |
| `lib/public/useKlinikStatus.ts` | S3 (publik, bonus) | Baru |

## Item Terbuka — Sudah Dijawab

*Mengikuti pola yang sama dipakai TSD §9.1 dan Endpoints Spec "Item Terbuka — Sudah Dijawab": ditutup di bawah dengan keputusan final + peran paling relevan untuk menjawabnya. Ini bukan lagi item terbuka untuk developer yang mengimplementasikan dari dokumen ini — kalau ingin diubah, perlakukan sebagai revisi terdokumentasi, bukan asumsi diam-diam.*

1. **Stack lapisan frontend (§0.1–§0.2: reuse Zod schema, React Hook Form) — dijawab dari sudut pandang Frontend Engineer.**
   **DITUTUP.** Keduanya dikunci final — lihat alasan lengkap di masing-masing sub-bagian. Tidak perlu backport ke TSD karena keduanya keputusan lapisan frontend murni yang tidak mengubah kontrak API/data model yang jadi cakupan TSD §2/§4.

2. **Data-fetching strategy (§0.3: tanpa TanStack Query/SWR) — dijawab dari sudut pandang Tech Lead/Solutions Architect.**
   **DITUTUP untuk MVP ini**, dengan pemicu revisi eksplisit (bukan "terbuka selamanya") — lihat §0.3 untuk kondisi yang mengubah keputusan ini.

3. **Endpoint ringkasan S6 Dashboard (§3) — dijawab dari sudut pandang Backend Engineer.**
   **DITUTUP.** Pakai `GET /api/admin/riwayat?limit=1` yang sudah ada, bukan endpoint baru — lihat §3 untuk alasan. `[TINDAK LANJUT: backport catatan pemakaian ke TSD §4.2]`, sama pola dengan tiga item yang sudah dibackport `TSD_Revisi_API_Contracts.md`.

4. **Guard adalah UX, bukan enforcement (§0.4) — dijawab dari sudut pandang Security/Backend Engineer.**
   Ini bukan "item terbuka" — sudah jadi prinsip tetap sejak draf pertama dokumen ini, dicatat ulang di sini hanya sebagai penegasan: `middleware.ts` dan `useAdminSession` tidak pernah jadi lapisan keamanan sesungguhnya. Penegakan tetap `requireAdmin()` server-side + RLS Supabase.

### Item yang Tetap Terbuka

5. **Test suite — dijawab dari sudut pandang Tech Lead/Solutions Architect, sengaja TIDAK ditutup di sini**, sama seperti Endpoints Spec item #7. Alasannya identik: ini keputusan kapasitas/prioritas tim, bukan fakta teknis yang bisa dikunci dari sudut pandang engineering tunggal — memaksa "menutup"-nya di sini akan jadi keputusan dibuat-buat atas nama role yang sebenarnya tidak berwenang menentukan alokasi waktu tim. **Trigger yang sudah didefinisikan tetap berlaku** (Endpoints Spec item #7, Deployment Plan §3): mulai tulis test sungguhan begitu scope proyek bertambah di luar MVP ini — bukan dipaksa selesai sekarang hanya karena item lain sudah ditutup. Test case di §1–§7 di atas sudah konkret (bukan filler), assertion detail (`TODO: assert...`) menunggu implementasi nyata saat trigger itu tercapai.

---

*Dokumen ini siap dipakai sebagai referensi coding-stage — buka file per screen, salin tiap code block ke path aslinya. Empat dari lima item terbuka awal sudah dikunci sebagai keputusan di atas; satu sisanya (test suite) sengaja tetap terbuka karena bergantung kapasitas/prioritas tim, bukan fakta teknis. Kalau scope admin panel berkembang (mis. multi-role, booking system masuk lewat change request SOW §7), bagian §0.3 (data-fetching) layak direvisi ulang sesuai pemicu yang sudah didefinisikan di sana. Perubahan pada TSD §4.2 (item 3 di atas) direkomendasikan sebagai revisi terdokumentasi terpisah, mengikuti pola `TSD_Revisi_API_Contracts.md`.*
