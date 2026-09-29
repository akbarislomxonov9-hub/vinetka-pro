import { useRef } from "react";
import { motion } from "framer-motion";
import { Grid3X3, Image as ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BACKGROUNDS, backgroundCss } from "@/lib/backgrounds";
import { useVinetka } from "@/lib/vinetka-store";
import { readFiles } from "./PhotosPanel";

export function BackgroundsPanel() {
  const { pages, activePage, setBackground, setCustomBackground, setPageField, autoArrange } =
    useVinetka();
  const page = pages[activePage]!;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="flex h-full w-full flex-col gap-3 border-l border-border/70 bg-card/60 p-3 lg:w-72">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Dizayn</h2>

      <div className="space-y-2 rounded-xl border border-border/70 bg-secondary/40 p-3">
        <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Type className="size-3.5" /> Sarlavha
        </Label>
        <Input value={page.title} onChange={(e) => setPageField("title", e.target.value)} className="h-8" />
        <Input
          value={page.subtitle}
          onChange={(e) => setPageField("subtitle", e.target.value)}
          className="h-8"
        />
      </div>

      <Button variant="secondary" className="gap-2" onClick={autoArrange}>
        <Grid3X3 className="size-4" /> Avtomatik joylash
      </Button>

      <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
        <ImageIcon className="size-4" /> O'z fonini yuklash
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          const [item] = await readFiles(files);
          if (item) {
            setCustomBackground(item.src);
            toast.success("Fon o'zgartirildi");
          }
        }}
      />

      <ScrollArea className="-mr-2 flex-1 pr-2">
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUNDS.map((b) => (
            <motion.button
              key={b.id}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setBackground(b.id);
                toast.success("Fon o'zgartirildi");
              }}
              title={b.name}
              className={`aspect-[4/3] rounded-lg border-2 transition-colors ${
                page.backgroundId === b.id && !page.customBackground
                  ? "border-primary"
                  : "border-border/60"
              }`}
              style={{ background: backgroundCss(b) }}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
