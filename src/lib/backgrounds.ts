export type Background = {
  id: string;
  name: string;
  /** Konva linear-gradient stops: [offset, color, offset, color, ...] */
  stops: (number | string)[];
  /** Decorative frame colour */
  frame: string;
  /** Text colour that reads well on this background */
  text: string;
};

function bg(id: string, name: string, from: string, to: string, frame: string, text: string): Background {
  return { id, name, stops: [0, from, 1, to], frame, text };
}

export const BACKGROUNDS: Background[] = [
  bg("navy-gold", "Navy Oltin", "#0f1b33", "#1e3a63", "#d4af37", "#f7e7bd"),
  bg("midnight", "Yarim tun", "#020617", "#1e293b", "#c9a227", "#f3e8c8"),
  bg("royal", "Qirollik", "#1a1a4b", "#3b2e73", "#e2c275", "#fdf3d7"),
  bg("emerald", "Zumrad", "#04231c", "#0f5132", "#d8b45a", "#f4ecd2"),
  bg("burgundy", "Burgundiya", "#2b0713", "#611228", "#e5c07b", "#fbecd6"),
  bg("ivory", "Fil suyagi", "#fdfaf3", "#efe4cf", "#b08b3e", "#3a2c12"),
  bg("pearl", "Marvarid", "#ffffff", "#e6ecf5", "#8a7130", "#1d2a44"),
  bg("rose", "Pushti nafis", "#fff1f2", "#f6d9dd", "#a9793c", "#4a2430"),
  bg("sky", "Osmon", "#eaf3ff", "#c6dcf7", "#8c6f2e", "#14243e"),
  bg("sunset", "Shafaq", "#2b1055", "#7597de", "#ffd77a", "#fff6df"),
  bg("forest", "O'rmon", "#0b2211", "#2f5d3a", "#d9c17a", "#f3f0dd"),
  bg("copper", "Mis", "#2a1608", "#7a4318", "#f0c987", "#fdefdc"),
  bg("ocean", "Okean", "#012a4a", "#2a6f97", "#ffd28f", "#f2fbff"),
  bg("plum", "Olxo'ri", "#25022f", "#5b2172", "#e8c36b", "#fbeedd"),
  bg("graphite", "Grafit", "#1c1c1e", "#3a3a3d", "#d4af37", "#f5f0e4"),
  bg("sand", "Qum", "#f6efe2", "#e2cfae", "#8a6a24", "#3b2f18"),
  bg("mint", "Yalpiz", "#eafaf3", "#c2ead8", "#7d6524", "#17362a"),
  bg("lavender", "Lavanda", "#f4f0ff", "#d9cdf7", "#7f6524", "#2a2144"),
  bg("teal", "Firuza", "#012f2f", "#0b6b6b", "#ecd28a", "#f0fbfa"),
  bg("wine", "Sharob", "#3a0d1f", "#7b1e3b", "#f0d18b", "#fdeede"),
  bg("steel", "Po'lat", "#17212b", "#41566b", "#cbb26a", "#eef3f8"),
  bg("amber", "Kahrabo", "#3a2405", "#8a5a12", "#ffd98a", "#fff3dd"),
  bg("indigo", "Indigo", "#141a3f", "#333f7d", "#dcc07c", "#f4f1ff"),
  bg("charcoal", "Ko'mir", "#0d0d0d", "#2b2b2b", "#e0bb61", "#faf4e6"),
  bg("olive", "Zaytun", "#22240f", "#4f5a1f", "#e3cc82", "#f6f3e2"),
  bg("blush", "Nozik", "#fff7f4", "#f2ded3", "#9c7430", "#42302a"),
  bg("azure", "Moviy", "#052a5e", "#1863b0", "#ffd98a", "#f2f8ff"),
  bg("velvet", "Baxmal", "#170023", "#411a5e", "#f2cf80", "#fcf1e2"),
  bg("marble", "Marmar", "#f7f7f7", "#dcdfe4", "#8e7327", "#22262e"),
  bg("aurora", "Shafaq nuri", "#06283d", "#256d85", "#f7d794", "#eafcff"),
];

export const DEFAULT_BACKGROUND = BACKGROUNDS[0]!;

export function backgroundCss(b: Background) {
  return `linear-gradient(135deg, ${b.stops[1]} 0%, ${b.stops[3]} 100%)`;
}
