// Elemen signature — "Indikator Cahaya" (UI Template Spec §4). Titik cahaya
// dengan halo lembut yang "bernapas" saat buka; TIDAK dianimasikan saat tutup.
// Selalu disandingkan dengan label teks — status tidak boleh bergantung warna saja (§7).
interface IndikatorCahayaProps {
  status: "buka" | "tutup" | "unknown";
}

export function IndikatorCahaya({ status }: IndikatorCahayaProps) {
  if (status === "unknown") {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-nakhoda/60">
        <span className="h-3 w-3 rounded-full bg-nakhoda/20" aria-hidden />
        Status jam praktik belum tersedia
      </span>
    );
  }

  const isBuka = status === "buka";

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-nakhoda">
      <span className="relative flex h-3 w-3 items-center justify-center">
        {isBuka && (
          <span
            className="absolute inline-flex h-full w-full animate-breathe rounded-full bg-jaga/50"
            aria-hidden
          />
        )}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${isBuka ? "bg-jaga" : "bg-senja"}`}
          aria-hidden
        />
      </span>
      {isBuka ? "Buka sekarang" : "Tutup"}
    </span>
  );
}
