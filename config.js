// Configuración central de Forma. Se completa a medida que se abren las cuentas.
// Dejá un valor vacío ("") para que el botón o formulario aparezca como "todavía no conectado".
window.FORMA = {
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
  paypal: ""
};
