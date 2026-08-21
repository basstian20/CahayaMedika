import Image from "next/image";

const HARI_LABEL: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

function formatJam(jam: string) {
  return jam.slice(0, 5).replace(":", ".");
}

interface DokterCardProps {
  nama: string;
  spesialisasi: string;
  fotoUrl: string | null;
  /** Jam praktik (S2+S3 digabung). Kalau di-omit, tampilkan catatan "dikelola di halaman lain" alih-alih daftar kosong. */
  jadwal?: { hari: string; jam_mulai: string; jam_selesai: string }[];
}

// Diekstrak dari app/(public)/page.tsx — dipakai di homepage publik dan
// dipakai ulang di preview pane admin (DokterForm/JadwalForm) supaya admin
// lihat kartu yang sama persis dengan yang dilihat pasien.
export function DokterCard({ nama, spesialisasi, fotoUrl, jadwal }: DokterCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-nakhoda/10 bg-white shadow-card transition hover:shadow-lg">
      <div className="relative aspect-[3/4] w-full bg-nakhoda/10">
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt={nama}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top"
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
        <h3 className="font-display text-lg font-semibold text-nakhoda">{nama || "Nama dokter"}</h3>
        <p className="text-sm text-nakhoda/70">{spesialisasi || "Spesialisasi"}</p>

        <div className="mt-4 border-t border-nakhoda/10 pt-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-nakhoda/50">Jam Praktik</div>
          {jadwal === undefined ? (
            <p className="text-sm italic text-nakhoda/40">Jam praktik dikelola di halaman Jadwal</p>
          ) : jadwal.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {jadwal.map((j, i) => (
                <li key={`${j.hari}-${i}`} className="flex items-center justify-between gap-3">
                  <span className="text-nakhoda/70">{HARI_LABEL[j.hari] ?? j.hari}</span>
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
}
