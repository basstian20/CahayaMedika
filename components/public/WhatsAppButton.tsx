import { buildWhatsAppLink } from "@/lib/shared/whatsapp";

interface WhatsAppButtonProps {
  nomor: string;
  pesan?: string;
  className?: string;
}

// Tombol CTA WhatsApp — satu-satunya varian (Primary), tidak diberi ghost/outline
// (UI Template Spec §5) supaya selalu jadi elemen paling menonjol.
export function WhatsAppButton({
  nomor,
  pesan = "Halo, saya ingin bertanya tentang layanan Klinik Cahaya Medika.",
  className = "",
}: WhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsAppLink(nomor, pesan)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cta-whatsapp px-6 py-3 font-medium text-white transition hover:brightness-95 active:scale-[0.98] ${className}`}
    >
      Chat via WhatsApp
    </a>
  );
}
