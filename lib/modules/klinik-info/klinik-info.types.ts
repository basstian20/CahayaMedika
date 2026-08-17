export interface KlinikInfo {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  koordinat_lat: number;
  koordinat_lng: number;
  tahun_berdiri: number;
  jam_operasional_default: { jam_mulai: string; jam_selesai: string };
}

export interface LayananPublik {
  id: string;
  nama: string;
  deskripsi: string;
  urutan: number;
}

export interface DokterPublik {
  id: string;
  nama: string;
  spesialisasi: string;
  foto_url: string | null;
  urutan: number;
}

export interface JadwalPublik {
  id: string;
  dokter_id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
}
