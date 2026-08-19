# Klinik Cahaya Medika — Endpoint Implementation Spec

| Field | Detail |
|---|---|
| Versi Dokumen | v1.2 — direvisi dari v1.1 (framing status "test suite" item #7 diselaraskan dengan Backend Blueprint §10.2; catatan penutup diperbarui untuk mencerminkan bahwa Blueprint §6 item #3/#5 sudah diterapkan): backport upgrade Next.js 15 (PR #13) ke §0 `lib/supabase/server.ts`/`lib/auth/session.ts` dan seluruh contoh kode endpoint — `createServerSupabaseClient()` jadi async (`cookies()` async di Next 15), adapter cookie `get/set/remove` diganti `getAll/setAll` (deprecated di `@supabase/ssr`) |
| Referensi PRD | Landing Page Klinik Cahaya Medika, v1.1 |

> **Dokumen coding-stage**, bukan dokumen sign-off. Dibangun dari:
> - **Technical Spec** §4 (API Contracts) — kontrak method/path/auth/shape yang otoritatif
> - **Backend Blueprint** §4–§5 (Per-Module Blueprint + Endpoint-to-File Mapping) — file/class/layer yang otoritatif
> - **PRD v1.1** §4 (Modul 2, 3, 6) — business rules
>
> **Semua business logic bertanda `[ASUMSI]` di bawah wajib direview manusia sebelum merge** — TSD §4.3 hanya mendetailkan shape non-trivial untuk `PATCH /api/admin/jadwal` dan `GET /api/admin/riwayat`; tiga endpoint lain (`layanan`, `dokter`, `dokter/foto`) hanya punya baris ringkas di TSD §4.2, sehingga shape request persisnya diturunkan dari Blueprint §4 + PRD §4, bukan dikutip langsung dari kontrak API yang sudah dikunci. Cakupan dokumen ini: **5 endpoint admin**, dibangun sebagai satu batch sesuai keputusan blueprint (Zod validation, session-scoped Supabase client, response envelope bersama).

---

## 0. File Bersama (Cross-Cutting) — dipakai semua endpoint di bawah

Ini bukan endpoint tersendiri, tapi wajib ada lebih dulu karena tiap Route Handler di bawah memanggilnya.

### `lib/shared/errors.ts`

```typescript
// Kelas error terstandar — dipetakan ke HTTP status code lewat helper di response.ts,
// bukan if/else manual di tiap Route Handler (Backend Blueprint §7)

export class UnauthorizedError extends Error {
  readonly status = 401;
  readonly code = "UNAUTHORIZED";
  constructor(message = "Sesi admin tidak valid, silakan login ulang.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends Error {
  readonly status = 400;
  readonly code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  readonly status = 404;
  readonly code = "NOT_FOUND";
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class InternalError extends Error {
  readonly status = 500;
  readonly code = "INTERNAL_ERROR";
  constructor(message = "Terjadi kesalahan pada server.") {
    super(message);
    this.name = "InternalError";
  }
}

export type KnownError = UnauthorizedError | ValidationError | NotFoundError | InternalError;
```

### `lib/shared/response.ts`

```typescript
import { NextResponse } from "next/server";
import type { KnownError } from "./errors";

// Shape konsisten dengan contoh TSD §4.3: { success, ... } / { success: false, error, message }

export function successResponse<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(err: unknown) {
  if (isKnownError(err)) {
    return NextResponse.json(
      { success: false, error: err.code, message: err.message },
      { status: err.status }
    );
  }
  // Error tak terduga — jangan bocorkan detail internal ke client
  console.error("[unhandled-route-error]", err);
  return NextResponse.json(
    { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}

function isKnownError(err: unknown): err is KnownError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "code" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
}

// Wrapper try-catch bersama — dipanggil tiap Route Handler agar pola
// "validate -> requireAdmin -> service -> response" konsisten (Blueprint §7)
export async function handleRoute<T extends Record<string, unknown>>(
  fn: () => Promise<{ data: T; status?: number }>
) {
  try {
    const { data, status } = await fn();
    return successResponse(data, status);
  } catch (err) {
    return errorResponse(err);
  }
}
```

### `lib/shared/logger.ts`

```typescript
// Wrapper tipis di atas console.log/console.error, terstruktur JSON — cukup untuk
// dibaca lewat Vercel function logs (TSD §6, Deployment Plan §6). Tidak ada library
// eksternal — [ASUMSI: konsisten dengan keputusan anti-over-engineering TSD §2/§3.1,
// diwarisi dari Backend Blueprint §7]

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  event: string;
  [key: string]: unknown;
}

function log(level: LogLevel, event: string, meta: Record<string, unknown> = {}) {
  const payload: LogPayload = { level, event, timestamp: new Date().toISOString(), ...meta };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => log("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => log("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => log("error", event, meta),
};
```

### `lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Session-scoped client (konteks `authenticated`), BUKAN service_role —
// keputusan final Backend Blueprint §10.1 poin 2: RLS harus tetap jadi
// lapisan otorisasi kedua, bukan di-bypass oleh repository write.
//
// cookies() async sejak Next.js 15 (backport v1.2, PR #13) — getAll/setAll
// dipakai karena get/set/remove sudah deprecated di @supabase/ssr.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // Route Handler tidak perlu set cookie baru di sini
      },
    }
  );
}
```

### `lib/auth/session.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Session } from "@supabase/supabase-js";

// Ambil & validasi Supabase session dari request Route Handler — Blueprint §4 modul Auth
export async function verifySession(): Promise<Session | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ?? null;
}
```

### `lib/auth/guards.ts`

```typescript
import { verifySession } from "./session";
import { UnauthorizedError } from "@/lib/shared/errors";

// Satu-satunya guard yang perlu ada — hanya 1 role (admin), tidak ada RBAC
// bertingkat (Blueprint §7, TSD §4.1). Dipanggil di awal tiap Route Handler admin.
export async function requireAdmin() {
  const session = await verifySession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return { adminId: session.user.id, adminEmail: session.user.email ?? "" };
}
```

### `lib/revalidation/revalidate-public.ts`

```typescript
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/shared/logger";

// Membungkus revalidatePath('/') dalam try-catch — kegagalan TIDAK menggagalkan
// response sukses ke admin (write DB tetap dianggap berhasil), tapi tercatat di
// log untuk investigasi/retry manual. Keputusan final Blueprint §10.1 poin 4,
// mengimplementasikan mitigasi TSD §9 baris pertama.
export async function revalidatePublicHomepage(): Promise<boolean> {
  try {
    revalidatePath("/");
    logger.info("revalidate.success", { path: "/" });
    return true;
  } catch (err) {
    logger.error("revalidate.failed", { path: "/", error: String(err) });
    return false;
  }
}
```

---

## 1. `PATCH /api/admin/jadwal`

**Sumber:** TSD §4.3 (request/response shape non-trivial, dikutip langsung) + Blueprint §4 modul Jadwal + §10.1 poin 5 (RPC transaction).

### `app/api/admin/jadwal/route.ts`

```typescript
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { updateJadwalSchema } from "@/lib/modules/jadwal/jadwal.schema";
import { updateJadwal } from "@/lib/modules/jadwal/jadwal.service";
import { ValidationError } from "@/lib/shared/errors";

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const body = await req.json();
    const parsed = updateJadwalSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Payload jadwal tidak valid.");
    }

    const result = await updateJadwal(parsed.data, adminId);
    return { data: result };
  });
}
```

### `lib/modules/jadwal/jadwal.schema.ts`

```typescript
import { z } from "zod";

// Sesuai request body TSD §4.3 — dokter_id (uuid), hari (enum Senin-Minggu),
// jam_mulai/jam_selesai (format waktu valid HH:mm)
const HARI = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const jadwalItemSchema = z
  .object({
    dokter_id: z.string().uuid({ message: "dokter_id harus berupa UUID valid." }),
    hari: z.enum(HARI, { errorMap: () => ({ message: "hari harus salah satu dari Senin-Minggu." }) }),
    jam_mulai: z.string().regex(TIME_REGEX, "jam_mulai harus format HH:mm."),
    jam_selesai: z.string().regex(TIME_REGEX, "jam_selesai harus format HH:mm."),
  })
  .refine((val) => val.jam_mulai < val.jam_selesai, {
    message: "jam_mulai harus lebih awal dari jam_selesai.",
    path: ["jam_selesai"],
  });

export const updateJadwalSchema = z.object({
  jadwal: z.array(jadwalItemSchema).min(1, "Minimal satu entri jadwal wajib dikirim."),
});

export type UpdateJadwalInput = z.infer<typeof updateJadwalSchema>;
```

### `lib/modules/jadwal/jadwal.service.ts`

```typescript
import { upsertJadwalBatch } from "./jadwal.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import type { UpdateJadwalInput } from "./jadwal.schema";

// Orkestrasi — jalur kritis SOW §8, response harus mengandung
// `revalidated: boolean` sesuai contoh response TSD §4.3.
export async function updateJadwal(input: UpdateJadwalInput, adminId: string) {
  // Upsert jadwal + insert riwayat terjadi dalam SATU transaction Postgres
  // lewat fn_update_jadwal_dan_riwayat (Blueprint §10.1 poin 5) — bukan dua
  // panggilan terpisah, karena Supabase JS client tidak punya transaction
  // multi-statement lintas panggilan.
  const ringkasan = buildRingkasan(input.jadwal);
  const { updatedCount } = await upsertJadwalBatch(input.jadwal, adminId, ringkasan);

  // NB: catatPerubahan di sini sudah redundant kalau fn_update_jadwal_dan_riwayat
  // sudah insert riwayat_perubahan di dalam RPC yang sama (lihat catatan di
  // jadwal.repository.ts). Baris ini sengaja TIDAK dipanggil kedua kali —
  // dibiarkan sebagai referensi pola yang dipakai modul Layanan/Dokter di bawah,
  // yang repository-nya tidak melalui RPC gabungan.

  const revalidated = await revalidatePublicHomepage();

  return { updated_count: updatedCount, revalidated };
}

function buildRingkasan(jadwal: UpdateJadwalInput["jadwal"]): string {
  const dokterCount = new Set(jadwal.map((j) => j.dokter_id)).size;
  return `Update jadwal untuk ${dokterCount} dokter (${jadwal.length} entri hari)`;
}
```

### `lib/modules/jadwal/jadwal.repository.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { UpdateJadwalInput } from "./jadwal.schema";

// Upsert batch lewat Postgres function fn_update_jadwal_dan_riwayat via .rpc() —
// menjamin atomicity write jadwal + insert riwayat dalam satu transaction sungguhan
// (TSD §3.3 langkah 4, keputusan final Blueprint §10.1 poin 5).
//
// [CATATAN — bukan asumsi, batasan dokumen]: fungsi SQL `fn_update_jadwal_dan_riwayat`
// itu sendiri BELUM ditulis di sini — skill ini tidak menulis migrasi dari nol
// (lihat batasan endpoint-builder). Rujuk Backend Blueprint §6 (Migration Order)
// untuk menambahkannya sebagai migrasi baru sebelum route ini bisa jalan end-to-end.
// Signature yang diasumsikan RPC ini terima (harus disepakati saat menulis migrasinya):
//   fn_update_jadwal_dan_riwayat(p_jadwal jsonb, p_admin_id uuid, p_ringkasan text)
//   RETURNS integer  -- jumlah baris jadwal yang di-upsert
export async function upsertJadwalBatch(
  jadwal: UpdateJadwalInput["jadwal"],
  adminId: string,
  ringkasan: string
): Promise<{ updatedCount: number }> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("fn_update_jadwal_dan_riwayat", {
    p_jadwal: jadwal,
    p_admin_id: adminId,
    p_ringkasan: ringkasan,
  });

  if (error) {
    throw new InternalError(`Gagal update jadwal: ${error.message}`);
  }

  return { updatedCount: typeof data === "number" ? data : jadwal.length };
}
```

### Tests — `tests/modules/jadwal/route.test.ts`

```typescript
import { describe, it, expect } from "vitest"; // atau Pest-equivalent kalau tim pindah stack

describe("PATCH /api/admin/jadwal", () => {
  it("happy path: admin valid, payload valid -> 200 { success, updated_count, revalidated }", async () => {
    // TODO: assert response shape sesuai TSD §4.3, updated_count sama dengan jumlah entri jadwal
  });

  it("menolak request tanpa session admin -> 401 UNAUTHORIZED", async () => {
    // TODO: assert error.code === "UNAUTHORIZED"
  });

  it("menolak payload dengan jam_mulai >= jam_selesai -> 400 VALIDATION_ERROR", async () => {
    // TODO: assert error.code === "VALIDATION_ERROR", data DB tidak berubah
  });

  it("menolak payload dengan hari di luar enum Senin-Minggu -> 400 VALIDATION_ERROR", async () => {
    // TODO: assert error.code === "VALIDATION_ERROR"
  });

  it("write jadwal + insert riwayat_perubahan atomik: kalau RPC gagal, TIDAK ada baris jadwal yang ter-update sebagian", async () => {
    // TODO: assert tidak ada partial write — ini tes untuk keputusan §10.1 poin 5
  });

  it("revalidation gagal -> tetap 200 ke admin, revalidated: false, tapi tercatat di log", async () => {
    // TODO: mock revalidatePath melempar error, assert response tetap sukses (Blueprint §10.1 poin 4)
  });
});
```

---

## 2. `PATCH /api/admin/layanan`

**Sumber:** Blueprint §4 modul Layanan + PRD §4 Modul 2 ("Admin bisa edit teks/daftar layanan").
`[ASUMSI]`: TSD §4.2 hanya mencatat endpoint ini di tabel ringkas, tanpa detail request/response shape seperti jadwal/riwayat di §4.3. Shape di bawah mengikuti pola array-batch yang sama dengan `jadwal` (konsisten dengan "tambah/edit/hapus" dalam satu panggilan, Blueprint §2) — **ini keputusan turunan, bukan kutipan TSD**, dan sebaiknya dikonfirmasi balik ke TSD §4.3 sebagai revisi terdokumentasi kalau tim ingin mengunci bentuk finalnya.

### `app/api/admin/layanan/route.ts`

```typescript
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { updateLayananSchema } from "@/lib/modules/layanan/layanan.schema";
import { updateLayanan } from "@/lib/modules/layanan/layanan.service";
import { ValidationError } from "@/lib/shared/errors";

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const body = await req.json();
    const parsed = updateLayananSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Payload layanan tidak valid.");
    }

    const result = await updateLayanan(parsed.data, adminId);
    return { data: result };
  });
}
```

### `lib/modules/layanan/layanan.schema.ts`

```typescript
import { z } from "zod";

// [ASUMSI] field & shape mengikuti Blueprint §4 modul Layanan (nama, deskripsi,
// urutan, tampil_di_homepage) — bukan dikutip dari TSD §4.3 karena tidak ada di sana.
// `id` opsional: hadir untuk item existing (update), absen untuk item baru (insert).
// `_delete: true` menandai item yang harus dihapus — pola batch yang sama dengan jadwal,
// dipilih supaya "tambah/edit/hapus" (PRD §4 Modul 2) bisa satu PATCH, bukan 3 endpoint terpisah.
const layananItemSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, "nama layanan wajib diisi.").max(120),
  deskripsi: z.string().max(1000).optional().default(""),
  urutan: z.number().int().min(0),
  tampil_di_homepage: z.boolean(),
  _delete: z.boolean().optional().default(false),
});

export const updateLayananSchema = z.object({
  layanan: z.array(layananItemSchema).min(1, "Minimal satu entri layanan wajib dikirim."),
});

export type UpdateLayananInput = z.infer<typeof updateLayananSchema>;
```

### `lib/modules/layanan/layanan.service.ts`

```typescript
import { upsertLayanan, deleteLayanan } from "./layanan.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import type { UpdateLayananInput } from "./layanan.schema";

export async function updateLayanan(input: UpdateLayananInput, adminId: string) {
  const toDelete = input.layanan.filter((item) => item._delete && item.id);
  const toUpsert = input.layanan.filter((item) => !item._delete);

  if (toDelete.length > 0) {
    await deleteLayanan(toDelete.map((item) => item.id as string));
  }
  const { upsertedCount } = await upsertLayanan(toUpsert);

  await catatPerubahan(
    adminId,
    "layanan",
    `Update ${upsertedCount} layanan, hapus ${toDelete.length} layanan`
  );

  const revalidated = await revalidatePublicHomepage();

  return {
    updated_count: upsertedCount,
    deleted_count: toDelete.length,
    revalidated,
  };
}
```

### `lib/modules/layanan/layanan.repository.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { UpdateLayananInput } from "./layanan.schema";

// Session-scoped client (authenticated) — bukan admin/service_role client,
// keputusan final Blueprint §10.1 poin 2. RLS INSERT/UPDATE/DELETE untuk
// role authenticated yang cocok UID admin (Blueprint §6, TSD §7.1) tetap berlaku.
export async function upsertLayanan(
  items: Omit<UpdateLayananInput["layanan"][number], "_delete">[]
): Promise<{ upsertedCount: number }> {
  if (items.length === 0) return { upsertedCount: 0 };

  const supabase = await createServerSupabaseClient();
  const { error, count } = await supabase
    .from("layanan")
    .upsert(
      items.map(({ id, nama, deskripsi, urutan, tampil_di_homepage }) => ({
        ...(id ? { id } : {}),
        nama,
        deskripsi,
        urutan,
        tampil_di_homepage,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id" }
    )
    .select("id", { count: "exact" });

  if (error) throw new InternalError(`Gagal upsert layanan: ${error.message}`);
  return { upsertedCount: count ?? items.length };
}

export async function deleteLayanan(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("layanan").delete().in("id", ids);
  if (error) throw new InternalError(`Gagal hapus layanan: ${error.message}`);
}
```

### Tests — `tests/modules/layanan/route.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("PATCH /api/admin/layanan", () => {
  it("happy path: upsert layanan baru & existing -> 200 { updated_count, revalidated }", async () => {
    // TODO: assert item tanpa id ter-insert, item dengan id ter-update
  });

  it("item dengan _delete: true dan id valid -> baris terhapus, tidak ikut updated_count", async () => {
    // TODO: assert deleted_count sesuai jumlah item _delete
  });

  it("menolak request tanpa session admin -> 401 UNAUTHORIZED", async () => {
    // TODO
  });

  it("menolak nama layanan kosong -> 400 VALIDATION_ERROR", async () => {
    // TODO
  });

  it("hard-delete dipakai (bukan soft-delete) sesuai TSD §5.3 -> baris genuinely hilang dari tabel, bukan cuma ditandai", async () => {
    // TODO: assert baris tidak ditemukan lewat query langsung, bukan lewat flag is_deleted
  });
});
```

---

## 3. `PATCH /api/admin/dokter`

**Sumber:** Blueprint §4 modul Dokter + PRD §4 Modul 2 ("Profil dokter — nama, spesialisasi, foto").
`[ASUMSI]` semula: sama seperti `layanan`, TSD §4.2 tidak mendetailkan shape endpoint ini di §4.3. Berbeda dari `layanan` (list), endpoint ini scope-nya **satu dokter per panggilan** — mengikuti kata "profil" (singular) di Blueprint §4, bukan array batch. Foto ditangani endpoint terpisah (§4 di bawah), **tidak** lewat body PATCH ini.

**Catatan revisi (2026-08-18):** `[ASUMSI]` di atas **DITIMPA** — homepage publik menampilkan
banyak dokter (S2, "Tenaga Medis Kami"), jadi admin butuh mengelola semua dokter itu, bukan
cuma satu. Endpoint ini sekarang **batch list**, sama persis polanya dengan `layanan` di §2
(body `{ dokter: [{ id?, nama, spesialisasi, urutan, _delete? }] }`, upsert + delete, bukan
single-object). Kode di bawah ini **arsip sejarah keputusan lama**, bukan referensi akurat lagi
— implementasi nyata ada di `lib/modules/dokter/{dokter.schema,dokter.service,dokter.repository}.ts`
dan `components/admin/{DokterForm,DokterListEditor}.tsx`, ikuti pola `layanan` yang sudah
didokumentasikan di §2 untuk shape request/response yang akurat.

### `app/api/admin/dokter/route.ts`

```typescript
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { updateDokterSchema } from "@/lib/modules/dokter/dokter.schema";
import { updateDokter } from "@/lib/modules/dokter/dokter.service";
import { ValidationError } from "@/lib/shared/errors";

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const body = await req.json();
    const parsed = updateDokterSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Payload dokter tidak valid.");
    }

    const result = await updateDokter(parsed.data, adminId);
    return { data: result };
  });
}
```

### `lib/modules/dokter/dokter.schema.ts`

```typescript
import { z } from "zod";

// [ASUMSI] field mengikuti Blueprint §4 modul Dokter ("nama, spesialisasi") —
// urutan juga disertakan karena ada di data model TSD §5.1, meski tidak
// disebut eksplisit di deskripsi fitur PRD §4 Modul 2.
export const updateDokterSchema = z.object({
  dokter_id: z.string().uuid({ message: "dokter_id harus berupa UUID valid." }),
  nama: z.string().min(1, "nama wajib diisi.").max(120),
  spesialisasi: z.string().min(1, "spesialisasi wajib diisi.").max(120),
  urutan: z.number().int().min(0).optional(),
});

export type UpdateDokterInput = z.infer<typeof updateDokterSchema>;

// Dipakai oleh endpoint upload foto (§4) — file size & MIME whitelist,
// menutup risiko TSD §9 baris "Upload foto dokter tanpa validasi ketat"
export const uploadFotoSchema = z.object({
  dokter_id: z.string().uuid({ message: "dokter_id harus berupa UUID valid." }),
});

export const MAX_FOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — [ASUMSI: angka konkret tidak
// disebut di TSD/PRD, dipilih sebagai batas wajar untuk foto profil web, bukan dari sumber terverifikasi]
export const ALLOWED_FOTO_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
```

### `lib/modules/dokter/dokter.service.ts`

```typescript
import { updateDokterProfil } from "./dokter.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import type { UpdateDokterInput } from "./dokter.schema";

export async function updateDokter(input: UpdateDokterInput, adminId: string) {
  await updateDokterProfil(input);

  await catatPerubahan(adminId, "dokter", `Update profil dr. ${input.nama}`);

  const revalidated = await revalidatePublicHomepage();

  return { success: true, revalidated };
}
```

### `lib/modules/dokter/dokter.repository.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError, NotFoundError } from "@/lib/shared/errors";
import type { UpdateDokterInput } from "./dokter.schema";

export async function updateDokterProfil(input: UpdateDokterInput): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dokter")
    .update({
      nama: input.nama,
      spesialisasi: input.spesialisasi,
      ...(input.urutan !== undefined ? { urutan: input.urutan } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.dokter_id)
    .select("id")
    .maybeSingle();

  if (error) throw new InternalError(`Gagal update profil dokter: ${error.message}`);
  if (!data) throw new NotFoundError(`Dokter dengan id ${input.dokter_id} tidak ditemukan.`);
}

export async function updateFotoUrl(dokterId: string, fotoUrl: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("dokter")
    .update({ foto_url: fotoUrl, updated_at: new Date().toISOString() })
    .eq("id", dokterId);

  if (error) throw new InternalError(`Gagal update foto_url dokter: ${error.message}`);
}
```

### Tests — `tests/modules/dokter/route.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("PATCH /api/admin/dokter", () => {
  it("happy path: dokter_id valid, nama & spesialisasi terisi -> 200 { success, revalidated }", async () => {
    // TODO
  });

  it("dokter_id tidak ditemukan -> 404 NOT_FOUND", async () => {
    // TODO: assert error.code === "NOT_FOUND"
  });

  it("menolak request tanpa session admin -> 401 UNAUTHORIZED", async () => {
    // TODO
  });

  it("menolak nama/spesialisasi kosong -> 400 VALIDATION_ERROR", async () => {
    // TODO
  });
});
```

---

## 4. `POST /api/admin/dokter/foto`

**Sumber:** Blueprint §4 modul Dokter (`dokter-foto.service.ts`) + §8 (Supabase Storage wrapper, bucket `dokter-foto`) + TSD §9 (risiko validasi upload).

### `app/api/admin/dokter/foto/route.ts`

```typescript
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { uploadFotoSchema } from "@/lib/modules/dokter/dokter.schema";
import { uploadFotoDokter } from "@/lib/modules/dokter/dokter-foto.service";
import { ValidationError } from "@/lib/shared/errors";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const formData = await req.formData();
    const dokterId = formData.get("dokter_id");
    const file = formData.get("file");

    const parsed = uploadFotoSchema.safeParse({ dokter_id: dokterId });
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "dokter_id tidak valid.");
    }
    if (!(file instanceof File)) {
      throw new ValidationError("Field 'file' wajib berupa file upload.");
    }

    const result = await uploadFotoDokter(file, parsed.data.dokter_id, adminId);
    return { data: result };
  });
}
```

### `lib/modules/dokter/dokter-foto.service.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateFotoUrl } from "./dokter.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import { ValidationError, InternalError } from "@/lib/shared/errors";
import { ALLOWED_FOTO_MIME, MAX_FOTO_SIZE_BYTES } from "./dokter.schema";

// Wrapper eksplisit ke Supabase Storage — nama class isolasi disebut Blueprint §8
// sebagai DokterFotoStorageClient; diimplementasikan di sini sebagai fungsi
// modul (bukan class) karena tidak ada state yang perlu dipertahankan lintas
// panggilan — [ASUMSI: penyederhanaan implementasi, tidak mengubah kontrak/nama
// file yang sudah dipetakan Blueprint §5].
export async function uploadFotoDokter(file: File, dokterId: string, adminId: string) {
  validateFoto(file); // TSD §9 risiko: validasi ukuran & tipe MIME sebelum upload

  const supabase = await createServerSupabaseClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${dokterId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("dokter-foto") // nama bucket final — Blueprint §10.1 poin 3
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new InternalError(`Gagal upload foto: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from("dokter-foto").getPublicUrl(path);
  const fotoUrl = publicUrlData.publicUrl;

  await updateFotoUrl(dokterId, fotoUrl);
  await catatPerubahan(adminId, "dokter", `Update foto profil dokter (${dokterId})`);
  const revalidated = await revalidatePublicHomepage();

  return { foto_url: fotoUrl, revalidated };
}

function validateFoto(file: File): void {
  if (!ALLOWED_FOTO_MIME.includes(file.type as (typeof ALLOWED_FOTO_MIME)[number])) {
    throw new ValidationError(
      `Tipe file ${file.type} tidak didukung. Gunakan JPEG, PNG, atau WebP.`
    );
  }
  if (file.size > MAX_FOTO_SIZE_BYTES) {
    throw new ValidationError(
      `Ukuran file melebihi batas ${MAX_FOTO_SIZE_BYTES / 1024 / 1024}MB.`
    );
  }
}
```

### Tests — `tests/modules/dokter/foto.route.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("POST /api/admin/dokter/foto", () => {
  it("happy path: file JPEG valid <2MB -> 200 { foto_url, revalidated }", async () => {
    // TODO: assert foto_url mengarah ke bucket dokter-foto, dokter.foto_url ter-update
  });

  it("menolak file dengan MIME type di luar whitelist (mis. application/pdf) -> 400 VALIDATION_ERROR", async () => {
    // TODO: assert tidak ada upload ke Storage yang terjadi (validasi sebelum upload)
  });

  it("menolak file > 2MB -> 400 VALIDATION_ERROR", async () => {
    // TODO
  });

  it("menolak request tanpa session admin -> 401 UNAUTHORIZED", async () => {
    // TODO
  });

  it("dokter_id tidak dikirim/invalid -> 400 VALIDATION_ERROR sebelum file diproses", async () => {
    // TODO
  });
});
```

---

## 5. `GET /api/admin/riwayat`

**Sumber:** TSD §4.3 (response shape non-trivial, dikutip langsung) + Blueprint §4 modul Riwayat Perubahan.

Modul ini juga menyediakan `catatPerubahan()` yang dipanggil dari service Layanan/Dokter/Jadwal di atas — didefinisikan di sini karena §4/§5 Blueprint menempatkan seluruh modul Riwayat dalam satu bagian.

### `app/api/admin/riwayat/route.ts`

```typescript
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { listRiwayat } from "@/lib/modules/riwayat/riwayat.service";

export async function GET(req: NextRequest) {
  return handleRoute(async () => {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20") || 20));

    const result = await listRiwayat(page, limit);
    // Bentuk response TSD §4.3 tidak dibungkus { success, ... } biasa —
    // ini sudah { data, page, has_more } secara langsung, jadi status 200 saja.
    return { data: result as unknown as Record<string, unknown> };
  });
}
```

> **Catatan bentuk response:** TSD §4.3 mencontohkan `GET /api/admin/riwayat` mengembalikan `{ data, page, has_more }` **tanpa** field `success` di root — berbeda dari envelope `{ success, ... }` yang dipakai `response.ts` untuk endpoint lain. `handleRoute` di atas tetap membungkus lewat `successResponse`, yang berarti hasil aktual jadi `{ success: true, data: [...], page, has_more }` — **field tambahan `success: true`, bukan menghilangkan field TSD**. `[ASUMSI]`: dianggap tidak melanggar kontrak TSD karena field TSD tetap ada semua, hanya ditambah satu field envelope; kalau tim ingin response GET riwayat *persis* sama dengan contoh TSD (tanpa `success`), route ini perlu `NextResponse.json(result)` langsung, bukan lewat `handleRoute`. Diflagging di sini, bukan diputuskan diam-diam.

### `lib/modules/riwayat/riwayat.service.ts`

```typescript
import { insertRiwayat, paginateRiwayat } from "./riwayat.repository";

export type JenisPerubahan = "jadwal" | "layanan" | "dokter";

// Dipanggil GET Route Handler
export async function listRiwayat(page: number, limit: number) {
  return paginateRiwayat(page, limit);
}

// Dipanggil modul lain (Layanan/Dokter/Jadwal) setelah write sukses —
// TANPA filter tanggal, sesuai keputusan UX Wireframe §5 poin 6 (Blueprint §4).
export async function catatPerubahan(
  adminId: string,
  jenis: JenisPerubahan,
  ringkasan: string
): Promise<void> {
  await insertRiwayat(adminId, jenis, ringkasan);
}
```

### `lib/modules/riwayat/riwayat.repository.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { JenisPerubahan } from "./riwayat.service";

interface RiwayatRow {
  id: string;
  admin_email: string;
  jenis_perubahan: string;
  ringkasan: string;
  created_at: string;
}

export async function insertRiwayat(
  adminId: string,
  jenis: JenisPerubahan,
  ringkasan: string
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("riwayat_perubahan")
    .insert({ admin_id: adminId, jenis_perubahan: jenis, ringkasan });

  if (error) throw new InternalError(`Gagal mencatat riwayat perubahan: ${error.message}`);
}

// Reverse-chronological, join ke auth.users untuk admin_email sesuai contoh TSD §4.3
export async function paginateRiwayat(
  page: number,
  limit: number
): Promise<{ data: RiwayatRow[]; page: number; has_more: boolean }> {
  const supabase = await createServerSupabaseClient();
  const from = (page - 1) * limit;
  const to = from + limit; // ambil 1 ekstra untuk deteksi has_more

  const { data, error } = await supabase
    .from("riwayat_perubahan")
    // [ASUMSI] nama relasi FK ke auth.users belum eksplisit di migration order
    // Blueprint §6 — disini diasumsikan Supabase auto-join lewat foreign table
    // "admin:admin_id(email)"; sesuaikan alias kalau skema migrasi final berbeda.
    .select("id, jenis_perubahan, ringkasan, created_at, admin:admin_id(email)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new InternalError(`Gagal mengambil riwayat perubahan: ${error.message}`);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    jenis_perubahan: string;
    ringkasan: string;
    created_at: string;
    admin: { email: string } | null;
  }>;

  const hasMore = rows.length > limit;
  const page_data = rows.slice(0, limit).map((r) => ({
    id: r.id,
    admin_email: r.admin?.email ?? "",
    jenis_perubahan: r.jenis_perubahan,
    ringkasan: r.ringkasan,
    created_at: r.created_at,
  }));

  return { data: page_data, page, has_more: hasMore };
}
```

### `Policy — lib/auth/guards.ts` (dipakai ulang)

Sama seperti 4 endpoint di atas — `requireAdmin()`. Tidak ada policy tambahan karena hanya 1 role (Blueprint §7).

### Tests — `tests/modules/riwayat/route.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("GET /api/admin/riwayat", () => {
  it("happy path: page=1&limit=20 -> 200 { data[], page: 1, has_more }, reverse-chronological", async () => {
    // TODO: assert urutan created_at descending
  });

  it("has_more: true kalau total baris > limit", async () => {
    // TODO: seed > limit baris, assert has_more true, data.length === limit
  });

  it("menolak request tanpa session admin -> 401 UNAUTHORIZED", async () => {
    // TODO
  });

  it("tidak menerima filter tanggal apa pun (query param diabaikan, bukan error)", async () => {
    // TODO: assert ?from=...&to=... tidak memengaruhi hasil — sesuai keputusan UX §5 poin 6
  });

  it("catatPerubahan dipanggil dari modul lain benar-benar muncul di listRiwayat berikutnya", async () => {
    // TODO: integration test lintas modul — panggil updateLayanan, lalu assert entri baru muncul di GET riwayat
  });
});
```

---

## Ringkasan File

| File | Endpoint Terkait | Status |
|---|---|---|
| `lib/shared/errors.ts` | Semua | Baru |
| `lib/shared/response.ts` | Semua | Baru |
| `lib/shared/logger.ts` | Semua (lewat revalidate-public.ts) | Baru |
| `lib/supabase/server.ts` | Semua | Baru |
| `lib/auth/session.ts` | Semua | Baru |
| `lib/auth/guards.ts` | Semua | Baru |
| `lib/revalidation/revalidate-public.ts` | jadwal, layanan, dokter, dokter/foto | Baru |
| `app/api/admin/jadwal/route.ts` | `PATCH /api/admin/jadwal` | Baru |
| `lib/modules/jadwal/jadwal.schema.ts` | `PATCH /api/admin/jadwal` | Baru |
| `lib/modules/jadwal/jadwal.service.ts` | `PATCH /api/admin/jadwal` | Baru |
| `lib/modules/jadwal/jadwal.repository.ts` | `PATCH /api/admin/jadwal` | Baru — **butuh migrasi SQL `fn_update_jadwal_dan_riwayat` terpisah, lihat catatan §1** |
| `app/api/admin/layanan/route.ts` | `PATCH /api/admin/layanan` | Baru |
| `lib/modules/layanan/layanan.schema.ts` | `PATCH /api/admin/layanan` | Baru — **shape [ASUMSI]** |
| `lib/modules/layanan/layanan.service.ts` | `PATCH /api/admin/layanan` | Baru |
| `lib/modules/layanan/layanan.repository.ts` | `PATCH /api/admin/layanan` | Baru |
| `app/api/admin/dokter/route.ts` | `PATCH /api/admin/dokter` | Baru |
| `lib/modules/dokter/dokter.schema.ts` | `PATCH /api/admin/dokter`, `POST /api/admin/dokter/foto` | Baru — **shape [ASUMSI]** |
| `lib/modules/dokter/dokter.service.ts` | `PATCH /api/admin/dokter` | Baru |
| `lib/modules/dokter/dokter.repository.ts` | `PATCH /api/admin/dokter`, `POST /api/admin/dokter/foto` | Baru |
| `app/api/admin/dokter/foto/route.ts` | `POST /api/admin/dokter/foto` | Baru |
| `lib/modules/dokter/dokter-foto.service.ts` | `POST /api/admin/dokter/foto` | Baru |
| `app/api/admin/riwayat/route.ts` | `GET /api/admin/riwayat` | Baru |
| `lib/modules/riwayat/riwayat.service.ts` | Semua (via `catatPerubahan`) + `GET /api/admin/riwayat` | Baru |
| `lib/modules/riwayat/riwayat.repository.ts` | Semua + `GET /api/admin/riwayat` | Baru |

## Item Terbuka — Sudah Dijawab

*Enam dari tujuh `[ASUMSI]` awal ditutup di bawah ini dengan keputusan final + peran paling relevan untuk menjawabnya — mengikuti pola yang sama dipakai TSD §9.1 dan Backend Blueprint §10.1. Ini bukan lagi item terbuka untuk developer yang mengimplementasikan dari dokumen ini — kalau ingin diubah, perlakukan sebagai revisi terdokumentasi, bukan asumsi diam-diam.*

1. **Shape request `PATCH /api/admin/layanan` — dijawab dari sudut pandang Backend Engineer.**
   **Keputusan: pola array-batch (`{ layanan: [...] }` + `_delete` flag) dikunci sebagai kontrak final.** PRD §4 Modul 2 minta tambah/edit/hapus dalam satu form admin, dan menyatukan jadi satu PATCH konsisten dengan pola `jadwal` yang sudah ada di TSD — satu konvensi request-shape di seluruh admin panel mengurangi beban maintenance untuk solo developer. `[TINDAK LANJUT: backport shape ini ke TSD §4.3 sebagai revisi terdokumentasi]`.

2. **Shape request `PATCH /api/admin/dokter` — dijawab dari sudut pandang Backend Engineer.**
   **Keputusan: single-record (`dokter_id` + field) dikunci sebagai kontrak final, bukan batch.** Wireframe S8 menunjukkan form edit per-dokter, dan Blueprint §4 eksplisit pakai kata "profil" singular — bentuk endpoint mengikuti bentuk UI-nya. `[TINDAK LANJUT: backport ke TSD §4.3]`.

3. **`fn_update_jadwal_dan_riwayat` (Postgres function) — dijawab dari sudut pandang Backend/Database Engineer**, role yang sama yang memutuskan pendekatan RPC di Blueprint §10.1 poin 5.
   **DITUTUP — migrasi lengkap sudah ditulis, bukan skeleton lagi.** Lihat `supabase/migrations/0006_fn_update_jadwal_dan_riwayat.sql`. Fungsi ini butuh `unique constraint (dokter_id, hari)` di tabel `jadwal_praktik` — ditambahkan eksplisit di `supabase/migrations/0004_jadwal_praktik.sql` sebagai `jadwal_praktik_dokter_hari_unique`, dan nama constraint ini dirujuk persis sama oleh `ON CONFLICT ON CONSTRAINT` di migrasi 0006 (sudah diverifikasi cocok lewat grep). Migrasi 0001–0006 lengkap (termasuk RLS policy per tabel, bucket Storage `dokter-foto`) tersedia sebagai file terpisah di paket ini.

4. **Ukuran maksimum foto dokter (2MB) — dijawab dari sudut pandang Infrastructure/Backend Engineer**, role yang sama yang memutuskan nama bucket di Blueprint §10.1 poin 3 (keputusan sizing/penamaan tanpa trade-off substantif).
   **Keputusan: 2MB dipertahankan sebagai default template.** Tidak ada requirement ukuran terverifikasi dari PRD/SOW — 2MB konvensi umum untuk foto profil web non-terkompresi. `[REKOMENDASI: verifikasi kuota Supabase Storage tier terpakai (free tier = 1GB total) sebelum dipakai di engagement nyata dengan banyak tenaga medis]` — bukan dianggap aman selamanya.

5. **Relasi FK `admin_id` → `auth.users(email)` di `riwayat.repository.ts` — dijawab dari sudut pandang Backend/Database Engineer.**
   **DITUTUP — constraint FK eksplisit `riwayat_perubahan_admin_id_fkey` sudah ditulis di `supabase/migrations/0005_riwayat_perubahan.sql`.** Supabase PostgREST men-generate alias join dari nama FK constraint ini, sehingga alias `admin:admin_id(email)` yang dipakai `riwayat.repository.ts` sekarang konsisten dengan skema aktual, bukan lagi tebakan konvensi.

6. **Envelope `success: true` tambahan di `GET /api/admin/riwayat` — dijawab dari sudut pandang Backend Engineer.**
   **Keputusan: deviasi ini diterima sebagai final.** Satu envelope konsisten di seluruh endpoint admin lebih bernilai daripada strict-matching satu endpoint ke contoh TSD yang ditulis sebelum `handleRoute()` bersama ada — deviasinya aditif, bukan breaking. `[TINDAK LANJUT: update contoh response TSD §4.3 untuk `GET /api/admin/riwayat` agar mencantumkan `success: true`]`.

### Item yang Tetap Terbuka

7. **Test suite** — `[ASUMSI, diwarisi TSD §8/Deployment Plan §3/Backend Blueprint §10.2]` **Ini keputusan default dengan trigger yang sudah ditetapkan, bukan celah tanpa arah — tapi juga belum sepenuhnya closed.** Trigger yang sudah didefinisikan tetap berlaku: mulai tulis test sungguhan begitu scope proyek bertambah (Deployment Plan §3) — bukan dipaksa selesai sekarang hanya karena item lain sudah ditutup. *Kapan* persisnya trigger itu terpenuhi tetap keputusan kapasitas/prioritas tim (Tech Lead/Solutions Architect). **Catatan sinkronisasi:** framing ini diselaraskan dengan Backend Blueprint §10.2, yang sebelumnya memakai bahasa "sudah diputuskan di level kebijakan" (menyiratkan closed) sementara item ini memakai bahasa "sengaja tetap terbuka" — keduanya sekarang memakai bahasa yang sama.

---

*Dokumen ini siap dipakai sebagai referensi coding-stage — buka file per endpoint, salin tiap code block ke path aslinya. Enam dari tujuh `[ASUMSI]` awal sudah dikunci sebagai keputusan di atas; satu sisanya (test suite) sengaja tetap terbuka karena bergantung kapasitas/prioritas tim, bukan fakta teknis. Perubahan pada TSD §4.3 (item 1, 2, 6) sudah di-backport lewat `TSD_Revisi_API_Contracts.md`. Perubahan pada Blueprint §6 (item 3, 5) **sudah diterapkan langsung** ke `Klinik_Cahaya_Medika_Backend_Blueprint.md` (migrasi 0006, constraint `jadwal_praktik_dokter_hari_unique`, dan FK `riwayat_perubahan_admin_id_fkey` kini tercantum di Migration Order §6) — tidak lagi sekadar direkomendasikan.*
