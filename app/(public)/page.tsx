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
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-nakhoda/10 bg-latar/95 px-6 py-4 backdrop-blur">
        <span className="font-display text-lg font-semibold text-nakhoda">
          {klinikInfo?.nama ?? "Klinik Cahaya Medika"}
        </span>
        {klinikInfo?.telepon && (
          <a href={`tel:${klinikInfo.telepon}`} className="text-sm font-medium text-nakhoda">
            Tel: {klinikInfo.telepon}
          </a>
        )}
      </header>

      {/* Hero — S1 */}
      <section className="px-6 py-16 text-center md:py-24">
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
              <div key={l.id} className="rounded-xl bg-white p-6 shadow-card transition hover:shadow-lg">
                <h3 className="mb-2 font-display text-lg font-semibold text-nakhoda">{l.nama}</h3>
                <p className="text-sm text-nakhoda/70">{l.deskripsi}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badge Kepercayaan */}
      {klinikInfo && (
        <section className="border-y border-nakhoda/10 bg-white px-6 py-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2 text-center text-sm text-nakhoda/70 md:flex-row md:gap-8">
            <span>Berdiri sejak {klinikInfo.tahun_berdiri}</span>
            <span className="hidden md:inline">·</span>
            <span className="font-mono tabular-nums">
              Jam operasional: {formatJam(klinikInfo.jam_operasional_default.jam_mulai)}–
              {formatJam(klinikInfo.jam_operasional_default.jam_selesai)}
            </span>
          </div>
        </section>
      )}

      {/* Jadwal Dokter Mingguan — S3 */}
      {dokter.length > 0 && (
        <section id="jadwal" className="px-6 py-16">
          <h2 className="mb-8 text-center font-display text-2xl font-semibold text-nakhoda md:text-[32px]">
            Jadwal Dokter Mingguan
          </h2>
          <div className="mx-auto max-w-3xl overflow-x-auto rounded-xl bg-white shadow-card">
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
      <section id="kontak" className="px-6 py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-semibold text-nakhoda md:text-[32px]">
          Kontak & Lokasi
        </h2>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          {klinikInfo?.alamat && <p className="text-nakhoda/70">{klinikInfo.alamat}</p>}
          {klinikInfo && (
            <iframe
              title="Lokasi Klinik"
              className="h-64 w-full rounded-xl border-0"
              src={`https://www.google.com/maps?q=${klinikInfo.koordinat_lat},${klinikInfo.koordinat_lng}&output=embed`}
              loading="lazy"
            />
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {nomorWhatsApp && <WhatsAppButton nomor={nomorWhatsApp} />}
            {klinikInfo?.telepon && (
              <a
                href={`tel:${klinikInfo.telepon}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-nakhoda px-6 py-3 font-medium text-nakhoda"
              >
                Telepon Klinik
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-nakhoda/10 px-6 py-8 text-center text-sm text-nakhoda/50">
        <nav className="mb-2 flex justify-center gap-4">
          <a href="#layanan">Layanan</a>
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
