# UI Template Specification — Landing Page & Admin Panel Klinik Cahaya Medika

> **Catatan konteks:** Dokumen ini melengkapi rantai dokumentasi standar NobleDev (PRD → SOW → User Flow & Wireframe → Technical Spec → Timeline & Milestones → Deployment & Maintenance Plan) dengan lapisan **spesifikasi visual**. Diturunkan dari **PRD v1.1**, **User Flow & Wireframe Document** (9 screen, 3 flow, struktur sudah dikonfirmasi — lihat §5 dokumen tersebut), dan **Technical Spec** (Next.js + Tailwind CSS). Klinik Cahaya Medika tetap studi kasus ilustratif/template internal, bukan klien nyata. Dokumen ini adalah **spesifikasi tertulis** (token + blueprint), bukan kode jadi — eksekusi ke kode adalah langkah terpisah (lihat skill `frontend-design`).

| Field | Detail |
|---|---|
| Referensi PRD | Landing Page Klinik Cahaya Medika, v1.1 |
| Referensi User Flow & Wireframe | 9 screen (S1–S9), struktur layar **dikonfirmasi, tidak diubah** oleh dokumen ini |
| Referensi Technical Spec | Next.js, Tailwind CSS, Supabase |
| Tier Dokumen | Standard |
| Status | Draft — Template Internal |

> **Catatan revisi (2026-08-18):** Token warna, tipografi, dan radius di §3 disinkronkan dengan referensi desain eksternal `docs/design.html` (mock HTML high-fidelity yang di-upload user, lihat `docs/README.md` untuk konteksnya). **Bukan penggantian sistem token secara penuh** — nilai yang punya padanan langsung di `design.html` disinkronkan, nilai yang tidak punya padanan (state "Tutup", CTA WhatsApp, warna error) **dipertahankan** dari keputusan riset asli §2/§8 karena `design.html` tidak menyediakan data pengganti untuk itu (mock tersebut hanya mock marketing publik, tidak mencakup admin panel, tabel data, atau state "tutup"). Struktur 9 screen, elemen signature "Indikator Cahaya", dan strategi konten klinik keluarga (§1, §6) **tidak berubah** — `design.html` dibuat untuk konteks bisnis berbeda (klinik estetik/dermatologi) dan copy-nya sengaja tidak diadopsi, hanya token visual + pola layout (hero slideshow, trust badge strip) yang relevan.

---

## 1. Ringkasan Brief

- **Subjek**: Landing page satu halaman + panel admin ringan untuk **Klinik Cahaya Medika**, klinik keluarga skala kecil-menengah di Indonesia — bukan rumah sakit, bukan startup kesehatan digital, bukan platform telemedicine.
- **Audiens**: Dua register berbeda yang harus dilayani satu sistem token yang sama:
  - **Pengunjung/calon pasien (publik)** — mencari lewat Google/Maps, sering dari HP, kadang dalam kondisi cemas atau mendesak (PRD §3, User Flow Wireframe Flow B). Yang mereka cari duluan: *"klinik ini buka tidak sekarang, dan gimana caranya menghubungi."*
  - **Admin/pemilik klinik** — persona David: mapan, tidak tech-savvy, skeptis pada solusi "cantik tapi tidak fungsional" (PRD §3). Panel admin harus terasa tegas dan bisa diprediksi, bukan playful.
- **Cakupan**: **Sistem desain penuh** — kedua register (publik S1–S4, admin S5–S9) berbagi satu token system, tapi diterapkan dengan tekanan berbeda (publik lebih hangat/mengundang, admin lebih tenang/fungsional).
- **Batasan yang diketahui** (sumber disebutkan di tiap baris):
  - Struktur 9 screen dan 3 flow **sudah final**, bukan area keputusan dokumen ini (User Flow & Wireframe §5 — "DIKONFIRMASI, bukan diubah").
  - Kontras warna minimum WCAG AA (≥4.5:1), ukuran font dasar minimum 16px, breakpoint 360px/768px/1280px mobile-first (PRD §7 NFR Usability & Accessibility).
  - Tailwind CSS sebagai design system implementasi (User Flow & Wireframe, field "Design system existing").
  - Tidak boleh ada testimoni/rating fiktif (wireframe S1 — eksplisit "bukan testimoni/rating fiktif") — konsisten dengan aturan non-fabrikasi NobleDev.
  - CTA WhatsApp harus selalu terlihat tanpa scroll di homepage (SOW §8 Acceptance Criteria).
  - Admin: form minimal 2–3 field, tanpa rich-text editor, hub 3-kartu navigasi setelah login (wireframe §5 keputusan 1) — target kurva belajar tanpa training >15 menit (PRD §7).
  - Badge status "buka/tutup" pakai warna semantik (wireframe S3) — hijau/tidak-hijau, bukan traffic-light generik yang harus diikuti mentah-mentah (lihat §4 Signature untuk interpretasi khas subjek ini).

---

## 2. Riset & Referensi

*Pencarian dilakukan 17 Agustus 2026 (bukan mengandalkan ingatan pelatihan, karena tren UI kesehatan bergerak cepat).*

**Tren desain kesehatan 2026 (global):**
- Arah desain kesehatan 2026 bergeser dari palet biru-putih klinis-dingin ke visual yang lebih hangat dan manusiawi tanpa kehilangan kesan tepercaya — bentuk lebih organik, white space lega, tipografi jelas lintas usia.<br>*(sumber: SpreadSimple, "Healthcare Website Design 2026"; Foduu, "Top Medical Web Design Trends 2026")*
- Friksi di jalur konversi (form panjang, CTA tersembunyi, tombol sulit disentuh di mobile) adalah alasan utama pengunjung situs kesehatan berpindah ke kompetitor — bukan sekadar isu estetika.<br>*(sumber: Orbix Studio, "Healthcare Web Design Trends 2026")*

**Konteks UMKM/klinik Indonesia:**
- Praktik umum situs UMKM Indonesia mengarah ke *purposeful minimalism* — white space dipakai untuk menonjolkan CTA, bukan sekadar estetika kosong — dan integrasi CTA WhatsApp sebagai kanal kontak utama sudah jadi standar, bukan fitur pembeda.<br>*(sumber: IDwebhost, "Tren Desain Website UMKM 2025"; Exabytes, contoh CTA "WhatsApp Kami" pada situs bisnis Indonesia)*

**Apa yang dihindari (bukan ditiru) dari referensi pembanding:**
1. **Situs klinik generik biru-putih steril** (pola lama, masih banyak dipakai vendor jasa web klinik murah Indonesia — lihat contoh "Jasa Pembuatan Website Klinik" generik) — dihindari karena riset 2026 justru menandai ini sebagai kesan yang membuat pasien cemas merasa tidak nyaman, bukan tepercaya.
2. **Situs kesehatan dengan widget telemedicine/booking-online penuh** (pola umum di referensi healthcare inspirasi 2026) — dihindari karena eksplisit *out of scope* PRD §2 (tidak ada booking online, tidak ada portal pasien). Meniru pola ini akan menjanjikan sesuatu yang sistemnya tidak punya.
3. **Testimoni pasien + rating bintang palsu** (pola umum di situs UMKM jasa) — dihindari mutlak, sudah dilarang eksplisit di wireframe S1 dan aturan non-fabrikasi NobleDev.

---

## 3. Token System

### Warna

| Nama Token | Nilai (oklch, referensi desain) | Nilai (hex, implementasi Tailwind) | Peran | Alasan |
|---|---|---|---|---|
| `color-nakhoda` | `oklch(0.22 0.015 155)` | `#151D18` | Teks judul, header, warna dasar panel admin | **Disinkronkan ke `design.html`** (primary text / dark section bg pada mock tersebut). Tetap teal-gelap-netral (bukan biru klinis dingin), konsisten dengan rasional asli §2 (biru klinis = kesan "steril"). Perubahan dari `#1F3B3B` ke padanan oklch murni pergeseran ruang warna, peran token tidak berubah. |
| `color-cahaya` | `oklch(0.55 0.08 155)` | `#497F5D` | Aksen utama, hover state, elemen signature (lihat §4), divider | **Disinkronkan ke `design.html`** (warna aksen tombol/logo pada mock). Catatan: `design.html` memakai hue sage-hijau untuk aksen ini (bukan amber seperti draf sebelumnya) — nama token "cahaya" dipertahankan sebagai peran (aksen utama yang merujuk brand), bukan literal warna cahaya pagi lagi. Dipakai terbatas, bukan warna dominan. |
| `color-cta-whatsapp` | — | `#1E9E5A` | **Khusus** tombol CTA WhatsApp | **Dipertahankan, tidak disinkronkan** — `design.html` tidak punya token WA terpisah (tombol WA di mock itu memakai warna aksen umum yang sama dengan tombol lain). Rasional asli tetap berlaku: hijau WA yang dikenali instan mengurangi friksi konversi (riset §2, Orbix Studio); mengikuti `design.html` di sini justru akan menghapus pengecualian yang sengaja dan berdasar riset. |
| `color-latar` | `oklch(0.98 0.007 155)` | `#F5FAF6` | Latar belakang halaman | **Disinkronkan ke `design.html`** (background halaman pada mock). Tetap putih hangat bertona teal-nakhoda, prinsip "ditautkan ke warna anchor, bukan krem generik" (§2) tidak berubah. |
| `color-jaga` | `oklch(0.72 0.14 145)` | `#67BB6B` | Status "Buka sekarang" (badge S3, dashboard admin) | **Disinkronkan ke `design.html`** (warna dot status "BUKA SEKARANG" pada mock, hue 145 — sengaja berbeda dari `color-cahaya` hue 155 sehingga tetap terpisah secara visual dari aksen umum, konsisten dengan rasional asli "dibedakan dari CTA/aksen"). |
| `color-senja` | — | `#9C7A5B` | Status "Tutup" (badge S3), pesan non-urgent | **Dipertahankan, tidak disinkronkan** — `design.html` adalah mock marketing yang hanya menunjukkan state "buka", tidak ada desain untuk state "tutup" untuk disinkronkan. Rasional asli tetap berlaku: cokelat-tanah muted, bukan merah alarm. |

*(6 token warna bernama, sesuai batas 4–6 di kerangka spesifikasi. Nilai oklch dari `design.html` dikonversi ke hex sRGB untuk implementasi Tailwind — Tailwind 3.4.13 di proyek ini tidak resolve modifier opacity `/10`, `/70`, dst. dengan benar di atas string `oklch()` mentah pada custom color token, jadi hex tetap dipakai sebagai nilai implementasi; oklch dicatat sebagai referensi sumber desain.)*

### Tipografi

| Peran | Typeface | Alasan pemilihan |
|---|---|---|
| Display | **Figtree** (variable, weight 700–800) | **Disinkronkan ke `design.html`** (satu-satunya typeface di mock tersebut, dipakai bold/800 di H1). Menggantikan Fraunces — Figtree tetap sans humanis (bukan geometris-korporat), jadi arah "hangat/manusiawi" dari riset §2 tidak hilang, hanya berpindah dari pendekatan serif ke sans bold. Dipakai terbatas: headline hero dan judul section saja (peran tidak berubah). |
| Body | **Figtree** (400/500/600) | **Disinkronkan ke `design.html`** — menggantikan Plus Jakarta Sans dengan typeface yang sama seperti display, mengikuti pendekatan satu-keluarga-font `design.html`. Figtree tetap punya x-height tinggi dan dukungan glyph Latin-diakritik baik untuk Bahasa Indonesia, jadi kriteria legibilitas lintas usia (PRD §7) tetap terpenuhi. |
| Utility/Data | **IBM Plex Mono** (500, tabular figures) | **Dipertahankan, tidak disinkronkan** — `design.html` adalah mock marketing tanpa tabel data/timestamp untuk dijadikan pembanding. Tetap dipakai khusus untuk data presisi: jam praktik di tabel jadwal (S3), timestamp di Riwayat Perubahan (S9), nomor telepon — rasional asli (menandai "ini data, bukan copy marketing" untuk persona admin David) tidak berubah. |

**Skala tipe** (mobile → desktop, mengikuti breakpoint PRD §7 360px/768px/1280px):

| Level | Mobile (360px) | Desktop (1280px) | Weight |
|---|---|---|---|
| Display H1 (hero) | 32px / 1.15 | 44px / 1.1 | Figtree 800 |
| H2 (judul section) | 24px / 1.2 | 32px / 1.2 | Figtree 700 |
| Body | 16px / 1.6 | 17px / 1.6 | Figtree 400 |
| Body kecil/caption | 14px / 1.5 | 14px / 1.5 | Figtree 400 — **tidak** dipakai untuk konten kritikal (CTA, status), hanya label pendukung, agar tidak melanggar minimum 16px NFR untuk teks utama |
| Data/mono | 15px / 1.4, tabular-nums | 15px / 1.4 | IBM Plex Mono 500 |

### Spacing, Radius, Shadow

- **Spacing scale** (basis 4px): 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px — dipakai konsisten untuk padding section (mobile: 24px horizontal, desktop: 64px) dan jarak antar-elemen kartu (16px internal).
- **Radius**: 16px untuk kartu, tombol, dan input (`rounded-xl`) — **disinkronkan sebagian ke `design.html`** (mock tersebut memakai radius bervariasi 10–30px tergantung elemen: tombol 10px, kartu 16–24px, pill 20–30px). Titik tengah 16px dipilih, **bukan** mengikuti radius berbeda per jenis elemen seperti `design.html` — satu radius konsisten tetap dipertahankan karena admin panel butuh elemen tabel/form presisi (jadwal, log), dan `design.html` sendiri tidak mencakup admin panel sehingga tidak ada data pembanding untuk itu. Tetap sengaja **tidak** memakai bentuk blob/organik penuh.
- **Shadow**: satu level elevation lembut (`0 2px 8px rgba(31,59,59,0.08)`) untuk kartu di atas `color-latar` — dihindari shadow berlapis/neumorphism yang menambah kesan ramai.

### Motion

- **Default: tanpa animasi berlebih** — ini keputusan sadar, bukan kelalaian, mengikuti prinsip restraint `frontend-design` (animasi berlebihan justru jadi salah satu penanda "terlihat dibuat AI").
- **Pengecualian bertujuan #1**: glow halus pada badge status "Buka sekarang" (lihat §4 Signature) — durasi 2.4s, easing `ease-in-out`, breathing opacity 0.7↔1.0. Langsung terhubung ke fungsi (menandakan status "hidup/real-time"), bukan dekorasi lepas.
- **Pengecualian bertujuan #2 (revisi 2026-08-18, instruksi eksplisit pemilik proyek)**: auto-rotate pada slideshow fasilitas layanan di hero (`components/public/HeroSlideshow.tsx`) — interval 4.5s, transisi opacity 700ms. Awalnya panel hero didesain statis justru supaya glow Indikator Cahaya tetap jadi satu-satunya motion; direvisi setelah pemilik proyek secara eksplisit meminta slideshow foto fasilitas untuk menaikkan kesan meyakinkan halaman portofolio ini (CLAUDE.md §0). Auto-rotate berhenti saat pointer/fokus di atas panel, dan saat `prefers-reduced-motion` aktif (lihat baris di bawah) — supaya tetap konsisten dengan prinsip restraint di atas selama tidak benar-benar dibutuhkan pengunjung.
- **`prefers-reduced-motion`**: glow diganti halo statis solid (opacity 1.0 tetap); slideshow hero berhenti auto-rotate (berhenti di slide yang sedang tampil, navigasi manual lewat tombol panah/dot tetap berfungsi) — tidak ada informasi yang hilang di kedua kasus.

---

## 4. Elemen Ciri Khas (Signature)

**Indikator Cahaya** — badge status buka/tutup (S3, direplikasi di ringkasan Dashboard Admin S6) dirender sebagai **titik cahaya dengan halo lembut**, bukan badge traffic-light generik (dot hijau/merah solid).

- **Buka sekarang**: titik `color-jaga` dengan halo radial yang "bernapas" pelan (lihat Motion di atas) — secara visual seolah titik itu benar-benar menyala.
- **Tutup**: titik `color-senja` tanpa halo, redup/flat — cahaya yang "belum menyala", bukan tanda dilarang/error.

**Kenapa ini cocok untuk brief ini, bukan sekadar dekorasi**: nama klinik ini secara harfiah "Cahaya" — dan pertanyaan pertama pengunjung yang datang mendesak (Flow B, User Flow & Wireframe) adalah "klinik ini buka tidak." Alih-alih menjawab pertanyaan itu dengan traffic-light generik (pola yang bisa dipasang di brief manapun — supermarket, bengkel, apotek), sistem ini menjawabnya dengan elemen yang literal menjadi bahasa visual brand-nya sendiri: status operasional klinik ini SECARA HARFIAH direpresentasikan sebagai cahaya yang menyala atau belum menyala. Elemen yang sama dipakai ulang di S6 (ringkasan admin) supaya admin juga melihat status publik yang sama persis dengan yang dilihat pasien — satu sumber kebenaran visual.

Uji kalibrasi (§SKILL.md langkah 3): jika brief serupa datang dari klinik lain bernama "Klinik Sehat Bersama" (tanpa unsur "cahaya" di nama), elemen ini **tidak** akan dipakai ulang mentah-mentah — motif signature harus diturunkan ulang dari nama/identitas klien tersebut. Ini menandakan elemen ini benar-benar spesifik untuk brief Klinik Cahaya Medika, bukan komponen template lepas.

---

## 5. Component Blueprint

### Tombol CTA WhatsApp
- **Anatomi**: ikon WA + label teks + (opsional) sublabel kecil "Respon cepat".
- **Varian**: Primary (isi `color-cta-whatsapp`, dipakai di S1 hero & S4) — hanya satu varian, sengaja tidak diberi varian ghost/outline karena CTA ini harus selalu jadi elemen paling menonjol di viewport (SOW §8).
- **State**: default, hover (darken 8%), focus (ring 2px `color-cahaya`, offset 2px), active (scale 0.98).
- **Do**: label selalu berupa kata kerja aktif — "Chat via WhatsApp", bukan "WhatsApp" saja.
- **Don't**: jangan pernah mengecilkan ukuran tombol ini di breakpoint manapun di bawah target sentuh 44×44px — ini elemen konversi utama.

### Tombol Sekunder (navigasi anchor, tombol admin non-primer)
- **Anatomi**: label teks, opsional ikon kiri.
- **Varian**: Outline (`border color-nakhoda`, teks `color-nakhoda`) untuk aksi sekunder publik; Solid `color-cahaya` dengan teks `color-nakhoda` (bukan putih — kontras putih di atas amber `#E2963C` tidak mencapai AA 4.5:1) untuk aksi sekunder yang perlu penekanan (mis. "Lihat Semua Layanan").
- **State**: default, hover, focus (ring visible), disabled (opacity 40%).
- **Do**: pakai untuk aksi yang bukan konversi utama.
- **Don't**: jangan pakai `color-cta-whatsapp` di luar tombol WA — warna itu reserved khusus supaya asosiasinya tetap kuat.

### Indikator Cahaya (Status Badge) — lihat §4
- **Anatomi**: titik (12px), halo (opsional, hanya saat "buka"), label teks di sampingnya ("Buka sekarang" / "Tutup").
- **Varian**: Buka (`color-jaga` + halo), Tutup (`color-senja`, flat).
- **State**: Loading (skeleton pulse abu-abu netral, bukan warna semantik apa pun — supaya tidak salah baca sebagai status sungguhan), Populated, Error → fallback ke jam operasional default (Technical Spec §5) ditampilkan sebagai Tutup-style tanpa klaim real-time.
- **Do**: selalu sandingkan titik dengan label teks — jangan mengandalkan warna saja (prinsip aksesibilitas, lihat §7).
- **Don't**: jangan animasikan versi "Tutup" — hanya status aktif yang "bernapas".

### Kartu Layanan (Service Card, S1/S2)
- **Anatomi**: ikon layanan, nama layanan, 1 baris deskripsi singkat, link "Lihat detail" (scroll ke S2).
- **Varian**: hanya satu varian visual, tapi dipakai dalam grid 3–4 kolom (desktop) → 1 kolom stack (mobile 360px).
- **State**: default, hover (lift shadow halus), loading (skeleton).
- **Do**: ikon konsisten satu gaya (line-icon, bukan campur flat+line).
- **Don't**: jangan tambahkan angka urut (01/02/03) pada kartu ini — daftar layanan bukan sequence/proses berurutan, jadi penomoran di sini hanya dekorasi tanpa makna (mengikuti prinsip `frontend-design` §Structure is information).

### Baris Tabel Jadwal (S3)
- **Anatomi**: nama hari, nama dokter, jam praktik (format `IBM Plex Mono`, tabular).
- **Varian**: baris "hari ini" diberi latar `color-latar` sedikit lebih gelap (4%) + border kiri 3px `color-cahaya` untuk penanda posisi tanpa mengandalkan warna semantik status.
- **State**: default, empty (baris menampilkan teks italic "Jadwal belum diperbarui" — bukan baris kosong membingungkan, sesuai wireframe S3).
- **Do**: jam selalu format 24 jam (`08.00–15.00`), konsisten dengan konvensi lokal Indonesia.

### Kartu Navigasi Admin (Dashboard Hub, S6)
- **Anatomi**: ikon besar, label aksi ("Edit Jadwal Dokter" / "Edit Info Layanan" / "Lihat Riwayat"), 1 baris sublabel status terakhir diubah.
- **Varian**: 3 kartu setara besar (bukan sidebar bertingkat) — mengikuti keputusan UX wireframe §5 poin 1 yang eksplisit menolak menu bertingkat untuk persona David.
- **State**: default, hover (border `color-cahaya`), focus-visible (ring).
- **Do**: gunakan bahasa "yang dikontrol pengguna" — "Edit Jadwal Dokter", bukan "Kelola Modul Jadwal" (istilah sistem).
- **Don't**: jangan tambahkan badge notifikasi/angka merah — sistem ini tidak punya konsep notifikasi, memaksakannya hanya menambah beban kognitif yang eksplisit ingin dihindari NFR (training >15 menit).

### Input Form (Admin, S5/S7/S8)
- **Anatomi**: label di atas field (bukan placeholder-only — placeholder hilang saat mulai mengetik, buruk untuk admin non-tech-savvy), field, pesan bantuan/error di bawah.
- **Varian**: text, password (dengan toggle show/hide, S5), time-picker sederhana (S7), file upload drag-drop (S8).
- **State**: default, focus (border `color-cahaya` 2px), error (border `color-senja`... — **catatan**: error form sebaiknya pakai warna error yang jelas berbeda dari `color-senja` supaya tidak tertukar makna "tutup"; gunakan merah standar aksesibel `#C0392B` khusus untuk error validasi, di luar 6 token utama karena perannya benar-benar berbeda — kesalahan input vs status operasional), disabled, saving (spinner + field disabled).
- **Do**: pesan error spesifik ("Format jam tidak valid, gunakan HH.MM") — bukan generik ("Input salah").

### Toast Notifikasi (Save Success/Error, S7/S8)
- **Anatomi**: ikon status, pesan singkat, auto-dismiss 4 detik.
- **Varian**: Success ("Jadwal berhasil diperbarui" — pakai `color-jaga`), Error (pakai merah error, bukan `color-senja`).
- **Do**: pesan pakai kata kerja pasif-selesai yang cocok konteks — nama aksi tombol dan pesan toast harus konsisten (tombol "Simpan Jadwal" → toast "Jadwal berhasil disimpan", bukan "Update berhasil").

### Baris Log (Riwayat Perubahan, S9)
- **Anatomi**: timestamp (`IBM Plex Mono`), nama admin, jenis perubahan, ringkasan singkat.
- **Varian**: read-only, tanpa aksi apa pun per baris (sesuai keputusan wireframe §5 poin 5 — view-only).
- **State**: default, empty ("Belum ada perubahan tercatat").

---

## 6. Page Layout Blueprint

### Homepage — S1–S4 (satu halaman, anchor scroll)

**Konsep dalam satu kalimat**: Halaman yang menjawab "klinik ini buka tidak, dan bisa bantu saya tidak" dalam satu tarikan scroll, dengan CTA WhatsApp sebagai benang merah yang muncul di titik keputusan (hero dan kontak).

**Wireframe ASCII** (struktur mengikuti wireframe wajib dari User Flow & Wireframe §3, ditambah lapisan visual token):
```
┌──────────────────────────────────────────┐
│ [Logo Klinik]         [Tel: 0xx-xxxx]     │  ← sticky header, color-latar + border-bottom tipis nakhoda 8%
├──────────────────────────────────────────┤
│                                            │
│   Klinik Keluarga Terpercaya di ...       │  ← Fraunces H1, color-nakhoda
│   Sub-headline singkat, Plus Jakarta Sans │
│                                            │
│   ● Buka sekarang  (Indikator Cahaya)     │  ← signature, selalu di dekat hero
│                                            │
│   [ Chat via WhatsApp ]                   │  ← CTA primary, color-cta-whatsapp
│                                            │
├──────────────────────────────────────────┤
│  [Kartu][Kartu][Kartu][Kartu]  ← S2 ring. │  ← grid 3-4, service card
├──────────────────────────────────────────┤
│  Tahun berdiri · Jam operasional (strip)  │  ← badge kepercayaan, fakta bukan testimoni
├──────────────────────────────────────────┤
│  Jadwal Dokter Mingguan (tabel) — S3      │  ← IBM Plex Mono untuk jam
├──────────────────────────────────────────┤
│  Peta (embed) | [ Chat WA ] [ Telepon ]   │  ← S4, dua kanal kontak setara
├──────────────────────────────────────────┤
│  Footer — anchor link ke tiap section     │
└──────────────────────────────────────────┘
```

**Breakdown per section**:

| Section | Isi/tujuan | Kenapa urutannya begini |
|---|---|---|
| Header sticky | Identitas + kontak darurat cepat (tel:) | Selalu dapat diakses tanpa scroll balik — penting untuk Flow B (kunjungan mendesak) |
| Hero + Indikator Cahaya + CTA WA | Jawab pertanyaan pertama secepat mungkin | Sesuai Flow A/B — keputusan "hubungi atau tidak" harus bisa diambil di viewport pertama |
| Ringkasan Layanan (S2) | Validasi "klinik ini bisa bantu saya" | Langsung setelah hero, sebelum badge kepercayaan — relevansi kebutuhan didahulukan dari kredibilitas umum |
| Badge Kepercayaan | Fakta objektif (tahun berdiri, jam), bukan testimoni | Ditempatkan sesudah layanan supaya tidak terasa seperti "jualan" di awal |
| Jadwal Dokter (S3) | Detail operasional untuk yang sudah yakin datang | Section tersendiri karena butuh tabel — pengunjung yang scroll sejauh ini sudah dalam mode "siap datang" |
| Kontak & Lokasi (S4) | Tutup dengan dua kanal kontak setara (WA + telepon) | CTA WA diulang di sini secara sengaja (bukan duplikasi tanpa alasan) — titik keputusan kedua untuk pengunjung yang butuh lihat peta dulu sebelum menghubungi |

**Strategi konten**: Nada bahasa hangat-langsung, bukan formal-korporat maupun terlalu santai. Sistem "berbicara" dari sisi klinik yang membantu, bukan menjual — contoh: "Chat via WhatsApp" (aktif, jelas apa yang terjadi), bukan "Hubungi Kami" (pasif-generik) atau "Konsultasi Sekarang!" (terkesan jualan/urgent buatan). Istilah medis dijaga minimal dan familiar pasien awam ("jam praktik", bukan "jadwal operasional layanan kesehatan").

### Admin Panel — S5–S9

**Konsep dalam satu kalimat**: Panel yang terasa seperti "form kertas yang dipindah ke layar" — tidak ada yang perlu ditebak, tiga aksi besar, tanpa navigasi tersembunyi.

**Wireframe ASCII (S6 — Dashboard, representatif untuk register admin)**:
```
┌──────────────────────────────────────────┐
│ Klinik Cahaya Medika        [Keluar]      │  ← header admin, latar color-nakhoda, teks putih
├──────────────────────────────────────────┤
│ ● Buka sekarang   ·  Terakhir diubah: ... │  ← Indikator Cahaya yang sama dgn publik
├──────────────────────────────────────────┤
│                                            │
│  [ Edit Jadwal   ]  [ Edit Info    ]      │
│  [   Dokter      ]  [   Layanan    ]      │  ← 2 kartu besar, setara
│                                            │
│  [ Lihat Riwayat Perubahan          ]     │  ← kartu ke-3, lebar penuh
│                                            │
└──────────────────────────────────────────┘
```

**Breakdown per section**:

| Section | Isi/tujuan | Kenapa urutannya begini |
|---|---|---|
| Header admin | Konteks "saya sedang di panel admin, bukan halaman publik" + jalan keluar cepat | `color-nakhoda` solid membedakan register admin dari publik yang latarnya terang — sinyal visual "mode kerja" |
| Indikator Cahaya (ringkasan) | Admin melihat status yang sama dengan pasien | Konsistensi kepercayaan — admin tahu persis apa yang dilihat pasien saat ini |
| 3 kartu aksi | Satu-satunya jalan navigasi | Sesuai keputusan wireframe §5 — tanpa sidebar, tanpa menu bertingkat |

**Strategi konten admin**: Instruksi selalu dalam bentuk perintah aktif yang bisa langsung dieksekusi ("Simpan Jadwal", bukan "Submit"). Error tidak pernah menyalahkan pengguna secara implisit ("Format jam tidak valid, gunakan HH.MM" — bukan "Input salah").

---

## 7. Aksesibilitas & Responsif

- **Kontras warna**: seluruh pasangan teks-latar diverifikasi ≥4.5:1 (WCAG AA, target eksplisit PRD §7). Catatan khusus: teks di atas `color-cahaya` (#E2963C) **wajib** memakai `color-nakhoda` gelap, bukan putih — putih di atas amber ini tidak lolos AA.
- **Target sentuh minimum**: 44×44px untuk seluruh elemen interaktif, termasuk baris tabel jadwal yang bisa ditekan (mobile) dan toggle show/hide password.
- **Fokus keyboard**: ring 2px `color-cahaya` dengan offset 2px, terlihat jelas di kedua register (publik terang, admin gelap) — diuji tidak hilang di atas latar `color-nakhoda`.
- **Breakpoint** (PRD §7): 360px (mobile, 1 kolom, header non-sticky untuk hemat viewport), 768px (tablet, grid 2 kolom untuk kartu layanan), 1280px (desktop, grid 3–4 kolom, sidebar-free tetap dipertahankan di admin karena hanya 3 aksi).
- **Reduced motion**: satu-satunya motion di sistem (glow Indikator Cahaya) diganti halo statis solid — tidak ada informasi yang hilang, hanya animasi.
- **Tidak mengandalkan warna saja**: status buka/tutup, baris "hari ini" di tabel jadwal, dan error form semua disertai label teks/ikon, bukan warna semata — penting karena target audiens lintas usia (PRD §7) yang mungkin termasuk pengguna low-vision atau color-blind.

---

## 8. Catatan Self-Critique

- **Draf pertama sempat memakai biru-teal generik + hijau sebagai satu-satunya aksen** (pola "klinik sehat" paling umum). Direvisi karena ini persis pola yang riset §2 tandai sebagai kesan steril yang ingin dihindari 2026 — diganti dengan `color-nakhoda` (teal-gelap-netral, bukan biru cerah) + `color-cahaya` (amber, bukan hijau kedua) supaya identitas warna tidak habis di "hijau kesehatan" yang generik.
- **Draf pertama memakai badge status traffic-light standar (dot hijau/merah solid).** Direvisi jadi Indikator Cahaya (§4) setelah disadari nama klinik ini secara harfiah menyebut "cahaya" — traffic-light generik akan lolos begitu saja tanpa ada yang menyadari peluang ini terlewat.
- **Dipertimbangkan memakai bentuk blob/organik penuh** (tren 2026 yang muncul di riset §2, SpreadSimple) untuk membedakan dari kesan klinis. **Ditolak** karena admin panel butuh elemen tabel/form presisi (jadwal, log) — bentuk organik penuh akan berbenturan dengan kebutuhan fungsional tabel jam praktik. Radius lunak 12px dipertahankan sebagai kompromi yang konsisten di kedua register, tanpa mengorbankan presisi tabel.
- **Dipertimbangkan memakai `color-cahaya` (amber) untuk tombol CTA WhatsApp juga**, demi konsistensi brand penuh. **Ditolak secara sadar** (lihat §3, baris `color-cta-whatsapp`) — riset §2 menunjukkan pengenalan visual instan "hijau WA" mengurangi friksi konversi, dan itu lebih penting untuk CTA utama daripada konsistensi palet murni. Dicatat eksplisit sebagai pengecualian yang disengaja, bukan inkonsistensi yang terlewat.
- **Warna error form** awalnya hendak memakai `color-senja` (yang juga dipakai untuk status "tutup"). Direvisi ke merah error terpisah di luar 6 token utama (§5, Input Form) karena "tutup" dan "kesalahan input" adalah dua makna yang sangat berbeda secara fungsional — memakai warna yang sama berisiko admin salah baca tingkat urgensi.
- **Revisi sinkronisasi dengan `design.html` (2026-08-18)**: user meng-upload mock desain eksternal dan meminta token disinkronkan. Dipertimbangkan untuk mengadopsi `design.html` secara penuh (termasuk konten estetik/dermatologi, radius per-elemen, dan CTA WA yang memakai warna aksen umum). **Ditolak sebagian** — hanya token yang punya padanan langsung di `design.html` (warna latar/teks/aksen/status-buka, typeface tunggal Figtree) yang disinkronkan; token tanpa padanan (CTA WA, status tutup, error) dan keputusan struktural yang punya rasional fungsional independen (radius tunggal untuk presisi tabel admin, IBM Plex Mono untuk data, struktur konten klinik keluarga) dipertahankan. Ini konsisten dengan prinsip dokumen ini: skill/referensi desain eksternal adalah masukan yang dievaluasi, bukan otoritas yang menimpa keputusan berdasar riset tanpa pertimbangan (lihat CLAUDE.md §2.3).

---

*Dokumen ini siap dipakai sebagai brief implementasi kode (Next.js + Tailwind, sesuai Technical Spec) atau referensi Figma low-fi → high-fi. Nilai hex di §3 adalah titik awal yang bisa diverifikasi lagi lewat contrast checker saat implementasi nyata.*
