import { createFileRoute } from "@tanstack/react-router";

import { tg, webhookSecret } from "@/lib/telegram.server";

const WEBHOOK_URL =
  (process.env["PUBLIC_APP_URL"] ??
    "https://project--d03c8bc4-473e-5f0c-a802-00cb78658015-dev.lovable.app") +
  "/api/public/telegram/webhook";

/**
 * Idempotent, parameterless bot wiring: always points the bot at this app's own
 * webhook with a secret derived from the bot token, so it is safe to call publicly.
 */
async function register() {
  const set = await tg("setWebhook", {
    url: WEBHOOK_URL,
    secret_token: await webhookSecret(),
    allowed_updates: ["message", "edited_message", "callback_query"],
    drop_pending_updates: true,
  });
  const info = await tg("getWebhookInfo", {});
  return Response.json({ url: WEBHOOK_URL, set, info });
}

export const Route = createFileRoute("/api/public/telegram/setup")({
  server: { handlers: { GET: register, POST: register } },
});
