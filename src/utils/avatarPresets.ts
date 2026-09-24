export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
}

// Crisp, beautifully styled SVG avatar Data URIs with Islamic & game motifs
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'mosque_gold',
    name: 'مزگەوت (زێڕین)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f766e"/><stop offset="100%" stop-color="%23042f2e"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><path d="M50 18 C46 26 40 32 40 40 L60 40 C60 32 54 26 50 18 Z" fill="url(%23gold)"/><rect x="38" y="40" width="24" height="38" rx="2" fill="url(%23gold)"/><path d="M44 78 L44 54 C44 50 56 50 56 54 L56 78 Z" fill="%23042f2e"/><rect x="22" y="34" width="8" height="44" rx="2" fill="url(%23gold)"/><path d="M22 34 L26 22 L30 34 Z" fill="url(%23gold)"/><circle cx="26" cy="18" r="2" fill="%23fde047"/><rect x="70" y="34" width="8" height="44" rx="2" fill="url(%23gold)"/><path d="M70 34 L74 22 L78 34 Z" fill="url(%23gold)"/><circle cx="74" cy="18" r="2" fill="%23fde047"/><circle cx="50" cy="14" r="2.5" fill="%23fde047"/></svg>'
  },
  {
    id: 'crescent_star',
    name: 'مانگ و ئەستێرە',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="amber" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fbbf24"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><path d="M54 22 C37 22 24 35 24 52 C24 69 37 82 54 82 C63 82 71 78 77 71 C64 74 50 64 50 50 C50 36 64 26 77 29 C71 24 63 22 54 22 Z" fill="url(%23amber)"/><polygon points="72,36 74,43 81,43 75,47 77,54 72,50 67,54 69,47 63,43 70,43" fill="%23fef08a"/></svg>'
  },
  {
    id: 'trophy_gold',
    name: 'جامی زێڕین',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2378350f"/><stop offset="100%" stop-color="%23451a03"/></linearGradient><linearGradient id="cup" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="50%" stop-color="%23eab308"/><stop offset="100%" stop-color="%23ca8a04"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><path d="M32 24 L68 24 L68 44 C68 56 59 64 50 64 C41 64 32 56 32 44 Z" fill="url(%23cup)"/><path d="M32 30 L22 30 C18 30 18 42 26 44 L32 44" stroke="%23fef08a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M68 30 L78 30 C82 30 82 42 74 44 L68 44" stroke="%23fef08a" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="46" y="64" width="8" height="14" fill="url(%23cup)"/><rect x="36" y="78" width="28" height="8" rx="2" fill="url(%23cup)"/><polygon points="50,34 52,39 57,39 53,42 54,47 50,44 46,47 47,42 43,39 48,39" fill="%23ffffff"/></svg>'
  },
  {
    id: 'kaaba_sanctuary',
    name: 'کەعبەی پیرۆز',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2318181b"/><stop offset="100%" stop-color="%2309090b"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="100%" stop-color="%23eab308"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><rect x="25" y="28" width="50" height="50" rx="4" fill="%2327272a" stroke="%2352525b" stroke-width="2"/><rect x="25" y="38" width="50" height="7" fill="url(%23gold)"/><rect x="54" y="52" width="14" height="26" rx="1" fill="url(%23gold)"/></svg>'
  },
  {
    id: 'lantern_light',
    name: 'فانۆسی ڕووناکی',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230c4a6e"/><stop offset="100%" stop-color="%23082f49"/></linearGradient><linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23b45309"/></linearGradient><linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="100%" stop-color="%23f97316"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><circle cx="50" cy="18" r="6" stroke="url(%23metal)" stroke-width="3" fill="none"/><path d="M38 32 L62 32 L56 24 L44 24 Z" fill="url(%23metal)"/><path d="M36 32 L64 32 L60 66 L40 66 Z" fill="url(%23glow)"/><rect x="42" y="66" width="16" height="14" fill="url(%23metal)"/><line x1="50" y1="32" x2="50" y2="66" stroke="%23b45309" stroke-width="2"/><circle cx="50" cy="48" r="7" fill="%23ffffff" opacity="0.8"/></svg>'
  },
  {
    id: 'gem_diamond',
    name: 'ئەڵماسی شین',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230284c7"/><stop offset="100%" stop-color="%230369a1"/></linearGradient><linearGradient id="gem" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23e0f2fe"/><stop offset="50%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%230284c7"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><polygon points="32,32 68,32 82,48 50,78 18,48" fill="url(%23gem)"/><polygon points="32,32 68,32 60,48 40,48" fill="%23f0f9ff"/><polygon points="40,48 60,48 50,78" fill="%230284c7"/><polygon points="18,48 40,48 50,78" fill="%230ea5e9"/><polygon points="82,48 60,48 50,78" fill="%230369a1"/></svg>'
  },
  {
    id: 'shield_defender',
    name: 'مەگەر و قەڵغان',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23881337"/><stop offset="100%" stop-color="%234c0519"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><path d="M50 20 L74 28 C74 54 62 70 50 78 C38 70 26 54 26 28 Z" fill="url(%23gold)"/><path d="M50 25 L70 32 C70 52 59 66 50 73 C41 66 30 52 30 32 Z" fill="%239f1239"/><polygon points="50,34 53,42 61,42 55,47 57,55 50,50 43,55 45,47 39,42 47,42" fill="url(%23gold)"/></svg>'
  },
  {
    id: 'falcon_champion',
    name: 'باز و شاهین',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233f2c22"/><stop offset="100%" stop-color="%231c120c"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23ca8a04"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><path d="M30 42 C36 28 54 24 64 32 C70 36 78 40 76 50 C74 58 64 64 58 64 L52 76 L48 76 L48 64 C38 62 30 54 30 42 Z" fill="url(%23gold)"/><circle cx="60" cy="38" r="3" fill="%231c120c"/><path d="M72 44 L80 48 L72 50 Z" fill="%23eab308"/></svg>'
  },
  {
    id: 'book_quran',
    name: 'کتێبی زانیاری',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23134e4a"/><stop offset="100%" stop-color="%23042f2e"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><path d="M50 68 C40 62 26 62 20 64 L20 32 C26 30 40 30 50 36 C60 30 74 30 80 32 L80 64 C74 62 60 62 50 68 Z" fill="%23fef3c7" stroke="url(%23gold)" stroke-width="3"/><line x1="50" y1="36" x2="50" y2="68" stroke="%23b45309" stroke-width="2"/><polygon points="50,46 51.5,50 55.5,50 52.5,52.5 53.5,56.5 50,54 46.5,56.5 47.5,52.5 44.5,50 48.5,50" fill="url(%23gold)"/></svg>'
  },
  {
    id: 'crown_royal',
    name: 'تاجی سەردار',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23581c87"/><stop offset="100%" stop-color="%232e1065"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23eab308"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23bg)"/><polygon points="20,68 80,68 76,38 60,52 50,30 40,52 24,38" fill="url(%23gold)"/><circle cx="50" cy="27" r="4" fill="%2338bdf8"/><circle cx="24" cy="35" r="3" fill="%23f43f5e"/><circle cx="76" cy="35" r="3" fill="%23f43f5e"/><rect x="22" y="68" width="56" height="6" rx="2" fill="%23ca8a04"/></svg>'
  }
];
