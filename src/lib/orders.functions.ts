import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderInput = z.object({
  customerName: z.string().min(2).max(80),
  phone: z.string().min(7).max(25),
  kind: z.enum(["vinetka", "toy-albom"]),
  photosCount: z.number().int().min(0).max(500),
  pagesCount: z.number().int().min(1).max(50),
  note: z.string().max(500).optional().default(""),
  telegramUsername: z.string().max(64).optional().default(""),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { notifyNewOrder } = await import("./telegram.server");

    const { data: noRow, error: noErr } = await supabaseAdmin.rpc("next_order_no");
    if (noErr) throw new Error(noErr.message);
    const orderNo = String(noRow);

    let telegramId: number | null = null;
    const uname = data.telegramUsername.replace(/^@/, "").trim();
    if (uname) {
      const { data: tgUser } = await supabaseAdmin
        .from("telegram_users")
        .select("telegram_id")
        .ilike("username", uname)
        .maybeSingle();
      telegramId = tgUser?.telegram_id ? Number(tgUser.telegram_id) : null;
    }

    const { error } = await supabaseAdmin.from("orders").insert({
      order_no: orderNo,
      kind: data.kind,
      customer_name: data.customerName,
      phone: data.phone,
      telegram_id: telegramId,
      photos_count: data.photosCount,
      pages_count: data.pagesCount,
      note: data.note,
      status: "yangi",
    });
    if (error) throw new Error(error.message);

    await notifyNewOrder({
      orderNo,
      kind: data.kind,
      customerName: data.customerName,
      phone: data.phone,
      photosCount: data.photosCount,
      pagesCount: data.pagesCount,
      note: data.note,
      telegramId,
    });

    return { orderNo };
  });
