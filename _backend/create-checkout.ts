// Supabase Edge Function: create-checkout
// La app la llama con la sesión del usuario. Crea el pago de Forma Pro en Mercado Pago.
// Secrets: MP_ACCESS_TOKEN (SUPABASE_URL y SUPABASE_ANON_KEY ya vienen).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Forma Pro: una sola oferta, todo incluido. Pago único, no se renueva solo.
const PRODUCTS: Record<string, { title: string; price: number }> = {
  "forma-pro": { title: "Forma Pro anual (12 meses)", price: 47900 },
  "forma-pro-mes": { title: "Forma Pro mensual (1 mes)", price: 7900 },
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: u } = await sb.auth.getUser();
    const email = u?.user?.email?.toLowerCase();
    if (!email) return json({ error: "Necesitás iniciar sesión." }, 401);

    const { product } = await req.json();
    const p = PRODUCTS[String(product)];
    if (!p) return json({ error: "Este producto no está a la venta." }, 400);

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: product, title: p.title, quantity: 1, currency_id: "ARS", unit_price: p.price }],
        payer: { email },
        metadata: { account_email: email },
        external_reference: String(product),
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
        back_urls: { success: "https://formargentina.com/miforma?pago=ok", failure: "https://formargentina.com/miforma?pago=error", pending: "https://formargentina.com/miforma?pago=pendiente" },
        auto_return: "approved",
        statement_descriptor: "FORMA",
      }),
    });
    const d = await r.json();
    if (!d.init_point) return json({ error: "No se pudo crear el pago." }, 502);
    return json({ url: d.init_point });
  } catch (e) {
    console.error(e);
    return json({ error: "Error inesperado." }, 500);
  }
});
