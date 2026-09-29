export const ADMIN_ID = 7033912501;

export function botToken() {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

/** Secret token shared with Telegram, derived from the bot token. */
export async function webhookSecret() {
  const bytes = new TextEncoder().encode(`telegram-webhook:${botToken()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type Keyboard = { inline_keyboard: { text: string; callback_data?: string; url?: string }[][] };

export async function tg(method: string, payload: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || (body && body.ok === false)) {
    console.error(`Telegram ${method} failed [${res.status}]`, JSON.stringify(body));
  }
  return body;
}

export function sendMessage(chatId: number, text: string, keyboard?: Keyboard) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

export const STATUSES = [
  { key: "qabul", label: "Qabul qilindi" },
  { key: "ishlanmoqda", label: "Ishlanmoqda" },
  { key: "tayyor", label: "Tayyor" },
  { key: "yetkazildi", label: "Yetkazib berildi" },
] as const;

export function statusLabel(key: string) {
  return STATUSES.find((s) => s.key === key)?.label ?? "Yangi";
}

function nowTashkent() {
  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tashkent",
  }).format(new Date());
}

export async function notifyNewUser(user: {
  fullName: string;
  email?: string | null;
  phone?: string | null;
}) {
  const text =
    `🎉 <b>Yangi foydalanuvchi!</b>\n\n` +
    `Ism: ${escapeHtml(user.fullName || "-")}\n` +
    `Email: ${escapeHtml(user.email || "-")}\n` +
    `Telefon: ${escapeHtml(user.phone || "-")}\n` +
    `Vaqt: ${nowTashkent()}`;
  await sendMessage(ADMIN_ID, text);
}

export async function notifyNewOrder(order: {
  orderNo: string;
  kind: string;
  customerName: string;
  phone: string;
  photosCount: number;
  pagesCount: number;
  note?: string;
  telegramId?: number | null;
}) {
  const kind = order.kind === "toy-albom" ? "Toy Albom" : "Vinetka";
  const text =
    `📦 <b>Yangi buyurtma!</b>\n\n` +
    `Buyurtma raqami: <code>#${order.orderNo}</code>\n` +
    `Turi: ${kind}\n` +
    `Foydalanuvchi: ${escapeHtml(order.customerName)}\n` +
    `Telefon: ${escapeHtml(order.phone)}\n` +
    `Rasmlar soni: ${order.photosCount}\n` +
    `Betlar soni: ${order.pagesCount}\n` +
    `Izoh: ${escapeHtml(order.note || "-")}\n` +
    `Holat: Yangi`;

  const adminUrl = process.env["PUBLIC_APP_URL"] ?? "https://project--d03c8bc4-473e-5f0c-a802-00cb78658015.lovable.app";

  await sendMessage(ADMIN_ID, text, {
    inline_keyboard: [
      [{ text: "🖼 View Design", url: `${adminUrl}/admin?order=${order.orderNo}` }],
      [
        { text: "✅ Qabul qilindi", callback_data: `st:${order.orderNo}:qabul` },
        { text: "⚙️ Ishlanmoqda", callback_data: `st:${order.orderNo}:ishlanmoqda` },
      ],
      [
        { text: "🎁 Tayyor", callback_data: `st:${order.orderNo}:tayyor` },
        { text: "🚚 Yetkazib berildi", callback_data: `st:${order.orderNo}:yetkazildi` },
      ],
    ],
  });

  if (order.telegramId) {
    await sendMessage(
      order.telegramId,
      `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\nRaqam: <code>#${order.orderNo}</code>\nTuri: ${kind}\nHolat: Yangi\n\nTez orada siz bilan bog'lanamiz.`,
    );
  }
}
