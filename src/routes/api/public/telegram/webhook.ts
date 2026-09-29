import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import {
  ADMIN_ID,
  STATUSES,
  escapeHtml,
  notifyNewUser,
  sendMessage,
  statusLabel,
  tg,
  webhookSecret,
} from "@/lib/telegram.server";

function db() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const SITE_URL =
  process.env["PUBLIC_APP_URL"] ??
  "https://project--d03c8bc4-473e-5f0c-a802-00cb78658015.lovable.app";

const mainMenu = {
  inline_keyboard: [
    [{ text: "🆕 Yangi buyurtma berish", callback_data: "menu:new" }],
    [{ text: "📋 Mening buyurtmalarim", callback_data: "menu:orders" }],
    [{ text: "💰 Narxlar", callback_data: "menu:prices" }],
    [{ text: "🔍 Buyurtma holatini ko'rish", callback_data: "menu:status" }],
    [{ text: "🆘 Yordam / Admin bilan bog'lanish", callback_data: "menu:help" }],
  ],
};

const adminMenu = {
  inline_keyboard: [
    [{ text: "📊 Statistika", callback_data: "adm:stats" }],
    [{ text: "📦 Oxirgi buyurtmalar", callback_data: "adm:orders" }],
  ],
};

const isAdmin = (id: number) => id === ADMIN_ID;

async function upsertUser(from: {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}) {
  const supabase = db();
  const fullName = [from.first_name, from.last_name].filter(Boolean).join(" ") || "Foydalanuvchi";
  const { data: existing } = await supabase
    .from("telegram_users")
    .select("id")
    .eq("telegram_id", from.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("telegram_users")
      .update({ full_name: fullName, username: from.username ?? null })
      .eq("telegram_id", from.id);
    return false;
  }

  await supabase.from("telegram_users").insert({
    telegram_id: from.id,
    full_name: fullName,
    username: from.username ?? null,
  });
  await notifyNewUser({ fullName, email: null, phone: null });
  return true;
}

async function listOrders(telegramId: number) {
  const { data } = await db()
    .from("orders")
    .select("order_no, kind, status, photos_count, pages_count, created_at")
    .eq("telegram_id", telegramId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data || data.length === 0) return "Sizda hali buyurtma yo'q.";
  return data
    .map(
      (o) =>
        `<b>#${o.order_no}</b> — ${o.kind === "toy-albom" ? "Toy Albom" : "Vinetka"}\n` +
        `Holat: ${statusLabel(o.status)} · ${o.photos_count} rasm · ${o.pages_count} bet`,
    )
    .join("\n\n");
}

async function handleCallback(cb: {
  id: string;
  data: string;
  from: { id: number };
  message?: { chat: { id: number }; message_id: number };
}) {
  const chatId = cb.message?.chat.id ?? cb.from.id;
  const [ns, a, b] = cb.data.split(":");
  await tg("answerCallbackQuery", { callback_query_id: cb.id });

  if (ns === "menu") {
    if (a === "new") {
      await sendMessage(
        chatId,
        "🎨 <b>Yangi buyurtma</b>\n\nSaytda vinetkangizni bepul tayyorlang — ro'yxatdan o'tish shart emas. Tayyor bo'lgach «Buyurtma berish» tugmasini bosing.",
        { inline_keyboard: [[{ text: "🖥 Saytni ochish", url: SITE_URL }]] },
      );
    } else if (a === "orders") {
      await sendMessage(chatId, await listOrders(cb.from.id));
    } else if (a === "prices") {
      await sendMessage(
        chatId,
        "💰 <b>Narxlar</b>\n\n• Vinetka (1 bet): 150 000 so'm\n• Har qo'shimcha bet: 70 000 so'm\n• Toy albom (20 bet): 600 000 so'm\n• Chop etish va ramka: kelishilgan holda",
      );
    } else if (a === "status") {
      await sendMessage(chatId, "Buyurtma raqamini yuboring, masalan: <code>ORD-2026-001</code>");
    } else if (a === "help") {
      await sendMessage(
        chatId,
        "🆘 Savollaringiz bo'lsa, admin bilan bog'laning.",
        { inline_keyboard: [[{ text: "👤 Admin bilan bog'lanish", url: `tg://user?id=${ADMIN_ID}` }]] },
      );
    }
    return;
  }

  if (!isAdmin(cb.from.id)) return;

  if (ns === "st" && a && b) {
    const supabase = db();
    const { data: order } = await supabase
      .from("orders")
      .update({ status: b })
      .eq("order_no", a)
      .select("order_no, telegram_id")
      .maybeSingle();

    if (!order) {
      await sendMessage(chatId, "Buyurtma topilmadi.");
      return;
    }
    await sendMessage(chatId, `✅ <b>#${a}</b> holati: ${statusLabel(b)}`);
    if (order.telegram_id) {
      await sendMessage(
        Number(order.telegram_id),
        `🔔 Buyurtmangiz <b>#${a}</b> holati yangilandi: <b>${statusLabel(b)}</b>`,
      );
    }
    return;
  }

  if (ns === "adm" && a === "stats") {
    const supabase = db();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const [{ count: users }, { count: orders }, { count: todayOrders }] = await Promise.all([
      supabase.from("telegram_users").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
    ]);
    await sendMessage(
      chatId,
      `📊 <b>Statistika</b>\n\nBugungi buyurtmalar: ${todayOrders ?? 0}\nJami buyurtmalar: ${orders ?? 0}\nJami foydalanuvchilar: ${users ?? 0}`,
    );
    return;
  }

  if (ns === "adm" && a === "orders") {
    const { data } = await db()
      .from("orders")
      .select("order_no, customer_name, phone, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    const text =
      data && data.length
        ? data
            .map(
              (o) =>
                `<b>#${o.order_no}</b> — ${escapeHtml(o.customer_name)} (${escapeHtml(o.phone)})\nHolat: ${statusLabel(o.status)}`,
            )
            .join("\n\n")
        : "Buyurtmalar yo'q.";
    await sendMessage(chatId, text);
  }
}

async function handleMessage(msg: {
  chat: { id: number };
  text?: string;
  contact?: { phone_number: string };
  from: { id: number; first_name?: string; last_name?: string; username?: string };
}) {
  const chatId = msg.chat.id;
  const text = (msg.text ?? "").trim();
  const supabase = db();

  if (msg.contact) {
    await supabase
      .from("telegram_users")
      .update({ phone: msg.contact.phone_number })
      .eq("telegram_id", msg.from.id);
    await sendMessage(chatId, "✅ Raqamingiz saqlandi. Rahmat!", mainMenu);
    return;
  }

  if (text.startsWith("/start")) {
    await upsertUser(msg.from);
    await sendMessage(
      chatId,
      `👋 <b>Assalomu alaykum, ${escapeHtml(msg.from.first_name ?? "do'stim")}!</b>\n\n` +
        `«Vinetka & Toy Albom» platformasiga xush kelibsiz.\n` +
        `Sinf vinetkangizni yoki to'y albomingizni onlayn tayyorlang va bizga buyurtma bering.`,
      mainMenu,
    );
    if (isAdmin(msg.from.id)) await sendMessage(chatId, "🔐 Admin panel:", adminMenu);
    return;
  }

  if (text === "/menu") {
    await sendMessage(chatId, "Asosiy menyu:", mainMenu);
    return;
  }

  if (isAdmin(msg.from.id)) {
    if (text === "/admin") {
      await sendMessage(chatId, "🔐 Admin panel:", adminMenu);
      return;
    }
    if (text.startsWith("/send ")) {
      const rest = text.slice(6);
      const space = rest.indexOf(" ");
      const target = Number(rest.slice(0, space));
      const body = rest.slice(space + 1);
      if (!target || !body) {
        await sendMessage(chatId, "Format: <code>/send &lt;telegram_id&gt; xabar</code>");
        return;
      }
      await sendMessage(target, `✉️ <b>Admin xabari</b>\n\n${escapeHtml(body)}`);
      await sendMessage(chatId, "Yuborildi ✅");
      return;
    }
    if (text.startsWith("/status ")) {
      const [, orderNo, status] = text.split(/\s+/);
      if (!orderNo || !STATUSES.some((s) => s.key === status)) {
        await sendMessage(
          chatId,
          `Format: <code>/status ORD-2026-001 ${STATUSES.map((s) => s.key).join("|")}</code>`,
        );
        return;
      }
      await supabase.from("orders").update({ status }).eq("order_no", orderNo.replace("#", ""));
      await sendMessage(chatId, `✅ #${orderNo} → ${statusLabel(status!)}`);
      return;
    }
  }

  const orderNo = text.replace("#", "").toUpperCase();
  if (/^ORD-\d{4}-\d+$/.test(orderNo)) {
    const { data: order } = await supabase
      .from("orders")
      .select("order_no, status, kind, photos_count, pages_count")
      .eq("order_no", orderNo)
      .maybeSingle();
    await sendMessage(
      chatId,
      order
        ? `📦 <b>#${order.order_no}</b>\nTuri: ${order.kind === "toy-albom" ? "Toy Albom" : "Vinetka"}\nRasmlar: ${order.photos_count} · Betlar: ${order.pages_count}\nHolat: <b>${statusLabel(order.status)}</b>`
        : "Bunday raqamli buyurtma topilmadi.",
    );
    return;
  }

  await sendMessage(chatId, "Quyidagi menyudan tanlang:", mainMenu);
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
        if (secret !== (await webhookSecret())) {
          return new Response("Unauthorized", { status: 401 });
        }

        let update: Record<string, unknown>;
        try {
          update = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: true });
        }

        try {
          if (update["callback_query"]) {
            await handleCallback(update["callback_query"] as never);
          } else {
            const msg = (update["message"] ?? update["edited_message"]) as never;
            if (msg) await handleMessage(msg);
          }
        } catch (error) {
          console.error("Telegram webhook error", error);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
