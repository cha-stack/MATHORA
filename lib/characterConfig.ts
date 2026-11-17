export interface CharacterConfig {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyeStyle: string;
  eyeColor: string;
  eyebrowStyle: string;
  noseStyle: string;
  mouthStyle: string;
  blushStyle: string;
  blushColor: string;
  earStyle: string;
  outfitStyle: string;
  outfitColor: string;
  accessoryStyle: string;
  accessoryColor: string;
  bgColor: string;
}

export const DEFAULT_CHARACTER: CharacterConfig = {
  skinColor: "#FBE3D5",
  hairStyle: "cute",
  hairColor: "#4A2E1B",
  eyeStyle: "Normal Girl",
  eyeColor: "#10B981",
  eyebrowStyle: "gaya1",
  noseStyle: "gaya1",
  mouthStyle: "kucing",
  blushStyle: "gaya1",
  blushColor: "#FDA4AF",
  earStyle: "elf",
  outfitStyle: "vest",
  outfitColor: "#3B82F6",
  accessoryStyle: "hair_bow",
  accessoryColor: "#F43F5E",
  bgColor: "transparent",
};

// Palet Warna
export const COLOR_PALETTES = {
  skin: [
    { label: "Kuning Langsat", hex: "#FBE3D5" },
    { label: "Putih Lembut", hex: "#FFF2EB" },
    { label: "Sawo Matang", hex: "#E8B997" },
    { label: "Cokelat Manis", hex: "#C68B59" },
    { label: "Gelap Eksotis", hex: "#8D5524" },
    { label: "Fantasi Putih", hex: "#F0E6FF" },
  ],
  hair: [
    { label: "Cokelat Tua", hex: "#4A2E1B" },
    { label: "Hitam Alami", hex: "#221C18" },
    { label: "Karamel", hex: "#8B5A2B" },
    { label: "Pirang Emas", hex: "#E5B869" },
    { label: "Merah Maroon", hex: "#8B1E1E" },
    { label: "Biru Navy", hex: "#1E3A8A" },
    { label: "Biru Cerah", hex: "#38BDF8" },
    { label: "Ungu Lilac", hex: "#8B5CF6" },
    { label: "Hijau Zamrud", hex: "#15803D" },
    { label: "Pink Sakura", hex: "#F472B6" },
    { label: "Silver Putih", hex: "#E2E8F0" },
  ],
  eye: [
    { label: "Hijau Zamrud", hex: "#10B981" },
    { label: "Cokelat Hangat", hex: "#5A3825" },
    { label: "Biru Samudra", hex: "#2563EB" },
    { label: "Ungu Mistik", hex: "#9333EA" },
    { label: "Merah Delima", hex: "#DC2626" },
    { label: "Kuning Emas", hex: "#F59E0B" },
    { label: "Abu Netral", hex: "#64748B" },
    { label: "Hitam Pekat", hex: "#18181B" },
  ],
  blush: [
    { label: "Pink Merona", hex: "#FDA4AF" },
    { label: "Merah Delima", hex: "#F87171" },
    { label: "Peach Manis", hex: "#FB923C" },
    { label: "Coral Cerah", hex: "#FB7185" },
    { label: "Ungu Anggun", hex: "#E879F9" },
  ],
  outfit: [
    { label: "Biru Mathora", hex: "#3B82F6" },
    { label: "Navy Sekolah", hex: "#1E3A8A" },
    { label: "Merah Marun", hex: "#991B1B" },
    { label: "Hijau Daun", hex: "#166534" },
    { label: "Kuning Mustard", hex: "#D97706" },
    { label: "Hitam Elegan", hex: "#1F2937" },
    { label: "Putih Bersih", hex: "#F8FAFC" },
    { label: "Ungu Edukasi", hex: "#7C3AED" },
  ],
  accessory: [
    { label: "Merah Pita", hex: "#F43F5E" },
    { label: "Biru Ceria", hex: "#3B82F6" },
    { label: "Kuning Emas", hex: "#EAB308" },
    { label: "Putih Murni", hex: "#FFFFFF" },
    { label: "Hitam Klasik", hex: "#18181B" },
    { label: "Ungu Manis", hex: "#A855F7" },
  ],
  bg: [
    { label: "Transparan", hex: "transparent" },
    { label: "Ungu Mathora", hex: "#e5dbf5" },
    { label: "Biru Langit", hex: "#e0f2fe" },
    { label: "Hijau Mint", hex: "#dcfce7" },
    { label: "Kuning Hangat", hex: "#fef9c3" },
    { label: "Peach Lembut", hex: "#ffedd5" },
    { label: "Pink Pastel", hex: "#ffe4e6" },
  ],
};

// Opsi Pilihan per Kategori
export const HAIR_OPTIONS = [
  { id: "cute", label: "Cute / Bob", preview: "/characters/Hair/cute.png", line: "/characters/Hair/cute/line.png", fill: "/characters/Hair/cute/fill.png" },
  { id: "1", label: "Gaya 1 (Poni)", preview: "/characters/Hair/1.png", line: "/characters/Hair/1/Layer 10_id57.png", fill: "/characters/Hair/1/Layer 9_id56.png" },
  { id: "long hair", label: "Rambut Panjang", preview: "/characters/Hair/long hair.png", line: "/characters/Hair/long hair/Layer 16_id103.png", fill: "/characters/Hair/long hair/Layer 15_id99.png" },
  { id: "male", label: "Cowok Pendek", preview: "/characters/Hair/male.png", line: "/characters/Hair/male/line.png", fill: "/characters/Hair/male/fill.png" },
  { id: "male2", label: "Cowok Rapi", preview: "/characters/Hair/male2.png", line: "/characters/Hair/male2/line.png", fill: "/characters/Hair/male2/fill.png" },
  { id: "male3", label: "Cowok Belah", preview: "/characters/Hair/male3.png", line: "/characters/Hair/male3/line.png", fill: "/characters/Hair/male3/fill.png" },
  { id: "reze", label: "Kuncir Cepol", preview: "/characters/Hair/reze.png", line: "/characters/Hair/reze/Layer 20_id198.png", fill: "/characters/Hair/reze/Layer 19_id194.png" },
  { id: "shortHair", label: "Pendek Ceria", preview: "/characters/Hair/shortHair.png", line: "/characters/Hair/shortHair/Layer 14_id77.png", fill: "/characters/Hair/shortHair/Layer 13_id73.png" },
  { id: "shorthair2", label: "Pendek Berantakan", preview: "/characters/Hair/shorthair2.png", line: "/characters/Hair/shorthair2/line.png", fill: "/characters/Hair/shorthair2/fill.png" },
  { id: "xinqiu", label: "Bob Belah Samping", preview: "/characters/Hair/xinqiu.png", line: "/characters/Hair/xinqiu/line.png", fill: "/characters/Hair/xinqiu/fill.png" },
];

export const EYE_OPTIONS = [
  {
    id: "Normal Girl",
    label: "Cewek Ramah",
    preview: "/characters/Eye/Normal Girl.png",
    sclera: "/characters/Eye/Normal Girl/Layer 4 Copy_id82.png",
    iris: "/characters/Eye/Normal Girl/Layer 5 Copy_id81.png",
    line: "/characters/Eye/Normal Girl/Layer 3 Copy_id80.png",
  },
  {
    id: "NormalMale",
    label: "Cowok Tegas",
    preview: "/characters/Eye/NormalMale.png",
    sclera: "/characters/Eye/NormalMale/Layer 4_id34.png",
    iris: "/characters/Eye/NormalMale/Layer 5_id44.png",
    line: "/characters/Eye/NormalMale/Layer 3_id28.png",
  },
  {
    id: "Goth",
    label: "Mata Tajam",
    preview: "/characters/Eye/Goth.png",
    sclera: "/characters/Eye/Goth/Layer 4 Copy 2_id97.png",
    iris: "/characters/Eye/Goth/Layer 5 Copy 2_id96.png",
    line: "/characters/Eye/Goth/Layer 15 Copy_id95.png",
  },
  {
    id: "reze",
    label: "Mata Sayu",
    preview: "/characters/Eye/reze.png",
    sclera: "/characters/Eye/reze/Layer 4 Copy 3_id192.png",
    iris: "/characters/Eye/reze/Layer 18_id191.png",
    line: "/characters/Eye/reze/Layer 17_id190.png",
  },
];

export const EAR_OPTIONS = [
  {
    id: "elf",
    label: "Telinga Peri (Elf)",
    preview: "/characters/Ears/elf.png",
    line: "/characters/Ears/elf/elf_id224.png",
    fill: "/characters/Ears/elf/Layer 23_id228.png",
  },
  {
    id: "normal",
    label: "Telinga Normal",
    preview: "/characters/Ears/normal.png",
    line: "/characters/Ears/normal/Layer 1_id18.png",
    fill: "/characters/Ears/normal/Layer 2_id229.png",
  },
];

export const EYEBROW_OPTIONS = [
  { id: "gaya1", label: "Alis Natural", line: "/characters/Eyebrow/1_id49.png" },
  { id: "gaya2", label: "Alis Lembut", line: "/characters/Eyebrow/2_id265.png" },
  { id: "gaya3", label: "Alis Tegas", line: "/characters/Eyebrow/3_id266.png" },
  { id: "gaya4", label: "Alis Ramping", line: "/characters/Eyebrow/4_id267.png" },
];

export const NOSE_OPTIONS = [
  { id: "gaya1", label: "Hidung Titik", line: "/characters/Nose/1_id51.png" },
  { id: "gaya2", label: "Hidung Garis", line: "/characters/Nose/2_id231.png" },
  { id: "gaya3", label: "Hidung Lancip", line: "/characters/Nose/3_id234.png" },
  { id: "gaya4", label: "Hidung Halus", line: "/characters/Nose/4_id235.png" },
];

export const MOUTH_OPTIONS = [
  { id: "kucing", label: "Mulut Kucing (:3)", line: "/characters/Mouth/4_id245.png" },
  { id: "senyum", label: "Senyum Manis", line: "/characters/Mouth/1_id54.png" },
  { id: "terbuka", label: "Buka Senang", line: "/characters/Mouth/2_id237.png" },
  { id: "datar", label: "Datar / Tenang", line: "/characters/Mouth/3_id241.png" },
  { id: "tawa", label: "Tertawa Lebar", line: "/characters/Mouth/5_id249.png" },
];

export const BLUSH_OPTIONS = [
  { id: "gaya1", label: "Gaya 1 (Merona)", line: "/characters/blush/1_id258.png" },
  { id: "gaya2", label: "Gaya 2 (Anime)", line: "/characters/blush/2_id263.png" },
  { id: "gaya3", label: "Gaya 3 (Bintik)", line: "/characters/blush/3_id264.png" },
  { id: "none", label: "Bersih / Polos", line: "" },
];

export const OUTFIT_OPTIONS = [
  {
    id: "vest",
    label: "Rompi Sekolah",
    preview: "/characters/Outfit/vest.png",
    line: "/characters/Outfit/vest/Layer 12 Copy_id216.png",
    collar: "/characters/Outfit/vest/color Copy_id217.png",
    vestFill: "/characters/Outfit/vest/vestcolor_id218.png",
  },
  {
    id: "shirt",
    label: "Kemeja Putih",
    preview: "/characters/Outfit/shirt.png",
    line: "/characters/Outfit/shirt/Layer 12_id67.png",
    fill: "/characters/Outfit/shirt/color_id69.png",
  },
  {
    id: "female",
    label: "Baju Santai",
    preview: "/characters/Outfit/Female.png",
    line: "/characters/Outfit/Female/Layer 21_id207.png",
    fill: "/characters/Outfit/Female/Layer 22_id208.png",
  },
];

export const ACCESSORY_OPTIONS = [
  { id: "hair_bow", label: "Pita Rambut", file: "/characters/Accessoris/hair_bow_id297.png" },
  { id: "cat_ear_headband", label: "Bando Kucing", file: "/characters/Accessoris/cat_ear_headband_id295.png" },
  { id: "glasses_round", label: "Kacamata Bulat", file: "/characters/Accessoris/glasses_round_id289.png" },
  { id: "glasses_square", label: "Kacamata Kotak", file: "/characters/Accessoris/glasses_square_id291.png" },
  { id: "sunglasses", label: "Kacamata Hitam", file: "/characters/Accessoris/sunglasses.png" },
  { id: "topi", label: "Topi Pelajar", file: "/characters/Accessoris/topi_id272.png" },
  { id: "hairclip_x", label: "Jepit Rambut X", file: "/characters/Accessoris/hairclip_x_id287.png" },
  { id: "angel_halo", label: "Halo Malaikat", file: "/characters/Accessoris/angel_halo.png" },
  { id: "bandaid", label: "Plester Pipi", file: "/characters/Accessoris/bandaid.png" },
  { id: "face_mask", label: "Masker Wajah", file: "/characters/Accessoris/face_mask.png" },
  { id: "earrings_star", label: "Anting Bintang", file: "/characters/Accessoris/earrings_star_id299.png" },
  { id: "earrings_hoop", label: "Anting Bulat", file: "/characters/Accessoris/earrings_hoop_id293.png" },
  { id: "miau", label: "Kumis Kucing", file: "/characters/Accessoris/miau_id273.png" },
  { id: "none", label: "Bersih / Polos", file: "" },
];

// Generator karakter acak (Randomizer)
export function getRandomCharacterConfig(): CharacterConfig {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    skinColor: pick(COLOR_PALETTES.skin).hex,
    hairStyle: pick(HAIR_OPTIONS).id,
    hairColor: pick(COLOR_PALETTES.hair).hex,
    eyeStyle: pick(EYE_OPTIONS).id,
    eyeColor: pick(COLOR_PALETTES.eye).hex,
    eyebrowStyle: pick(EYEBROW_OPTIONS).id,
    noseStyle: pick(NOSE_OPTIONS).id,
    mouthStyle: pick(MOUTH_OPTIONS).id,
    blushStyle: pick(BLUSH_OPTIONS).id,
    blushColor: pick(COLOR_PALETTES.blush).hex,
    earStyle: pick(EAR_OPTIONS).id,
    outfitStyle: pick(OUTFIT_OPTIONS).id,
    outfitColor: pick(COLOR_PALETTES.outfit).hex,
    accessoryStyle: pick(ACCESSORY_OPTIONS).id,
    accessoryColor: pick(COLOR_PALETTES.accessory).hex,
    bgColor: "transparent",
  };
}
