import { buildWhatsAppLink } from "@/lib/shared/whatsapp";

interface WhatsAppButtonProps {
  nomor: string;
  pesan?: string;
  className?: string;
  /** "default" untuk hero/kontak, "compact" untuk header sticky — radius & target sentuh tetap sama (UI Template Spec §5 Don't). */
  size?: "default" | "compact";
  label?: string;
}

// Tombol CTA WhatsApp — satu-satunya varian (Primary), tidak diberi ghost/outline
// (UI Template Spec §5) supaya selalu jadi elemen paling menonjol.
export function WhatsAppButton({
  nomor,
  pesan = "Halo, saya ingin bertanya tentang layanan Klinik Cahaya Medika.",
  className = "",
  size = "default",
  label = "Chat via WhatsApp",
}: WhatsAppButtonProps) {
  const sizeClass = size === "compact" ? "px-5 py-2.5 text-sm" : "px-6 py-3 text-base";

  return (
    <a
      href={buildWhatsAppLink(nomor, pesan)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cta-whatsapp font-medium text-white transition hover:brightness-95 active:scale-[0.98] ${sizeClass} ${className}`}
    >
      {label}
    </a>
  );
}
