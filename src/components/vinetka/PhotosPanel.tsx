import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAX_PHOTOS, useVinetka } from "@/lib/vinetka-store";

export function readFiles(files: File[]): Promise<{ src: string; name: string }[]> {
  return Promise.all(
    files
      .filter((f) => f.type.startsWith("image/"))
      .map(
        (file) =>
          new Promise<{ src: string; name: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ src: String(reader.result), name: file.name.replace(/\.[^.]+$/, "") });
            reader.readAsDataURL(file);
          }),
      ),
  );
}

export function PhotosPanel() {
  const { pages, activePage, addPhotos, removePhoto, renamePhoto, setMain, select, selectedId } =
    useVinetka();
  const page = pages[activePage]!;
  const total = pages.reduce((n, p) => n + p.photos.length, 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    setLoading(true);
    const items = await readFiles(files);
    const added = addPhotos(items);
    setLoading(false);
    if (added === 0) toast.error(`Maksimal ${MAX_PHOTOS} ta rasm`);
    else toast.success(`Rasm qo'shildi (${added} ta)`);
  }

  return (
    <aside className="flex h-full w-full flex-col gap-3 border-r border-border/70 bg-card/60 p-3 lg:w-72">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Rasmlar</h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          {total}/{MAX_PHOTOS}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
          dragging
            ? "scale-[1.02] border-primary bg-primary/10"
            : "border-border hover:border-primary/60 hover:bg-secondary/40"
        }`}
      >
        <ImagePlus className="mx-auto mb-2 size-6 text-primary" />
        <p className="text-sm font-medium">Rasmlarni shu yerga tashlang</p>
        <p className="text-xs text-muted-foreground">yoki tanlash uchun bosing</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void handleFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      <Button variant="secondary" className="gap-2" onClick={() => inputRef.current?.click()}>
        <Upload className="size-4" /> Rasm yuklash
      </Button>

      <ScrollArea className="-mr-2 flex-1 pr-2">
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shimmer h-16 rounded-xl bg-secondary/60" />
              ))
            : null}
          <AnimatePresence initial={false}>
            {page.photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => select(photo.id)}
                className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                  selectedId === photo.id ? "border-primary bg-primary/10" : "border-border/70 bg-secondary/40"
                }`}
              >
                <img src={photo.src} alt={photo.name} className="size-12 rounded-lg object-cover" />
                <Input
                  value={photo.name}
                  placeholder="Ism familiya"
                  onChange={(e) => renamePhoto(photo.id, e.target.value)}
                  className="h-8 flex-1 border-transparent bg-transparent px-1 text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  title="Bosh o'quvchi"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMain(photo.id);
                  }}
                  className={photo.isMain ? "text-primary" : "text-muted-foreground"}
                >
                  <Crown className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {page.photos.length === 0 && !loading ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              Bu betda hali rasm yo'q. Tojcha belgisi bilan «Bosh o'quvchi»ni tanlang.
            </p>
          ) : null}
        </div>
      </ScrollArea>
    </aside>
  );
}
