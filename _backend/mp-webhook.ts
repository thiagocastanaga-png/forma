// Supabase Edge Function: mp-webhook
// Mercado Pago avisa acá cuando se paga. Registra la compra con su vencimiento y manda el mail.
// Desplegar SIN verificación de JWT. Secrets: MP_ACCESS_TOKEN, RESEND_API_KEY
// (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya vienen).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const DAYS: Record<string, number> = { "forma-pro": 365, "forma-pro-mes": 31 };
const NAMES: Record<string, string> = { "forma-pro": "Forma Pro anual", "forma-pro-mes": "Forma Pro mensual" };

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const paymentId = body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
    if (!paymentId) return new Response("ok");

    // Verificamos el pago directo con Mercado Pago (no confiamos en lo que llega)
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}` },
    });
    const p = await r.json();
    if (p.status !== "approved") return new Response("pending");

    const email = String(p.metadata?.account_email ?? p.payer?.email ?? "").toLowerCase();
    const productId = String(p.external_reference ?? "");
    if (!email || !DAYS[productId]) return new Response("missing data", { status: 400 });

    // Si ya tiene Pro activo, el nuevo período empieza cuando termina el actual
    const { data: prev } = await sb.from("purchases").select("expires_at").eq("email", email).order("expires_at", { ascending: false }).limit(1);
    const now = Date.now();
    const from = Math.max(now, prev && prev[0]?.expires_at ? Date.parse(prev[0].expires_at) : 0);
    const expires = new Date(from + DAYS[productId] * 864e5).toISOString();

    const { error } = await sb.from("purchases").insert({
      email, product_id: productId, provider: "mercadopago",
      provider_payment_id: String(paymentId), amount: p.transaction_amount, currency: p.currency_id, expires_at: expires,
    });
    if (error && !String(error.message).includes("duplicate")) throw error; // duplicado = ya registrado

    if (!error) {
      const hasta = new Date(expires).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Forma <hola@formargentina.com>", to: email,
          subject: `¡Ya tenés ${NAMES[productId]}!`,
          html: `<p>¡Gracias por pasarte a Forma Pro!</p><p>Tu ${NAMES[productId]} está activo hasta el <b>${hasta}</b>. No se renueva solo: te avisamos antes de que venza.</p>
                 <p>Entrá a <a href="https://formargentina.com/miforma">formargentina.com/miforma</a> con este mismo mail y ya tenés todo desbloqueado.</p>
                 <p>Si te arrepentís, tenés 10 días para pedir la devolución: <a href="https://formargentina.com/arrepentimiento">formargentina.com/arrepentimiento</a>.</p>
                 <p>Forma · Dale forma a la vida que querés</p>`,
        }),
      });
    }
    return new Response("ok");
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
});
