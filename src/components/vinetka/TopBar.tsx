import { motion } from "framer-motion";
import { Download, FileDown, Plus, Save, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVinetka } from "@/lib/vinetka-store";

export function TopBar({
  onSave,
  onExportPng,
  onExportPdf,
  onOrder,
}: {
  onSave: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onOrder: () => void;
}) {
  const { projectName, setProjectName, pages, activePage, setActivePage, addPage, removePage } =
    useVinetka();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/80 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 pr-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-9 w-48 border-transparent bg-secondary/60 font-semibold"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-secondary/60 p-1">
          {pages.map((p, i) => (
            <div key={p.id} className="relative">
              <button
                onClick={() => setActivePage(i)}
                className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  i === activePage ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {i === activePage ? (
                  <motion.span
                    layoutId="page-pill"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                ) : null}
                <span className="relative">Bet {i + 1}</span>
              </button>
              {pages.length > 1 && i === activePage ? (
                <button
                  onClick={() => removePage(i)}
                  aria-label="Betni o'chirish"
                  className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
                >
                  <X className="size-2.5" />
                </button>
              ) : null}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addPage} className="gap-1">
            <Plus className="size-4" /> Bet
          </Button>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onSave} className="gap-1.5">
            <Save className="size-4" /> Saqlash
          </Button>
          <Button variant="secondary" size="sm" onClick={onExportPng} className="gap-1.5">
            <Download className="size-4" /> PNG
          </Button>
          <Button variant="secondary" size="sm" onClick={onExportPdf} className="gap-1.5">
            <FileDown className="size-4" /> PDF
          </Button>
          <Button size="sm" onClick={onOrder} className="gap-1.5 font-semibold">
            Buyurtma berish
          </Button>
        </div>
      </div>
    </header>
  );
}

export { Trash2 };
