import { create } from "zustand";
import { BACKGROUNDS, DEFAULT_BACKGROUND } from "./backgrounds";

export const CANVAS_W = 1000;
export const CANVAS_H = 707;

export type Photo = {
  id: string;
  src: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMain: boolean;
};

export type Page = {
  id: string;
  backgroundId: string;
  customBackground: string | null;
  title: string;
  subtitle: string;
  photos: Photo[];
};

type State = {
  projectName: string;
  pages: Page[];
  activePage: number;
  selectedId: string | null;
  hydrated: boolean;
};

type Actions = {
  setProjectName: (v: string) => void;
  addPage: () => void;
  removePage: (index: number) => void;
  setActivePage: (i: number) => void;
  setPageField: (field: "title" | "subtitle", value: string) => void;
  setBackground: (id: string) => void;
  setCustomBackground: (dataUrl: string) => void;
  addPhotos: (items: { src: string; name: string }[]) => number;
  removePhoto: (id: string) => void;
  renamePhoto: (id: string, name: string) => void;
  setMain: (id: string) => void;
  updatePhoto: (id: string, patch: Partial<Photo>) => void;
  select: (id: string | null) => void;
  autoArrange: () => void;
  loadDraft: (state: Pick<State, "projectName" | "pages">) => void;
  markHydrated: () => void;
  totalPhotos: () => number;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const MAX_PHOTOS = 50;

export function emptyPage(): Page {
  return {
    id: uid(),
    backgroundId: DEFAULT_BACKGROUND.id,
    customBackground: null,
    title: "2026-yil bitiruvchilari",
    subtitle: "11-A sinf",
    photos: [],
  };
}

const CARD_W = 150;
const CARD_H = 190;
const MAIN_W = 240;
const MAIN_H = 300;

function arrange(photos: Photo[]): Photo[] {
  const main = photos.find((p) => p.isMain) ?? null;
  const rest = photos.filter((p) => !p.isMain);
  const result: Photo[] = [];

  let topOffset = 150;
  if (main) {
    result.push({
      ...main,
      width: MAIN_W,
      height: MAIN_H,
      x: (CANVAS_W - MAIN_W) / 2,
      y: 120,
    });
    topOffset = 120 + MAIN_H + 40;
  }

  const available = CANVAS_H - topOffset - 40;
  const rows = Math.max(1, Math.floor(available / (CARD_H + 16)));
  const perRow = Math.max(1, Math.ceil(rest.length / rows));
  const cols = Math.min(perRow, Math.max(1, Math.floor((CANVAS_W - 60) / (CARD_W + 16))));
  const gapX = (CANVAS_W - cols * CARD_W) / (cols + 1);

  rest.forEach((p, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowCount = Math.min(cols, rest.length - row * cols);
    const rowGap = (CANVAS_W - rowCount * CARD_W) / (rowCount + 1);
    result.push({
      ...p,
      width: CARD_W,
      height: CARD_H,
      x: (rowCount === cols ? gapX : rowGap) * (col + 1) + col * CARD_W,
      y: topOffset + row * (CARD_H + 20),
    });
  });

  return result;
}

export const useVinetka = create<State & Actions>((set, get) => ({
  projectName: "Mening vinetkam",
  pages: [emptyPage()],
  activePage: 0,
  selectedId: null,
  hydrated: false,

  setProjectName: (v) => set({ projectName: v }),
  markHydrated: () => set({ hydrated: true }),
  loadDraft: (draft) => set({ ...draft, activePage: 0, hydrated: true }),

  addPage: () => set((s) => ({ pages: [...s.pages, emptyPage()], activePage: s.pages.length })),
  removePage: (index) =>
    set((s) => {
      if (s.pages.length === 1) return s;
      const pages = s.pages.filter((_, i) => i !== index);
      return { pages, activePage: Math.max(0, Math.min(s.activePage, pages.length - 1)) };
    }),
  setActivePage: (i) => set({ activePage: i, selectedId: null }),

  setPageField: (field, value) =>
    set((s) => ({
      pages: s.pages.map((p, i) => (i === s.activePage ? { ...p, [field]: value } : p)),
    })),

  setBackground: (id) =>
    set((s) => ({
      pages: s.pages.map((p, i) =>
        i === s.activePage ? { ...p, backgroundId: id, customBackground: null } : p,
      ),
    })),

  setCustomBackground: (dataUrl) =>
    set((s) => ({
      pages: s.pages.map((p, i) => (i === s.activePage ? { ...p, customBackground: dataUrl } : p)),
    })),

  addPhotos: (items) => {
    const state = get();
    const used = state.pages.reduce((n, p) => n + p.photos.length, 0);
    const room = Math.max(0, MAX_PHOTOS - used);
    const accepted = items.slice(0, room);
    if (accepted.length === 0) return 0;

    set((s) => ({
      pages: s.pages.map((p, i) => {
        if (i !== s.activePage) return p;
        const added: Photo[] = accepted.map((item, idx) => ({
          id: uid(),
          src: item.src,
          name: item.name,
          x: 60 + ((p.photos.length + idx) % 5) * (CARD_W + 20),
          y: 160 + Math.floor((p.photos.length + idx) / 5) * (CARD_H + 20),
          width: CARD_W,
          height: CARD_H,
          isMain: false,
        }));
        return { ...p, photos: arrange([...p.photos, ...added]) };
      }),
    }));
    return accepted.length;
  },

  removePhoto: (id) =>
    set((s) => ({
      selectedId: s.selectedId === id ? null : s.selectedId,
      pages: s.pages.map((p, i) =>
        i === s.activePage ? { ...p, photos: p.photos.filter((ph) => ph.id !== id) } : p,
      ),
    })),

  renamePhoto: (id, name) =>
    set((s) => ({
      pages: s.pages.map((p, i) =>
        i === s.activePage
          ? { ...p, photos: p.photos.map((ph) => (ph.id === id ? { ...ph, name } : ph)) }
          : p,
      ),
    })),

  setMain: (id) =>
    set((s) => ({
      pages: s.pages.map((p, i) => {
        if (i !== s.activePage) return p;
        const photos = p.photos.map((ph) =>
          ph.id === id
            ? { ...ph, isMain: !ph.isMain, width: ph.isMain ? CARD_W : MAIN_W, height: ph.isMain ? CARD_H : MAIN_H }
            : { ...ph, isMain: false, width: ph.isMain ? CARD_W : ph.width, height: ph.isMain ? CARD_H : ph.height },
        );
        return { ...p, photos: arrange(photos) };
      }),
    })),

  updatePhoto: (id, patch) =>
    set((s) => ({
      pages: s.pages.map((p, i) =>
        i === s.activePage
          ? { ...p, photos: p.photos.map((ph) => (ph.id === id ? { ...ph, ...patch } : ph)) }
          : p,
      ),
    })),

  select: (id) => set({ selectedId: id }),

  autoArrange: () =>
    set((s) => ({
      pages: s.pages.map((p, i) => (i === s.activePage ? { ...p, photos: arrange(p.photos) } : p)),
    })),

  totalPhotos: () => get().pages.reduce((n, p) => n + p.photos.length, 0),
}));

export function backgroundOf(page: Page) {
  return BACKGROUNDS.find((b) => b.id === page.backgroundId) ?? DEFAULT_BACKGROUND;
}

export const DRAFT_KEY = "vinetka-draft-v1";
