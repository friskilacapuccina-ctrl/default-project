export type Vec3 = [number, number, number];

/**
 * Satu identitas bagian biologis (organel / organ / jaringan / organisme).
 * Sumber data tunggal: nama, nomor, penjelasan, dan jangkar marker
 * dibaca dari sini oleh daftar bagian, marker, highlight, dan panel detail.
 */
export type BioStructure = {
  /** ID stabil — sama dengan prop `id` pada seluruh mesh 3D milik bagian ini. */
  id: string;
  /** Nomor identifikasi tunggal (urut, unik dalam satu model). */
  number: number;
  /** Nama utama (Bahasa Indonesia, sesuai kurikulum SMA). */
  name: string;
  /** Istilah ilmiah / Latin bila membantu pemahaman. */
  scientificName?: string;
  /** Deskripsi singkat untuk panel detail. */
  shortDescription: string;
  /** Fungsi utama bagian tersebut. */
  mainFunction: string;
  /** Informasi biologis tambahan (opsional). */
  biologicalNotes?: string;
  /** Warna identitas bagian (dipakai dot daftar & highlight). */
  color: string;
  /** Jangkar marker bernomor dalam koordinat dunia model 3D. */
  marker: Vec3;
};

export type CameraConfig = {
  position: Vec3;
  target?: Vec3;
  fov?: number;
};

/** Props standar untuk semua scene 3D. */
export type SceneProps = {
  selected: string | null;
  onSelect: (id: string) => void;
  /** Kontrol play/pause animasi aliran (jalur makanan, aliran darah, irama napas). */
  flowPlaying?: boolean;
};

export type BioVariant = {
  title: string;
  intro: string;
  structures: BioStructure[];
  camera?: CameraConfig;
  /** Penanda bahwa visualisasi bersifat skematis/ilustratif. */
  schematicNote?: string;
  /**
   * Sub-model di dalam varian (mis. jenis jaringan pada tab Jaringan Hewan).
   * Struktur, kamera, dan judul dibaca dari sub-model aktif bila ada.
   */
  subvariants?: Record<string, BioVariant>;
  /** Urutan tampil sub-model. */
  subOrder?: string[];
  /** Label tombol tab per sub-model. */
  subLabels?: Record<string, string>;
  /**
   * Pengelompokan tab sub-model (mis. Epitel / Otot / Saraf / Ikat)
   * agar tab banyak tetap terbaca. Bila tidak ada, tampil rata tanpa grup.
   */
  subGroups?: { label: string; keys: string[] }[];
};

export type BioModel = {
  slug: string;
  title: string;
  intro: string;
  hint: string;
  structures?: BioStructure[];
  camera?: CameraConfig;
  schematicNote?: string;
  /** Catatan legenda (mis. arti warna merah/biru). */
  legendNote?: string;
  /** Varian model (mis. sel hewan vs sel tumbuhan, jaringan tumbuhan vs hewan). */
  variants?: Record<string, BioVariant>;
  /** Urutan tampil varian. */
  variantOrder?: string[];
  /** Label tombol tab per varian. */
  variantLabels?: Record<string, string>;
  /** Model memiliki animasi aliran (butuh tombol play/pause). */
  hasFlow?: boolean;
  flowLabel?: string;
};
