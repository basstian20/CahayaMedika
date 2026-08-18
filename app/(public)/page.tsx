import {
  getKlinikInfo,
  getLayananPublik,
  getDokterPublik,
  getJadwalPublik,
} from "@/lib/modules/klinik-info/klinik-info.repository";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { KlinikStatusBadge } from "@/components/public/KlinikStatusBadge";

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
        <span className="font-display text-lg font-semibold text-nakhoda">
          {klinikInfo?.nama ?? "Klinik Cahaya Medika"}
        </span>
        <nav className="hidden items-center gap-6 text-sm font-medium text-nakhoda/70 md:flex">
          <a href="#layanan" className="hover:text-nakhoda">
            Layanan
          </a>
          <a href="#dokter" className="hover:text-nakhoda">
            Dokter
          </a>
          <a href="#jadwal" className="hover:text-nakhoda">
            Jadwal
          </a>
          <a href="#kontak" className="hover:text-nakhoda">
            Kontak
          </a>
        </nav>
        {klinikInfo?.telepon && (
          <a href={`tel:${klinikInfo.telepon}`} className="whitespace-nowrap text-sm font-medium text-nakhoda">
            Tel: {klinikInfo.telepon}
          </a>
        )}
      </header>

      {/* Hero — S1 */}
      <section className="px-6 py-16 text-center md:py-24">
        {klinikInfo?.tahun_berdiri && (
          <span className="mb-6 inline-block rounded-full bg-cahaya/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-nakhoda">
            Klinik Keluarga · Sejak {klinikInfo.tahun_berdiri}
          </span>
        )}
        <h1 className="mx-auto max-w-2xl font-display text-[32px] font-semibold leading-[1.15] text-nakhoda md:text-[44px] md:leading-[1.1]">
          Klinik Keluarga Terpercaya di {klinikInfo?.alamat?.split(",").pop()?.trim() ?? "Kota Anda"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-nakhoda/70 md:text-[17px]">
          Melayani kebutuhan kesehatan keluarga Anda dengan tenaga medis berpengalaman.
        </p>

        <div className="mt-6 flex justify-center">
          <KlinikStatusBadge
            jadwalMingguIni={jadwal.map((j) => ({
              hari: j.hari,
              jam_mulai: j.jam_mulai.slice(0, 5),
              jam_selesai: j.jam_selesai.slice(0, 5),
            }))}
            jamOperasionalDefault={klinikInfo?.jam_operasional_default}
          />
        </div>

        {nomorWhatsApp && (
          <div className="mt-8">
            <WhatsAppButton nomor={nomorWhatsApp} />
          </div>
        )}
      </section>

      {/* Ringkasan Layanan — S2 */}
      {layanan.length > 0 && (
        <section id="layanan" className="px-6 py-16">
          <h2 className="mb-8 text-center font-display text-2xl font-semibold text-nakhoda md:text-[32px]">
            Layanan Kami
          </h2>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-1 md:grid-cols-3">
            {layanan.map((l) => (
              <div
                key={l.id}
                className="rounded-xl border border-nakhoda/10 bg-white p-7 shadow-card transition hover:shadow-lg"
              >
                <div className="mb-4 h-11 w-11 rounded-xl bg-cahaya/10" aria-hidden />
                <h3 className="mb-2 font-display text-lg font-semibold text-nakhoda">{l.nama}</h3>
                <p className="text-sm leading-relaxed text-nakhoda/70">{l.deskripsi}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badge Kepercayaan */}
      {klinikInfo && (
        <section className="grid grid-cols-1 border-y border-nakhoda/10 sm:grid-cols-2">
          <div className="border-b border-nakhoda/10 px-6 py-7 text-center sm:border-b-0 sm:border-r sm:text-left md:px-16">
            <div className="font-display text-2xl font-extrabold text-cahaya">{klinikInfo.tahun_berdiri}</div>
            <div className="mt-1 text-sm text-nakhoda/70">Melayani sejak</div>
          </div>
          <div className="px-6 py-7 text-center sm:text-left md:px-16">
            <div className="font-mono text-2xl font-extrabold tabular-nums text-cahaya">
              {formatJam(klinikInfo.jam_operasional_default.jam_mulai)}–
              {formatJam(klinikInfo.jam_operasional_default.jam_selesai)}
            </div>
            <div className="mt-1 text-sm text-nakhoda/70">Jam operasional</div>
          </div>
        </section>
      )}

      {/* Profil Dokter — S2 (grid kartu foto + nama + spesialisasi, Wireframe §S2) */}
      {dokter.length > 0 && (
        <section id="dokter" className="px-6 py-16">
          <h2 className="mb-8 text-center font-display text-2xl font-semibold text-nakhoda md:text-[32px]">
            Tenaga Medis Kami
          </h2>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3">
            {dokter.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-nakhoda/10 bg-white p-6 text-center shadow-card transition hover:shadow-lg"
              >
                {d.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.foto_url}
                    alt={d.nama}
                    className="mx-auto mb-4 h-32 w-32 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-xl bg-nakhoda/10"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-12 w-12 text-nakhoda/40"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                    </svg>
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold text-nakhoda">{d.nama}</h3>
                <p className="text-sm text-nakhoda/70">{d.spesialisasi}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jadwal Dokter Mingguan — S3 */}
      {dokter.length > 0 && (
        <section id="jadwal" className="px-6 py-16">
          <h2 className="mb-8 text-center font-display text-2xl font-semibold text-nakhoda md:text-[32px]">
            Jadwal Dokter Mingguan
          </h2>
          <div className="mx-auto max-w-3xl overflow-x-auto rounded-xl border border-nakhoda/10 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-nakhoda/10 text-xs uppercase text-nakhoda/50">
                  <th className="p-4">Hari</th>
                  <th className="p-4">Dokter</th>
                  <th className="p-4">Jam Praktik</th>
                </tr>
              </thead>
              <tbody>
                {HARI_URUTAN.flatMap((hari) => {
                  const rows = jadwal.filter((j) => j.hari === hari);
                  if (rows.length === 0) {
                    return (
                      <tr key={hari} className="border-b border-nakhoda/5 last:border-0">
                        <td className="p-4 font-medium text-nakhoda">{HARI_LABEL[hari]}</td>
                        <td className="p-4 italic text-nakhoda/40" colSpan={2}>
                          Jadwal belum diperbarui
                        </td>
                      </tr>
                    );
                  }
                  return rows.map((j) => {
                    const dokterNama = dokter.find((d) => d.id === j.dokter_id)?.nama ?? "-";
                    return (
                      <tr key={j.id} className="border-b border-nakhoda/5 last:border-0">
                        <td className="p-4 font-medium text-nakhoda">{HARI_LABEL[hari]}</td>
                        <td className="p-4 text-nakhoda">{dokterNama}</td>
                        <td className="p-4 font-mono tabular-nums text-nakhoda">
                          {formatJam(j.jam_mulai)}–{formatJam(j.jam_selesai)}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Kontak & Lokasi — S4 */}
      <section id="kontak" className="grid grid-cols-1 gap-10 bg-nakhoda px-6 py-16 text-white md:grid-cols-2 md:px-16">
        <div className="flex flex-col justify-center">
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
          <a href="#jadwal">Jadwal</a>
          <a href="#kontak">Kontak</a>
        </nav>
        <p>
          © {new Date().getFullYear()} {klinikInfo?.nama ?? "Klinik Cahaya Medika"}
        </p>
      </footer>
    </>
  );
}
