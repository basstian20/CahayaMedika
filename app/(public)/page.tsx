import {
  getKlinikInfo,
  getLayananPublik,
  getDokterPublik,
  getJadwalPublik,
} from "@/lib/modules/klinik-info/klinik-info.repository";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { KlinikStatusBadge } from "@/components/public/KlinikStatusBadge";
import { KlinikStatusPanel } from "@/components/public/KlinikStatusPanel";
import { JamOperasionalHariIni } from "@/components/public/JamOperasionalHariIni";
import Image from "next/image";
import { HeroSlideshow } from "@/components/public/HeroSlideshow";
import { LayananCard } from "@/components/public/LayananCard";

const HARI_LABEL: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};
const HARI_URUTAN = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];

function formatJam(jam: string) {
  return jam.slice(0, 5).replace(":", ".");
}

// Server Component — SSG + on-demand ISR (TSD §3.3). Query langsung Supabase
// (anon client + RLS publik), tidak lewat Route Handler (Backend Blueprint §5).
export default async function HomePage() {
  const [klinikInfo, layanan, dokter, jadwal] = await Promise.all([
    getKlinikInfo(),
    getLayananPublik(),
    getDokterPublik(),
    getJadwalPublik(),
  ]);

  const nomorWhatsApp = klinikInfo?.telepon ?? "";

  const jadwalMingguIni = jadwal.map((j) => ({
    hari: j.hari,
    jam_mulai: j.jam_mulai.slice(0, 5),
    jam_selesai: j.jam_selesai.slice(0, 5),
  }));

  const jsonLd = klinikInfo
    ? {
        "@context": "https://schema.org",
        "@type": "MedicalClinic",
        name: klinikInfo.nama,
        address: klinikInfo.alamat,
        telephone: klinikInfo.telepon,
        geo: {
          "@type": "GeoCoordinates",
          latitude: klinikInfo.koordinat_lat,
          longitude: klinikInfo.koordinat_lng,
        },
        foundingDate: String(klinikInfo.tahun_berdiri),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Header sticky — S1 */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-nakhoda/10 bg-latar/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="" width={46} height={44} className="h-11 w-auto" priority aria-hidden />
          <span className="font-display text-lg font-semibold text-nakhoda">
            {klinikInfo?.nama ?? "Klinik Cahaya Medika"}
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-nakhoda/70 md:flex">
          <a href="#layanan" className="hover:text-nakhoda">
            Layanan
          </a>
          <a href="#dokter" className="hover:text-nakhoda">
            Dokter
          </a>
          <a href="#kontak" className="hover:text-nakhoda">
            Kontak
          </a>
        </nav>
        <div className="flex items-center gap-4">
          {klinikInfo?.telepon && (
            <a
              href={`tel:${klinikInfo.telepon}`}
              className="hidden whitespace-nowrap text-sm font-medium text-nakhoda md:inline"
            >
              Tel: {klinikInfo.telepon}
            </a>
          )}
          {nomorWhatsApp && <WhatsAppButton nomor={nomorWhatsApp} size="compact" label="Chat WhatsApp" />}
        </div>
      </header>

      {/* Hero — S1 */}
      <section className="grid gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-16">
        <div>
          {klinikInfo?.tahun_berdiri && (
            <span className="mb-6 inline-block rounded-full bg-cahaya/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-nakhoda">
              Klinik Keluarga · Sejak {klinikInfo.tahun_berdiri}
            </span>
          )}
          <h1 className="max-w-xl font-display text-[32px] font-semibold leading-[1.15] text-nakhoda md:text-[44px] md:leading-[1.1]">
            Klinik Keluarga Terpercaya di {klinikInfo?.alamat?.split(",").pop()?.trim() ?? "Kota Anda"}
          </h1>
          <p className="mt-4 max-w-lg text-base text-nakhoda/70 md:text-[17px]">
            Melayani kebutuhan kesehatan keluarga Anda dengan tenaga medis berpengalaman.
          </p>

          <div className="mt-6">
            <KlinikStatusBadge
              jadwalMingguIni={jadwalMingguIni}
              jamOperasionalDefault={klinikInfo?.jam_operasional_default}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {nomorWhatsApp && <WhatsAppButton nomor={nomorWhatsApp} />}
            <a
              href="#layanan"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-nakhoda/20 px-6 py-3 font-medium text-nakhoda transition hover:border-nakhoda/40"
            >
              Lihat Layanan
            </a>
          </div>
        </div>

        <HeroSlideshow />
      </section>

      {/* Ringkasan Layanan — S2 */}
      {layanan.length > 0 && (
        <section id="layanan" className="px-6 py-16 md:px-16">
          <div className="mx-auto mb-8 max-w-5xl">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-cahaya">Layanan Unggulan</div>
            <h2 className="font-display text-2xl font-semibold text-nakhoda md:text-[32px]">
              Apa yang paling sering dibutuhkan keluarga Anda
            </h2>
          </div>
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-4">
            {layanan.map((l) => (
              <LayananCard key={l.id} nama={l.nama} deskripsi={l.deskripsi} />
            ))}
          </div>
        </section>
      )}

      {/* Badge Kepercayaan — strip 4 kolom ala docs/design.html. Portofolio
          ilustratif (CLAUDE.md §0): "Pasien dilayani" statis/ilustratif atas
          persetujuan eksplisit, sisanya dihitung dari data asli (dokter.length,
          tahun_berdiri, jam_operasional_default) — tidak ada angka mengarang
          di luar satu kolom itu. */}
      {klinikInfo && (
        <section className="grid grid-cols-2 border-y border-nakhoda/10 md:grid-cols-4">
          <div className="border-b border-r border-nakhoda/10 px-6 py-7 md:border-b-0 md:px-10">
            <div className="font-display text-2xl font-extrabold text-cahaya">{klinikInfo.tahun_berdiri}</div>
            <div className="mt-1 text-sm text-nakhoda/70">Melayani sejak</div>
          </div>
          <div className="border-b border-nakhoda/10 px-6 py-7 md:border-b-0 md:border-r md:px-10">
            <div className="font-display text-2xl font-extrabold text-cahaya">500+</div>
            <div className="mt-1 text-sm text-nakhoda/70">Pasien dilayani</div>
          </div>
          <div className="border-r border-nakhoda/10 px-6 py-7 md:px-10">
            <div className="font-display text-2xl font-extrabold text-cahaya">{dokter.length}</div>
            <div className="mt-1 text-sm text-nakhoda/70">Dokter berpengalaman</div>
          </div>
          <div className="px-6 py-7 md:px-10">
            <div className="font-mono text-2xl font-extrabold tabular-nums text-cahaya">
              <JamOperasionalHariIni
                jadwalMingguIni={jadwalMingguIni}
                jamOperasionalDefault={klinikInfo.jam_operasional_default}
              />
            </div>
            <div className="mt-1 text-sm text-nakhoda/70">Jam operasional hari ini</div>
          </div>
        </section>
      )}

      {/* Profil Dokter + Jadwal — S2+S3 digabung (per instruksi eksplisit owner:
          jadwal tidak lagi jadi tabel terpisah, melebur ke tiap kartu dokter).
          Foto pakai aspect-[3/4] (bukan avatar bujur sangkar) supaya sesuai
          rasio asli foto sumber dan kepala tidak terpotong object-cover. */}
      {dokter.length > 0 && (
        <section id="dokter" className="px-6 py-16 md:px-16">
          <div className="mx-auto mb-8 max-w-5xl">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-cahaya">Tenaga Medis</div>
            <h2 className="font-display text-2xl font-semibold text-nakhoda md:text-[32px]">Dokter kami</h2>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dokter.map((d) => {
              const jadwalDokter = HARI_URUTAN.map((hari) => jadwal.find((j) => j.dokter_id === d.id && j.hari === hari)).filter(
                (j): j is (typeof jadwal)[number] => Boolean(j)
              );
              return (
                <div
                  key={d.id}
                  className="overflow-hidden rounded-xl border border-nakhoda/10 bg-white shadow-card transition hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] w-full bg-nakhoda/10">
                    {d.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.foto_url}
                        alt={d.nama}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center" aria-hidden>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className="h-16 w-16 text-nakhoda/40"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-nakhoda">{d.nama}</h3>
                    <p className="text-sm text-nakhoda/70">{d.spesialisasi}</p>

                    <div className="mt-4 border-t border-nakhoda/10 pt-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-nakhoda/50">Jam Praktik</div>
                      {jadwalDokter.length > 0 ? (
                        <ul className="space-y-1.5 text-sm">
                          {jadwalDokter.map((j) => (
                            <li key={j.id} className="flex items-center justify-between gap-3">
                              <span className="text-nakhoda/70">{HARI_LABEL[j.hari]}</span>
                              <span className="font-mono tabular-nums text-nakhoda">
                                {formatJam(j.jam_mulai)}–{formatJam(j.jam_selesai)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm italic text-nakhoda/40">Jadwal belum diperbarui</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Kontak & Lokasi — S4 */}
      <section id="kontak" className="grid grid-cols-1 gap-10 bg-nakhoda px-6 py-16 text-white md:grid-cols-2 md:px-16">
        <div className="flex flex-col justify-center">
          <KlinikStatusPanel
            jadwalMingguIni={jadwalMingguIni}
            jamOperasionalDefault={klinikInfo?.jam_operasional_default}
          />
          <h2 className="mb-4 font-display text-2xl font-semibold md:text-[32px]">Kontak & Lokasi</h2>
          {klinikInfo?.alamat && <p className="mb-6 text-white/70">{klinikInfo.alamat}</p>}
          <div className="flex flex-wrap gap-4">
            {nomorWhatsApp && <WhatsAppButton nomor={nomorWhatsApp} />}
            {klinikInfo?.telepon && (
              <a
                href={`tel:${klinikInfo.telepon}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/40 px-6 py-3 font-medium text-white transition hover:border-white"
              >
                Telepon Klinik
              </a>
            )}
          </div>
        </div>
        {klinikInfo && (
          <iframe
            title="Lokasi Klinik"
            className="h-64 w-full rounded-xl border-0 md:h-full md:min-h-[220px]"
            src={`https://www.google.com/maps?q=${klinikInfo.koordinat_lat},${klinikInfo.koordinat_lng}&output=embed`}
            loading="lazy"
          />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-nakhoda/10 px-6 py-8 text-center text-sm text-nakhoda/50">
        <nav className="mb-2 flex justify-center gap-4">
          <a href="#layanan">Layanan</a>
          <a href="#dokter">Dokter</a>
          <a href="#kontak">Kontak</a>
        </nav>
        <p>
          © {new Date().getFullYear()} {klinikInfo?.nama ?? "Klinik Cahaya Medika"}
        </p>
      </footer>
    </>
  );
}
