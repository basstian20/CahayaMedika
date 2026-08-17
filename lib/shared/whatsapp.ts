// Link statis wa.me — bukan integrasi backend (Backend Blueprint §8).
export function buildWhatsAppLink(nomor: string, pesan: string): string {
  const digitsOnly = nomor.replace(/[^0-9]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(pesan)}`;
}
