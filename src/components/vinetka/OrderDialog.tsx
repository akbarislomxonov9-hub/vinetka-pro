import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrder } from "@/lib/orders.functions";
import { useVinetka } from "@/lib/vinetka-store";

export function OrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const submit = useServerFn(createOrder);
  const { pages } = useVinetka();
  const [form, setForm] = useState({ name: "", phone: "", username: "", note: "" });
  const [busy, setBusy] = useState(false);

  const photosCount = pages.reduce((n, p) => n + p.photos.length, 0);

  async function handleSubmit() {
    if (form.name.trim().length < 2 || form.phone.trim().length < 7) {
      toast.error("Ism va telefon raqamni to'liq kiriting");
      return;
    }
    setBusy(true);
    try {
      const res = await submit({
        data: {
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          kind: "vinetka" as const,
          photosCount,
          pagesCount: pages.length,
          note: form.note.trim(),
          telegramUsername: form.username.trim(),
        },
      });
      toast.success(`Buyurtma qabul qilindi: #${res.orderNo}`);
      onOpenChange(false);
      setForm({ name: "", phone: "", username: "", note: "" });
    } catch {
      toast.error("Buyurtma yuborilmadi. Qaytadan urinib ko'ring.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buyurtma berish</DialogTitle>
          <DialogDescription>
            {photosCount} ta rasm · {pages.length} bet. Ro'yxatdan o'tish shart emas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Ism familiya</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefon raqam</Label>
            <Input
              placeholder="+998 90 123 45 67"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Telegram username (ixtiyoriy)</Label>
            <Input
              placeholder="@username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Izoh</Label>
            <Textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={busy} className="font-semibold">
            {busy ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
