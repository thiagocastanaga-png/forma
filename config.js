// Configuración central de Forma. Se completa a medida que se abren las cuentas.
// Dejá un valor vacío ("") para que el botón o formulario aparezca como "todavía no conectado".
window.FORMA = {
  // Versión de prueba: las compras son simuladas (no se cobra nada). Poné false para abrir los pagos reales.
  beta: true,
  instagram: "https://www.instagram.com/formargentina/",
  // Endpoint del formulario de lista de espera (por ejemplo https://formspree.io/f/xxxxxxx)
  formEndpoint: "",
  // Lista de espera: Google Form de la cuenta de Forma (las respuestas llegan a su hoja de respuestas)
  googleForm: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSeObRl_HlzcRUa2MYgmD5rajCd2MRMqCCXzDZ7sysTALqBAzg/formResponse",
    fields: { email: "entry.1361131224", interes: "entry.1087957727", origen: "entry.151266011", pagina: "entry.1806711279" }
  },
  // Links de pago de la preventa de Sección Tenis
  mercadoPago: "",
  paypal: "",
  // Links de pago por producto o plan: { "t-pre": "https://...", "plan-vida": "https://..." }
  links: {},
  // Cuentas y sincronización (Supabase). La clave "publishable" es pública por diseño; la seguridad la dan las reglas RLS.
  supabase: {
    url: "https://vimjookrejyzkmyxcniv.supabase.co",
    key: "sb_publishable_RJSDb_1_YTh1wlvHSukETg_RbpcQbsU"
  }
};
