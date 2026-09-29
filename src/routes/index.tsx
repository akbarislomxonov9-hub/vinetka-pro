import { useEffect, useState } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { BackgroundsPanel } from "@/components/vinetka/BackgroundsPanel";
import { CanvasArea } from "@/components/vinetka/CanvasArea";
import { ExportOverlay } from "@/components/vinetka/ExportOverlay";
import { OrderDialog } from "@/components/vinetka/OrderDialog";
import { PhotosPanel } from "@/components/vinetka/PhotosPanel";
import { TopBar } from "@/components/vinetka/TopBar";
import { exportPdf, exportPng } from "@/lib/export-vinetka";
import { CANVAS_H, CANVAS_W, DRAFT_KEY, useVinetka } from "@/lib/vinetka-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vinetka Editor — sinf vinetkasi yaratish" },
      {
        name: "description",
        content:
          "Sinf vinetkangizni onlayn yarating: 50 tagacha rasm, bosh o'quvchi sloti, 30 ta tayyor fon, PDF va PNG eksport.",
      },
      { property: "og:title", content: "Vinetka Editor — sinf vinetkasi yaratish" },
      {
        property: "og:description",
        content: "Ro'yxatdan o'tmasdan premium vinetka tayyorlang va bir bosishda buyurtma bering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

function EditorSkeleton() {
  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">
      <div className="shimmer h-14 rounded-xl bg-secondary/60" />
      <div className="flex flex-1 gap-4">
        <div className="shimmer hidden w-72 rounded-xl bg-secondary/60 lg:block" />
        <div className="shimmer flex-1 rounded-xl bg-secondary/60" style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }} />
        <div className="shimmer hidden w-72 rounded-xl bg-secondary/60 lg:block" />
      </div>
    </div>
  );
}

function EditorPage() {
  return (
    <ClientOnly fallback={<EditorSkeleton />}>
      <Editor />
    </ClientOnly>
  );
}

function Editor() {
  const { projectName, pages, activePage, loadDraft } = useVinetka();
  const [exporting, setExporting] = useState(false);
  const [percent, setPercent] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.pages?.length) loadDraft({ projectName: draft.projectName, pages: draft.pages });
      }
    } catch {
      /* ignore corrupted draft */
    }
  }, [loadDraft]);

  function save(silent = false) {
    try {
      const { projectName: name, pages: p } = useVinetka.getState();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ projectName: name, pages: p }));
      if (!silent) toast.success("Saqlandi");
    } catch {
      if (!silent) toast.error("Xotira to'ldi — rasmlar juda katta");
    }
  }

  useEffect(() => {
    const id = window.setInterval(() => save(true), 10000);
    return () => window.clearInterval(id);
  }, []);

  async function handlePdf() {
    setPercent(4);
    setExporting(true);
    try {
      await exportPdf(pages, projectName, setPercent);
      toast.success("PDF tayyor");
    } catch {
      toast.error("PDF yaratilmadi");
    } finally {
      setTimeout(() => setExporting(false), 400);
    }
  }

  function handlePng() {
    try {
      exportPng(pages[activePage]!, `${projectName}-bet-${activePage + 1}`);
      toast.success("PNG yuklab olindi");
    } catch {
      toast.error("PNG yaratilmadi");
    }
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--gradient-navy)" }}>
      <TopBar
        onSave={() => save()}
        onExportPng={handlePng}
        onExportPdf={() => void handlePdf()}
        onOrder={() => setOrderOpen(true)}
      />
      <div className="flex flex-1 flex-col lg:flex-row">
        <PhotosPanel />
        <CanvasArea />
        <BackgroundsPanel />
      </div>
      <ExportOverlay open={exporting} percent={percent} />
      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} />
    </div>
  );
}
