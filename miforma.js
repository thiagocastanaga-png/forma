(function () {
  "use strict";
  var CFG = window.FORMA || {};
  var KEY = "forma_app_v1", NUEVO = false, FLUJO = false, PRUEBA = false, PFREE = false;
  // ?nuevo=1 → cuenta de prueba nueva, aislada de tus datos reales (con &pro=1 desbloquea Pro)
  try { var qp = new URLSearchParams(location.search); if (qp.get("prueba") === "1") { NUEVO = true; FLUJO = true; PRUEBA = true; PFREE = qp.get("free") === "1"; KEY = PFREE ? "forma_app_prueba_free" : "forma_app_prueba"; } } catch (e) {}
  try { var qn = new URLSearchParams(location.search); if (!PRUEBA && qn.get("nuevo") === "1" || qn.get("flujo") === "1") { NUEVO = true; FLUJO = qn.get("flujo") === "1"; KEY = "forma_app_nuevo"; if (sessionStorage.getItem("forma_nuevo") !== location.search) { localStorage.removeItem(KEY); sessionStorage.setItem("forma_nuevo", location.search); } } } catch (e) {}
  var NATIVE = false; try { NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) {}
  var FREE_HABITS = 0;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  var LMARK = '<svg class="lmark" viewBox="0 0 512 512" aria-hidden="true"><path d="M278.7 71.4A186 186 0 0 1 392.0 382.9L323.3 318.7A92 92 0 0 0 267.2 164.7Z" fill="#C6F432" stroke="#C6F432" stroke-width="14" stroke-linejoin="round"/><path d="M357.3 412.0A186 186 0 0 1 71.4 278.7L164.7 267.2A92 92 0 0 0 306.1 333.2Z" fill="currentColor" stroke="currentColor" stroke-width="14" stroke-linejoin="round"/><path d="M71.4 233.3A186 186 0 0 1 233.3 71.4L244.8 164.7A92 92 0 0 0 164.7 244.8Z" fill="#86A892" stroke="#86A892" stroke-width="14" stroke-linejoin="round"/></svg>';
  function stageRing(st) { var P = ['M278.7 71.4A186 186 0 0 1 392.0 382.9L323.3 318.7A92 92 0 0 0 267.2 164.7Z', 'M357.3 412.0A186 186 0 0 1 71.4 278.7L164.7 267.2A92 92 0 0 0 306.1 333.2Z', 'M71.4 233.3A186 186 0 0 1 233.3 71.4L244.8 164.7A92 92 0 0 0 164.7 244.8Z'], C = ['#C6F432', '#F5F1E8', '#86A892']; return '<svg class="sring" viewBox="0 0 512 512" aria-hidden="true">' + P.map(function (d, i) { var on = i + 1 <= st; return '<path d="' + d + '" fill="' + C[i] + '" stroke="' + C[i] + '" stroke-width="14" stroke-linejoin="round" opacity="' + (on ? 1 : .22) + '"/>'; }).join('') + '</svg>'; }
  // ---------- catálogo ----------
  var SHAPES = {
    tenis: '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="#C6F432"/></svg>',
    futbol: '<svg viewBox="0 0 44 44"><path d="M2 2 A40 40 0 0 1 42 42 H2 Z" fill="#4C7DFF"/></svg>',
    voley: '<svg viewBox="0 0 44 44"><rect x="3" y="3" width="38" height="38" fill="#FFC83D"/></svg>',
    basquet: '<svg viewBox="0 0 44 44"><path d="M22 3 L41 41 H3 Z" fill="#FF8A4C"/></svg>',
    handball: '<svg viewBox="0 0 44 44"><path d="M2 36 A20 20 0 0 1 42 36 Z" fill="#B9A7F0"/></svg>',
    vida: '<svg viewBox="0 0 44 44"><path d="M3 22 A19 19 0 0 1 22 3 H41 V22 A19 19 0 0 1 22 41 H3 Z" fill="#86A892"/></svg>',
    dormir: '<svg viewBox="0 0 44 44"><path d="M30 3 A20 20 0 1 0 41 31 A17 17 0 0 1 30 3 Z" fill="#4C7DFF"/></svg>',
    celular: '<svg viewBox="0 0 44 44"><rect x="10" y="3" width="24" height="38" rx="8" fill="#FF8A4C"/></svg>',
    arrancar: '<svg viewBox="0 0 44 44"><path d="M8 4 L40 22 L8 40 Z" fill="#FFC83D"/></svg>',
    calma: '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="16" fill="none" stroke="#B9A7F0" stroke-width="9"/></svg>',
    estudio: '<svg viewBox="0 0 44 44"><path d="M3 8 H20 V40 H3 Z M24 8 H41 V40 H24 Z" fill="#5FC4B0"/></svg>',
    plata: '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="#C6F432"/><rect x="19" y="10" width="6" height="24" fill="#111"/></svg>',
    movimiento: '<svg viewBox="0 0 44 44"><path d="M4 36 L22 6 L40 36 Z" fill="#FF8A4C"/></svg>',
    comer: '<svg viewBox="0 0 44 44"><path d="M22 40 A18 18 0 1 1 22 4 A18 18 0 0 1 22 40 Z" fill="#FFC83D"/><circle cx="22" cy="22" r="6" fill="#111"/></svg>',
    laburo: '<svg viewBox="0 0 44 44"><rect x="4" y="12" width="36" height="26" rx="6" fill="#4C7DFF"/><rect x="15" y="4" width="14" height="8" rx="3" fill="#4C7DFF"/></svg>',
    viajes: '<svg viewBox="0 0 44 44"><path d="M4 24 L40 6 L30 40 L22 26 Z" fill="#B9A7F0"/></svg>'
  };
  var AREAS = [
    ["cuerpo", "Cuerpo", "Energía, sueño, movimiento y comida"],
    ["mente", "Mente", "Calma, ánimo y cabeza despejada"],
    ["relaciones", "Relaciones", "Familia, pareja y amigos"],
    ["trabajo", "Trabajo o estudio", "Foco, avance y organización"],
    ["tiempo", "Tiempo propio", "Disfrutar lo que me gusta"],
    ["hogar", "Hogar", "Orden y cosas del día a día"],
    ["plata", "Plata", "Claridad con mis gastos"]
  ];
  function areaName(id) { if (id.indexOf("plan-") === 0) { var pl = planOf(id.slice(5)); return pl ? "Tu plan " + pl.n : id; } var a = AREAS.filter(function (x) { return x[0] === id; })[0]; return a ? a[1] : id; }
  var MOODS = ["Mal", "Así así", "Normal", "Bien", "Muy bien"], ENERGY = ["Baja", "Media", "Alta"];
  // Hábitos sugeridos por área. slot = [ancla, minutos]; f = veces por semana; m = versión mínima
  var TPL = [
    { id: "t-agua", a: "cuerpo", n: "Tomar agua al despertar", slot: ["wake", 0], f: 7, m: "Un vaso de agua" },
    { id: "t-mov", a: "cuerpo", n: "Pausa de movimiento", slot: ["we", 45], f: 3, m: "2 minutos de estiramiento", pr: "energia" },
    { id: "t-dormir", a: "cuerpo", n: "Rutina para dormir", slot: ["sleep", -30], f: 7, m: "Apagar pantallas 15 minutos antes", pr: "dormir" },
    { id: "t-comida", a: "cuerpo", n: "Pensar mis comidas del día", slot: ["wake", 30], f: 5, m: "Decidir qué voy a almorzar" },
    { id: "t-resp", a: "mente", n: "Respiración guiada", slot: ["wake", 10], f: 7, m: "3 respiraciones lentas", tool: "respirar" },
    { id: "t-calma", a: "mente", n: "Respiración para calmar", slot: ["lunch", 180], f: 3, m: "1 minuto de respiración", pr: "ansiedad", fb: "respirar" },
    { id: "t-cierre", a: "mente", n: "Cierre del día", slot: ["sleep", -60], f: 5, m: "Anotar una cosa que salió bien", pr: "cierre", fb: "organizar" },
    { id: "t-pantallas", a: "mente", n: "10 minutos sin pantalla", slot: ["lunch", 270], f: 5, m: "3 minutos mirando por la ventana" },
    { id: "t-foco", a: "trabajo", n: "Bloque de foco", slot: ["ws", 0], f: 5, m: "10 minutos en la tarea más importante", pr: "foco" },
    { id: "t-org", a: "trabajo", n: "Organizar mi día", slot: ["wake", 25], f: 5, m: "Elegir 1 prioridad", tool: "organizar" },
    { id: "t-fam", a: "relaciones", n: "Tiempo con los míos", slot: ["sleep", -180], f: 3, m: "Mandar un mensaje a alguien querido" },
    { id: "t-llamar", a: "relaciones", n: "Llamar a alguien que quiero", slot: ["we", 90], f: 1, m: "Mandar un audio corto" },
    { id: "t-gusto", a: "tiempo", n: "Algo que me gusta (30 min)", slot: ["we", 120], f: 3, m: "10 minutos de eso que me gusta" },
    { id: "t-casa", a: "hogar", n: "Casa en orden (15 min)", slot: ["we", 90], f: 3, m: "Ordenar una sola cosa" },
    { id: "tn-pre", a: "plan-tenis", n: "Pre y post partido", slot: ["we", 60], f: 3, m: "5 minutos de movilidad", pr: "t-pre", need: "t-pre" },
    { id: "tn-resp", a: "plan-tenis", n: "Respiración y enfoque", slot: ["we", 30], f: 3, m: "1 minuto de respiración antes de jugar", pr: "t-resp", need: "t-resp" },
    { id: "tn-mov", a: "plan-tenis", n: "Movilidad", slot: ["wake", 20], f: 3, m: "5 movimientos suaves", pr: "t-mov", need: "t-mov" },
    { id: "tn-rut", a: "plan-tenis", n: "Rutina física", slot: ["we", 90], f: 3, m: "10 minutos de lo más importante de la rutina", pr: "t-rut", need: "t-rut" },
    { id: "t-plata", a: "plata", n: "Revisar mis gastos (10 min)", slot: ["sleep", -240], f: 1, m: "Anotar un gasto" }
  ];
  var SPORTS = [["tenis", "Tenis"], ["futbol", "Fútbol"], ["voley", "Vóley"], ["basquet", "Básquet"], ["handball", "Handball"]];

  // Planes: cada uno es como un "curso". Gratis para empezar, Pro para todo el plan.
  var PLANS = [
    { id: "vida", n: "Vida diaria", c: "#86A892", pro: "plan-vida", live: true, grp: "Vida diaria", price: "",
      d: "Un sistema para ordenar tu día y tu vida a tu manera: sin rigidez, con lo que vos elegís. Para gente común, a tu ritmo.",
      free: ["Tu día armado con 12 preguntas, fijo en la pantalla de Hoy", "Tu mapa de vida", "Respiración guiada de 1 minuto"],
      pros: ["Incluye los planes de vida diaria: dormir, celular, arrancar, calma y los que vienen", "Tildar tu día y seguir tu constancia semanal", "Cambiar tu día cuando cambie tu vida", "Avisos en el calendario de tu celular", "Actividades guiadas dentro de tu día: calma, movimiento, foco, cierre y sueño", "Lo que hiciste bien hoy y tus pendientes", "Hábitos propios sin límite y revisión semanal", "Se incluye con cualquier otro plan Pro"] },
    { id: "dormir", n: "Dormir de verdad", c: "#4C7DFF", pro: "plan-dormir", live: true, prog: "dormir", inc: true, grp: "Vida diaria", price: "",
      d: "14 días para ordenar tu sueño: cargás tus horarios, hacés un paso por día y al final ves tus datos reales.",
      free: ["Tu día armado", "El paso 1 para probar"], pros: ["Programa de 14 pasos, uno por día", "Registro de tus horarios con gráfico", "Rutina guiada para dormir y respiración", "Tu resultado final con datos reales", "Incluido en Vida diaria Pro"] },
    { id: "celular", n: "Celular bajo control", c: "#FF8A4C", pro: "plan-celular", live: true, prog: "celular", inc: true, grp: "Vida diaria", price: "",
      d: "14 días para usar el celular vos y que no te use a vos. Medís tu pantalla y ves cuánto la bajás.",
      free: ["Tu día armado", "El paso 1 para probar"], pros: ["Programa de 14 pasos, uno por día", "Registro de tu tiempo de pantalla con gráfico", "Temporizadores y desafíos dentro de la app", "Tu resultado final con datos reales", "Incluido en Vida diaria Pro"] },
    { id: "arrancar", n: "Arrancar", c: "#FFC83D", pro: "plan-arrancar", live: true, prog: "arrancar", inc: true, grp: "Vida diaria", price: "",
      d: "14 días para dejar de postergar: pasos diminutos, foco de 25 minutos y un registro de lo que lográs.",
      free: ["Tu día armado", "El paso 1 para probar"], pros: ["Programa de 14 pasos, uno por día", "Bloques de foco guiados", "Registro de minutos de foco con gráfico", "Tu resultado final con datos reales", "Incluido en Vida diaria Pro"] },
    { id: "calma", n: "Calmar la cabeza", c: "#B9A7F0", pro: "plan-calma", live: true, prog: "calma", inc: true, grp: "Vida diaria", price: "",
      d: "14 días con herramientas simples para bajar la tensión de todos los días y armar tu propio kit.",
      free: ["Tu día armado", "El paso 1 para probar"], pros: ["Programa de 14 pasos, uno por día", "Respiraciones y ejercicios guiados", "Registro de tu tensión con gráfico", "Tu resultado final con datos reales", "Incluido en Vida diaria Pro"] },
    { id: "estudio", n: "Estudiar mejor", c: "#5FC4B0", pro: "plan-estudio", live: true, prog: "estudio", grp: "Estudio y trabajo", price: "",
      d: "Para estudiantes: organizá tu estudio, aprendé técnicas que funcionan y rendí mejor en tus exámenes. 14 días, dentro de la app.",
      free: ["Tu día armado", "El paso 1 para probar"], pros: ["Programa de 14 pasos, uno por día", "Técnicas probadas: recordar sin mirar, repaso espaciado, práctica de examen", "Bloques de foco guiados", "Registro de tus minutos de estudio con gráfico", "Tu método final, armado con lo que te funcionó", "Vida diaria Pro incluido"] },
    { id: "laburo", n: "Buscar trabajo", c: "#4C7DFF", pro: "plan-laburo", live: false, grp: "Estudio y trabajo", d: "Armá tu CV, practicá entrevistas y organizá tu búsqueda con un plan diario." },
    { id: "plata", n: "Plata en orden", c: "#C6F432", pro: "plan-plata", live: false, inc: true, grp: "Vida diaria", d: "Entender adónde se va tu plata, armar un presupuesto simple y llegar a fin de mes con menos estrés." },
    { id: "movimiento", n: "Moverme", c: "#FF8A4C", pro: "plan-movimiento", live: false, inc: true, grp: "Vida diaria", d: "Empezar a moverte en serio, de a poco y sin lesionarte, aunque hoy no hagas nada." },
    { id: "comer", n: "Comer ordenado", c: "#FFC83D", pro: "plan-comer", live: false, inc: true, grp: "Vida diaria", d: "Planificar tus comidas y compras para comer mejor sin dietas raras ni perder tiempo." },
    { id: "viajes", n: "Armá tu viaje", c: "#B9A7F0", pro: "plan-viajes", live: false, grp: "Servicios extras", d: "Servicio extra: contanos adónde querés ir y te armamos el itinerario, los días y el presupuesto." },
    { id: "tenis", n: "Tenis", c: "#C6F432", grp: "Deportes", pro: "t-full", live: true, price: "USD 20", was: "USD 29", promo: "Precio de preventa para las primeras 10 compras",
      d: "Rutinas de preparación para jugadores que compiten.",
      free: ["Respirar 1 minuto", "Aviso cuando abra la preventa"],
      pros: ["Vida diaria Pro incluido", "Pre y post partido", "Respiración y enfoque", "Movilidad", "Rutina física, para sumar a tu día"] },
    { id: "futbol", n: "Fútbol", grp: "Deportes", c: "#4C7DFF", pro: "plan-futbol", live: false, d: "Rutinas para futbolistas: antes y después del partido, movilidad y fuerza." },
    { id: "voley", n: "Vóley", grp: "Deportes", c: "#FFC83D", pro: "plan-voley", live: false, d: "Rutinas para vóley: saltos, hombros y recuperación." },
    { id: "basquet", n: "Básquet", grp: "Deportes", c: "#FF8A4C", pro: "plan-basquet", live: false, d: "Rutinas para básquet: explosividad, tobillos y recuperación." },
    { id: "handball", n: "Handball", grp: "Deportes", c: "#B9A7F0", pro: "plan-handball", live: false, d: "Rutinas para handball: lanzamiento, hombros y recuperación." }
  ];
  function planOf(id) { return PLANS.filter(function (p) { return p.id === id; })[0]; }

  // Productos sueltos (no son el plan completo)
  var PRODUCTS = [
    { id: "dormir", g: "Cuerpo", s: "vida", n: "Rutina para dormir", d: "Rutina guiada de 10 minutos para bajar el ritmo antes de dormir.", area: "cuerpo", act: "dormir" },
    { id: "energia", g: "Cuerpo", s: "vida", n: "Energía y movimiento", d: "Pausa de movimiento guiada de 5 minutos, sin gimnasio ni equipamiento.", area: "cuerpo", act: "movimiento" },
    { id: "comidas", g: "Cuerpo", s: "vida", n: "Comidas ordenadas", d: "Organizar horarios y compras. No es una dieta.", area: "cuerpo", soon: true },
    { id: "ansiedad", g: "Mente", s: "vida", n: "Respiración para calmar", d: "Respiración guiada de 3 minutos para bajar la tensión del día. No reemplaza a un profesional.", area: "mente", act: "calma" },
    { id: "foco", g: "Mente", s: "vida", n: "Bloque de foco", d: "Bloque de foco de 25 minutos con intención y cierre.", area: "trabajo", act: "foco" },
    { id: "tiempo", g: "Mente", s: "vida", n: "Tiempo para vos", d: "Espacios para descansar y hacer lo que te gusta.", area: "tiempo", soon: true },
    { id: "cierre", g: "Mente", s: "vida", n: "Cierre del día", d: "Repasá tu día, soltá lo pendiente y dejá armado mañana. 5 minutos guiados.", area: "mente", act: "cierre" },
    { id: "habitos-pro", g: "Orden", s: "vida", n: "Hábitos que se quedan", d: "Método para sostener hábitos en 21 días.", area: "mente", soon: true },
    { id: "casa", g: "Orden", s: "vida", n: "Casa en orden", d: "Rutinas simples para tener la casa al día.", area: "hogar", soon: true },
    { id: "plata", g: "Orden", s: "vida", n: "Plata en orden", d: "Organización de gastos. No es asesoramiento financiero.", area: "plata", soon: true },
    { id: "familia", g: "Orden", s: "vida", n: "Tiempo con los tuyos", d: "Planear momentos con familia y amigos.", area: "relaciones", soon: true },
    { id: "t-pre", g: "Tenis", s: "tenis", n: "Pre y post partido", d: "Rutina antes y después de jugar.", price: "USD 5", was: "USD 7" },
    { id: "t-resp", g: "Tenis", s: "tenis", n: "Respiración y enfoque", d: "Para manejar los nervios antes, durante y después del partido.", price: "USD 4", was: "USD 6" },
    { id: "t-mov", g: "Tenis", s: "tenis", n: "Movilidad", d: "Sesiones cortas para días de descanso o antes de entrenar.", price: "USD 6", was: "USD 8" },
    { id: "t-rut", g: "Tenis", s: "tenis", n: "Rutina física", d: "Plan físico semanal para jugadores.", price: "USD 10", was: "USD 15" }
  ];
  function prodOf(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function inPlan(pid) { return PRODUCTS.filter(function (p) { return p.s === pid; }); }

  // ---------- estado ----------
  var S = load();
  function blank() { return { profile: null, owned: {}, habits: [], demo: false, guest: false, best: 0, mapa: null, focos: [], checks: {}, reviews: [], intencion: "" }; }
  function load() {
    var r = null;
    try { r = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!r) r = blank();
    if (!r.owned) r.owned = {};
    if (!r.habits) r.habits = [];
    if (!r.best) r.best = 0;
    if (!r.checks) r.checks = {};
    if (!r.reviews) r.reviews = [];
    if (!r.focos) r.focos = [];
    if (r.profile && !r.guest && r.guest !== false) r.guest = true;
    if (r.profile && r.guest === undefined) r.guest = true;
    return r;
  }
  if (PRUEBA) { S.demo = !PFREE; }
  var user = null;          // usuario de Supabase (si inició sesión)
  var acct = { username: "" };
  var sync = { state: "off", t: 0 }; // off | ok | pending | error
  var sb = null;
  var pushT = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    if (user && sb) { sync.state = "pending"; clearTimeout(pushT); pushT = setTimeout(push, 900); }
  }
  try { if (NUEVO && !FLUJO && !S.profile) { var qq = new URLSearchParams(location.search); S = blank(); S.profile = { name: "Prueba", email: "", areas: [], sports: [], created: today(), done: true }; S.guest = true; S.demo = qq.get("pro") === "1"; localStorage.setItem(KEY, JSON.stringify(S)); } } catch (e) {}
  try { if (new URLSearchParams(location.search).get("demo") === "1") { S.demo = true; S.guest = true; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} } } catch (e) {}

  function today(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function daysBack(n) { var d = new Date(); d.setDate(d.getDate() - n); return today(d); }
  function anyDone(day) { return S.habits.some(function (h) { return h.days && h.days[day]; }) || !!(S.ad && S.ad[day] && Object.keys(S.ad[day]).length); }
  function weekDates(off) { var d = new Date(), idx = (d.getDay() + 6) % 7, out = []; for (var i = 0; i < 7; i++) { var dt = new Date(); dt.setDate(d.getDate() - idx + i + 7 * (off || 0)); out.push(today(dt)); } return out; }
  function weekCount(off) { return weekDates(off).filter(anyDone).length; }
  function weekStreak() { var n = 0, off = weekCount(0) >= 3 ? 0 : -1; while (n < 520 && weekCount(off) >= 3) { n++; off--; } return n; }
  function habWeek(h, off) { return weekDates(off).filter(function (d) { return h.days[d]; }).length; }
  function daysSince(d) { return Math.floor((Date.now() - new Date(d + "T00:00:00").getTime()) / 864e5); }
  function lightToday() { var c = S.checks && S.checks[today()]; return !!c && (c.energy === 1 || c.mood <= 2); }
  function streakNow() { var n = 0, i = anyDone(today()) ? 0 : 1; while (i < 4000 && anyDone(daysBack(i))) { n++; i++; } return n; }
  function habitStreak(h) { var n = 0, i = h.days[today()] ? 0 : 1; while (i < 4000 && h.days[daysBack(i)]) { n++; i++; } return n; }
  function totalDone() { var n = 0; S.habits.forEach(function (h) { n += Object.keys(h.days || {}).length; }); return n; }
  function activeHabits() { return S.habits.filter(function (h) { return !h.del; }).sort(function (a, b) { var x = a.time || "99:99", y = b.time || "99:99"; return x < y ? -1 : x > y ? 1 : 0; }); }
  function pad(n) { return ("0" + n).slice(-2); }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function touchBest() { var n = streakNow(); if (n > S.best) S.best = n; }

  // permisos
  function hasProduct(id) { return S.demo || !!S.owned[id] || !!S.owned.todo; }
  function isPro(planId) {
    var p = planOf(planId); if (!p) return false;
    if (hasProduct(p.pro)) return true;
    if (planId === "vida") return PLANS.some(function (x) { return x.id !== "vida" && hasProduct(x.pro); });
    return false;
  }
  function owns(p) { return hasProduct(p.id) || isPro(p.s); }
  function habitLimit() { return isPro("vida") ? 9999 : FREE_HABITS; }

  // ---------- helpers ----------
  var tab = "hoy", catFilter = "todos";
  var $app = $("#app");
  var ICON = {
    hoy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    planes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V8l8-5 8 5v11"/><path d="M9 19v-6h6v6"/></svg>',
    catalogo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><circle cx="17" cy="6.8" r="3.7"/><path d="M6.7 14l3.7 7H3z"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="3"/></svg>',
    tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
    perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.3 1.8 2.5C10.5 7 11 4.5 12 2z" fill="currentColor"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };
  function postLead(email, interes) {
    var g = CFG.googleForm;
    if (!g || !email) return Promise.resolve(false);
    var b = new URLSearchParams();
    b.append(g.fields.email, email); b.append(g.fields.interes, interes);
    b.append(g.fields.origen, "app"); b.append(g.fields.pagina, "/miforma");
    return fetch(g.action, { method: "POST", mode: "no-cors", body: b }).then(function () { return true; }, function () { return false; });
  }
  function toggleIn(arr, v) { var i = arr.indexOf(v); if (i < 0) arr.push(v); else arr.splice(i, 1); }
  function fieldCss() { return "width:100%;padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surf)"; }

  // ---------- cuentas y sincronización ----------
  function initSb() {
    if (NUEVO) { sb = null; return; }
    try {
      if (window.supabase && CFG.supabase && CFG.supabase.url && CFG.supabase.key) {
        sb = window.supabase.createClient(CFG.supabase.url, CFG.supabase.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      }
    } catch (e) { sb = null; }
  }
  function authMsg(err) {
    var m = String((err && err.message) || err || "");
    if (/already registered|already been registered/i.test(m)) return "Ese email ya tiene una cuenta. Probá iniciar sesión.";
    if (/invalid login/i.test(m)) return "Email o contraseña incorrectos.";
    if (/not confirmed/i.test(m)) return "Falta confirmar tu email. Revisá tu casilla.";
    if (/rate limit|too many|seconds/i.test(m)) return "Demasiados intentos. Probá de nuevo en unos minutos.";
    if (/password/i.test(m) && /(short|least|characters|weak)/i.test(m)) return "La contraseña tiene que tener al menos 8 caracteres.";
    if (/database error|saving new user|username/i.test(m)) return "Ese nombre de usuario ya está en uso. Elegí otro.";
    if (/fetch|network/i.test(m)) return "No hay conexión. Revisá tu internet.";
    return "No pudimos completar la acción. Probá de nuevo.";
  }
  var EXTRA = ["mapa", "focos", "day", "notes", "checks", "reviews", "intencion", "arm", "ad", "wins", "todo", "comp", "bn", "actn", "cierre", "cierreL", "wk", "tm", "prog", "test", "dd", "cierreAt", "xt", "rem", "goal"];
  function mergeStates(local, remote) {
    var out = { profile: remote.profile || local.profile || null, habits: [], best: Math.max(local.best || 0, remote.best || 0) };
    var map = {};
    function clone(h) { return Object.assign({}, h, { days: Object.assign({}, h.days || {}) }); }
    (remote.habits || []).forEach(function (h) { map[h.id] = clone(h); });
    (local.habits || []).forEach(function (h) {
      var m = map[h.id];
      if (!m) map[h.id] = clone(h);
      else { var days = Object.assign({}, m.days, h.days || {}), del = m.del || h.del; Object.assign(m, h); m.days = days; m.del = !!del; }
    });
    Object.keys(map).forEach(function (k) { out.habits.push(map[k]); });
    out.mapa = local.mapa || remote.mapa || null; out.day = local.day || remote.day || null;
    out.focos = (local.focos && local.focos.length) ? local.focos : (remote.focos || []);
    out.intencion = local.intencion || remote.intencion || "";
    out.arm = (local.arm && remote.arm) ? ((local.arm.at || "") >= (remote.arm.at || "") ? local.arm : remote.arm) : (local.arm || remote.arm || null);
    out.ad = Object.assign({}, remote.ad || {});
    Object.keys(local.ad || {}).forEach(function (k) { out.ad[k] = Object.assign({}, out.ad[k] || {}, local.ad[k]); });
    out.wins = Object.assign({}, remote.wins || {}, local.wins || {});
    out.actn = Math.max(local.actn || 0, remote.actn || 0); out.cierre = Object.assign({}, remote.cierre || {}, local.cierre || {}); out.cierreL = Object.assign({}, remote.cierreL || {}, local.cierreL || {});
    out.comp = Object.assign({}, remote.comp || {}, local.comp || {}); out.bn = Object.assign({}, remote.bn || {}, local.bn || {});
    var tmap = {}; (remote.todo || []).concat(local.todo || []).forEach(function (x) { tmap[x.id] = x; }); out.todo = Object.keys(tmap).map(function (k) { return tmap[k]; });
    out.dd = Object.assign({}, remote.dd || {}); Object.keys(local.dd || {}).forEach(function (k) { var r = out.dd[k], l = local.dd[k]; if (!r || (l && (l.at || "") >= (r.at || ""))) out.dd[k] = l; });
    var xm = {}; (remote.xt || []).forEach(function (x) { xm[x.id] = x; }); (local.xt || []).forEach(function (x) { var r = xm[x.id]; if (!r || (x.at || "") >= (r.at || "")) xm[x.id] = x; }); out.xt = Object.keys(xm).map(function (k) { return xm[k]; });
    out.rem = local.rem || remote.rem || null; out.goal = local.goal || remote.goal || null;
    out.cierreAt = local.cierreAt != null ? local.cierreAt : remote.cierreAt;
    out.wk = Object.assign({}, remote.wk || {}); Object.keys(local.wk || {}).forEach(function (k) { var r = out.wk[k], l = local.wk[k]; if (!r || (l && (l.at || "") >= (r.at || ""))) out.wk[k] = l; });
    out.tm = Object.assign({}, remote.tm || {}, local.tm || {});
    out.test = local.test || remote.test || null;
    (function () {
      var r = remote.prog || { items: {} }, l = local.prog || { items: {} }, it = {};
      Object.keys(Object.assign({}, r.items, l.items)).forEach(function (id) {
        var a = (r.items || {})[id] || {}, b = (l.items || {})[id] || {};
        it[id] = { start: [a.start, b.start].filter(Boolean).sort()[0] || null, before: b.before || a.before || null, after: b.after || a.after || null, why: b.why || a.why || "", at: b.at || a.at || "", done: Object.assign({}, a.done || {}, b.done || {}), last: [a.last, b.last].filter(Boolean).sort().pop() || null, lg: Object.assign({}, a.lg || {}, b.lg || {}), fl: Object.assign({}, a.fl || {}, b.fl || {}), dr: b.dr || a.dr || {}, st: b.st || a.st || null };
      });
      out.prog = { cur: local.prog && local.prog.cur !== undefined ? local.prog.cur : r.cur || null, items: it };
    })();
    out.notes = Object.assign({}, remote.notes || {}, local.notes || {});
    out.checks = Object.assign({}, remote.checks || {}, local.checks || {});
    var seen = {}, rv = [];
    (remote.reviews || []).concat(local.reviews || []).forEach(function (r) { if (!seen[r.at]) { seen[r.at] = 1; rv.push(r); } });
    out.reviews = rv;
    return out;
  }
  function pushableState() { var o = { profile: S.profile, habits: S.habits, best: S.best }; EXTRA.forEach(function (k) { o[k] = S[k] === undefined ? null : S[k]; }); return o; }
  function push() {
    if (!user || !sb) return Promise.resolve();
    return sb.from("user_state").upsert({ user_id: user.id, state: pushableState(), updated_at: new Date().toISOString() }).then(function (r) {
      sync.state = r.error ? "error" : "ok"; sync.t = Date.now(); if (tab === "perfil" && !$("#sheet")) render();
    }, function () { sync.state = "error"; });
  }
  function loadRemote() {
    if (!user || !sb) return Promise.resolve();
    return Promise.all([
      sb.from("user_state").select("state").maybeSingle(),
      sb.from("profiles").select("username,display_name").maybeSingle(),
      sb.rpc("my_purchases")
    ]).then(function (res) {
      var st = res[0], pr = res[1], pu = res[2];
      if (pr && pr.data) acct.username = pr.data.username || "";
      if (pu && pu.data) { var o = {}; pu.data.forEach(function (r) { o[r.product_id] = 1; }); S.owned = o; }
      var remote = (st && st.data && st.data.state) || null;
      var local = pushableState();
      var m = remote ? mergeStates(local, remote) : local;
      S.profile = m.profile; S.habits = m.habits; S.best = m.best; EXTRA.forEach(function (k) { if (m[k] !== undefined) S[k] = m[k]; }); S.guest = false;
      if (S.profile && pr && pr.data && !S.profile.username) S.profile.username = pr.data.username;
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
      sync.state = "pending";
      return push();
    });
  }
  function onSession(session) {
    user = session && session.user ? session.user : null;
    if (!user) { sync.state = "off"; return Promise.resolve(); }
    return loadRemote().then(function () { render(); }, function () { sync.state = "error"; render(); });
  }

  // ---------- render ----------
  var mode = "register";   // register | login | forgot | recovery
  var draft = { name: "", username: "", email: "", areas: [], sports: [], news: true, terms: false };
  function needAuth() { return !user && !S.guest && (PRUEBA || !S.demo); }
  function render() {
    if (mode === "recovery") return renderRecovery();
    if (needAuth()) return renderAuth();
    if (!S.profile || S.profile.done === false) {
      var nm0 = ((S.profile && S.profile.name) || draft.name || "").trim();
      if (user || nm0) { S.profile = Object.assign({ name: nm0, email: (user && user.email) || "", areas: [], sports: [], created: today() }, S.profile || {}, { done: true }); if (!S.profile.name) S.profile.name = nm0; save(); }
      else return renderOnboard();
    }
    touchBest();
    if (tab === "catalogo") tab = "planes";
    var body = { hoy: vHoy, tools: vTools, planes: vPlanes, perfil: vPerfil }[tab]();
    var n = weekCount(0), topPro = isPro("vida") || PLANS.some(function (p) { return isPro(p.id); });
    $app.innerHTML =
      '<div class="top"><div class="logo">'+LMARK+'forma<i></i></div><div class="row" style="gap:8px">' +
      (S.demo ? '<span class="tag">modo prueba</span>' : "") +
      '<span class="plan-chip' + (topPro ? " pro" : "") + '">' + (topPro ? "Pro" : "Gratis") + "</span>" +
      (topPro ? '<span class="flame-chip' + (n ? " on" : "") + '" title="Días con algo hecho esta semana">' + ICON.flame + "<b>" + n + "/7</b></span>" : "") + "</div></div>" +
      "<main>" + body + "</main>" +
      '<nav class="tabs" aria-label="Principal"><div>' +
      [["hoy", "Hoy"], ["tools", "Herramientas"], ["planes", "Planes"], ["perfil", "Perfil"]].map(function (t) {
        return '<button data-tab="' + t[0] + '"' + (tab === t[0] ? ' aria-current="page"' : "") + ">" + ICON[t[0]] + "<span>" + t[1] + "</span></button>";
      }).join("") + "</div></nav>";
  }

  // --- acceso: crear cuenta / iniciar sesión / probar sin cuenta ---
  function renderAuth() {
    var reg = mode === "register", forgot = mode === "forgot";
    var html = '<div class="top"><div class="logo">'+LMARK+'forma<i></i></div></div><main class="stack">' +
      (reg ? '<div class="bigmark">' + LMARK + '</div><p class="welk">Bienvenido</p>' : "") + '<h1 class="hello" style="font-size:32px">' + (forgot ? "Recuperar tu contraseña" : reg ? "Dale forma a la vida que querés" : "Qué bueno verte de nuevo") + "</h1>" + (reg ? '<span class="freepill">Gratis</span>' : "");
    if (!sb && !FLUJO) html += '<div class="card small">Las cuentas no están disponibles ahora. Podés usar la app en este dispositivo sin cuenta.</div>';
    if ((sb || FLUJO) && !forgot) {
      html += '<div class="seg" role="tablist"><button data-mode="register" aria-pressed="' + reg + '">Crear cuenta</button><button data-mode="login" aria-pressed="' + !reg + '">Ya tengo cuenta</button></div>';
    }
    if (sb || FLUJO) {
      if (forgot) {
        html += '<p class="muted small">Escribí tu email y te mandamos un link para elegir una contraseña nueva.</p>' +
          '<label class="field"><span>Email</span><input id="a-email" type="email" autocomplete="email" value="' + esc(draft.email) + '"></label>' +
          '<button class="btn block" id="a-forgot">Enviar link</button><button class="btn ghost block" data-mode="login">Volver</button>';
      } else if (reg) {
        html += '<label class="field"><span>¿Cómo te llamás?</span><input id="a-name" autocomplete="given-name" maxlength="40" value="' + esc(draft.name) + '"></label>' +
          '<label class="field"><span>Nombre de usuario <small class="muted" style="font-weight:400">(único; podés cambiarlo)</small></span><input id="a-user" autocomplete="username" autocapitalize="none" maxlength="21" placeholder="te proponemos uno" value="' + esc(draft.username) + '"></label>' +
          '<label class="field"><span>Email</span><input id="a-email" type="email" autocomplete="email" value="' + esc(draft.email) + '"></label>' +
          '<label class="field"><span>Contraseña (mínimo 8 caracteres)</span><input id="a-pass" type="password" autocomplete="new-password"></label>' +
          '<label class="row small"><input id="a-terms" type="checkbox" ' + (draft.terms ? "checked" : "") + '> <span>Acepto los <a href="terminos" target="_blank" rel="noopener">términos</a> y la <a href="privacidad" target="_blank" rel="noopener">política de privacidad</a>.</span></label>' +
          '<button class="btn block" id="a-register">Crear mi cuenta</button>';
      } else {
        html += '<label class="field"><span>Email</span><input id="a-email" type="email" autocomplete="email" value="' + esc(draft.email) + '"></label>' +
          '<label class="field"><span>Contraseña</span><input id="a-pass" type="password" autocomplete="current-password"></label>' +
          '<button class="btn block" id="a-login">Entrar</button>' +
          '<button class="btn ghost block" data-mode="forgot">Olvidé mi contraseña</button>';
      }
      html += '<div class="msg" id="amsg" role="status"></div>';
    }
    if (!forgot) html += '<div class="sep"><span>o</span></div><button class="btn ghost block" id="a-guest">Probar sin cuenta</button><p class="small muted">Sin cuenta, todo queda solo en este dispositivo y no podés guardar compras.</p>';
    $app.innerHTML = html + "</main>";
  }
  function renderRecovery() {
    $app.innerHTML = '<div class="top"><div class="logo">'+LMARK+'forma<i></i></div></div><main class="stack"><h1 class="hello" style="font-size:30px">Elegí una contraseña nueva</h1>' +
      '<label class="field"><span>Contraseña nueva (mínimo 8 caracteres)</span><input id="r-pass" type="password" autocomplete="new-password"></label>' +
      '<button class="btn block" id="r-save">Guardar contraseña</button><div class="msg" id="amsg" role="status"></div></main>';
  }

  // --- personalizar (primer ingreso) ---
  function renderOnboard() {
    $app.innerHTML =
      '<div class="top"><div class="logo">'+LMARK+'forma<i></i></div></div><main class="stack">' +
      '<h1 class="hello" style="font-size:30px">¿Cómo te llamás?</h1><p class="muted">Después armamos tu día en 2 minutos.</p>' +
      '<label class="field"><span>Tu nombre</span><input id="f-name" autocomplete="given-name" maxlength="40" value="' + esc(draft.name) + '"></label>' +
      '<button class="btn block" id="create">Empezar</button><div class="msg" id="wmsg"></div></main>';
  }

  // --- Hoy: racha + hábitos ---
  var DOW = ["L", "M", "M", "J", "V", "S", "D"];
  function weekStrip() {
    var d = new Date(), idx = (d.getDay() + 6) % 7, html = '<div class="week">';
    for (var i = 0; i < 7; i++) {
      var dt = new Date(); dt.setDate(d.getDate() - idx + i);
      var key = today(dt), done = anyDone(key), isToday = i === idx;
      html += '<div class="wd' + (done ? " done" : "") + (isToday ? " now" : "") + '"><span>' + DOW[i] + '</span><i>' + (done ? ICON.ok : "") + "</i></div>";
    }
    return html + "</div>";
  }
  function dayOfYear(dt) { dt = dt || new Date(); return Math.floor((new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) - new Date(dt.getFullYear(), 0, 0)) / 864e5); }
  function quoteOfDay(dt) {
    var a = window.FRASES; if (!a || !a.length) return "";
    dt = dt || new Date();
    return a[(dayOfYear(dt) * 11 + (dt.getFullYear() - 2026) * 53) % a.length];
  }
  function quoteCard() {
    var q = quoteOfDay(); if (!q) return "";
    return '<div class="quote"><span class="small muted">Frase del día</span><p>' + esc(q) + '</p><div class="row between"><button class="btn ghost sm" id="qimg">Guardar como imagen</button><span class="small muted">Usala de fondo de pantalla</span></div></div>';
  }
  function quoteImage() {
    var q = quoteOfDay(), W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var go = function () {
      var c = cv.getContext("2d");
      c.fillStyle = "#F5F1E8"; c.fillRect(0, 0, W, H);
      c.textBaseline = "alphabetic";
      c.fillStyle = "#111"; c.font = "800 110px Montserrat, Inter, sans-serif"; c.fillText("forma", 90, 230);
      var wd = c.measureText("forma").width; c.fillStyle = "#86A892"; c.beginPath(); c.arc(90 + wd + 26, 218, 15, 0, 7); c.fill();
      // frase
      c.fillStyle = "#111"; c.font = "800 72px Montserrat, Inter, sans-serif";
      var words = q.split(" "), lines = [], cur = "";
      words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (c.measureText(t).width > 880 && cur) { lines.push(cur); cur = w; } else cur = t; });
      lines.push(cur);
      var lh = 100, y0 = (H - lines.length * lh) / 2 + 40;
      lines.forEach(function (l, i) { c.fillText(l, 90, y0 + i * lh); });
      // formas
      var cols = ["#C6F432", "#FFC83D", "#B9A7F0", "#4C7DFF", "#FF8A4C"], bx = 90, by = H - 330, s = 90;
      c.fillStyle = cols[0]; c.beginPath(); c.arc(bx + s / 2, by + s / 2, s / 2, 0, 7); c.fill();
      c.fillStyle = cols[1]; c.fillRect(bx + 130, by, s, s);
      c.fillStyle = cols[2]; c.beginPath(); c.arc(bx + 260 + s / 2, by + s, s / 2, Math.PI, 0); c.fill();
      c.fillStyle = cols[3]; c.beginPath(); c.moveTo(bx + 390, by + s); c.arc(bx + 390, by + s, s, -Math.PI / 2, 0, false); c.closePath(); c.fill();
      c.fillStyle = cols[4]; c.beginPath(); c.moveTo(bx + 520 + s / 2, by); c.lineTo(bx + 520 + s, by + s); c.lineTo(bx + 520, by + s); c.closePath(); c.fill();
      c.fillStyle = "#6b675e"; c.font = "600 40px Inter, sans-serif";
      c.fillText("Frase del día · " + new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long" }), 90, H - 190);
      c.fillText("formargentina.com", 90, H - 130);
      cv.toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], "forma-frase-del-dia.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) { navigator.share({ files: [file], title: "Forma" }).catch(function () {}); return; }
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "forma-frase-del-dia.png"; a.click();
      }, "image/png");
    };
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("800 72px Montserrat"), document.fonts.load("600 40px Inter")]).then(go, go); else go();
  }
  var ci = { mood: 0, energy: 0 };
  function checkinCard() {
    var t = today(), c = S.checks[t];
    if (c) {
      var msg = lightToday() ? '<div class="card sage"><b>Hoy puede ser un día liviano</b><p class="small" style="margin:6px 0 10px">No hace falta hacer todo. Alcanza con las versiones mínimas de tus hábitos. Si querés, un minuto de respiración ayuda.</p><button class="btn" data-act="respirar">Respirar 1 minuto</button></div>' : (c.mood >= 4 && c.energy === 3 ? '<p class="small muted" style="margin:0 0 10px">Buen momento para avanzar en lo que más te importa.</p>' : "");
      return '<div class="row between small" style="margin:0 0 10px"><span class="muted">Hoy: <b>' + MOODS[c.mood - 1] + "</b> · energía <b>" + ENERGY[c.energy - 1].toLowerCase() + '</b></span><button class="linkbtn" id="recheck">Cambiar</button></div>' + msg;
    }
    return '<div class="card"><b>¿Cómo estás hoy?</b><div class="chips" style="margin:10px 0">' + MOODS.map(function (m, i) { return '<button class="chip" data-mood="' + (i + 1) + '" aria-pressed="' + (ci.mood === i + 1) + '">' + m + "</button>"; }).join("") + '</div><span class="small" style="font-weight:600">¿Y la energía?</span><div class="chips" style="margin-top:8px">' + ENERGY.map(function (m, i) { return '<button class="chip" data-energy="' + (i + 1) + '" aria-pressed="' + (ci.energy === i + 1) + '">' + m + "</button>"; }).join("") + '</div><p class="small muted" style="margin:10px 0 0">Es para conocerte mejor, no un test médico. Con eso el día se adapta a vos.</p></div>';
  }
  function reviewDue() {
    if (!S.mapa) return false;
    var last = S.reviews.length ? S.reviews[S.reviews.length - 1].at : S.mapa.at;
    return daysSince(last) >= 6;
  }
  function reviewCard() {
    if (!reviewDue()) return "";
    if (S.demo || isPro("vida")) return '<div class="card sage"><b>Es momento de tu revisión semanal</b><p class="small" style="margin:6px 0 12px">10 minutos para ver qué funcionó, soltar lo que no y ajustar tu ritmo.</p><button class="btn" id="review">Hacer mi revisión</button></div>';
    return '<div class="card"><b>Revisión semanal (Pro)</b><p class="small muted" style="margin:6px 0 10px">Cada semana ves qué funcionó, qué soltar y cómo ajustar tu ritmo, con tu progreso a la vista.</p><button class="btn ghost" data-plan="vida">Ver Vida diaria Pro</button></div>';
  }
  function vArmar() {
    var nm = (S.profile && S.profile.name) || "";
    return '<div class="armhero"><span class="badge">Bienvenido a Forma</span><h1>' + (nm ? "Hola, " + esc(nm) + "." : "Hola.") + '</h1>' +
      '<ol class="armsteps"><li><b>Contanos cómo es tu día hoy</b><span>12 preguntas, unos 2 minutos.</span></li><li><b>Contanos qué querés lograr</b><span>Dormir mejor, estudiar, estar más tranquilo…</span></li><li><b>Armamos tu día para lograrlo</b><span>Con cambios de a poco, para que se sostengan.</span></li></ol>' +
      '<button class="btn sage block" id="armgo">Armar mi día</button><p class="small muted" style="text-align:center;margin:4px 0 0">' + (PRUEBA ? "Versión de prueba: tus datos quedan solo en este celular." : "Es gratis y tu día queda siempre acá, en Hoy.") + '</p></div>';
  }
  function vHoy() {
    if (!S.arm) return vArmar();
    if (S.demo || isPro("vida")) return vHoyPro();
    var d = new Date(), hr = d.getHours(), greet = hr < 6 ? "Buenas noches" : hr < 13 ? "Buen día" : hr < 20 ? "Buenas tardes" : "Buenas noches";
    var dateStr = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }); dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    return '<p class="muted small" style="margin:0">' + esc(dateStr) + "</p><h1 class=\"hello\">" + greet + ", " + esc(S.profile.name) + "</h1>" + (armBlocks().length ? viewToggle() + (viewMode() === "now" ? nowSection() + compCard() : armSection()) : armSection()) +
      (armBlocks().length ? testCard() : "") + (armBlocks().length ? '<div class="card dark" style="margin-top:14px"><b>Hacé tu día tuyo con Pro</b><ul class="ticks" style="margin:8px 0 12px"><li>Tildar lo que vas haciendo y ver tu constancia</li><li>Armar tu semana con días distintos</li><li>Programas de 14 días: dormir, celular, foco y calma</li><li>Cambiar tu día cuando cambie tu vida</li><li>Avisos en el calendario de tu celular</li><li>Actividades guiadas dentro de tu día</li><li>Lo que hiciste bien hoy y tus pendientes</li></ul><button class="btn sage block" data-plan="vida">Ver Vida diaria Pro</button></div>' : "");
  }
  function vHoyPro() {
    var t = today(), hs = activeHabits().filter(function (h) { return !h.paused; }), done = hs.filter(function (h) { return h.days[t]; }).length;
    var pct = hs.length ? Math.round(done * 100 / hs.length) : 0, wc = weekCount(0), ws = weekStreak(), light = lightToday();
    var d = new Date(), hr = d.getHours();
    var greet = hr < 6 ? "Buenas noches" : hr < 13 ? "Buen día" : hr < 20 ? "Buenas tardes" : "Buenas noches";
    var dateStr = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }); dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    var head = wc === 0 ? "Esta semana todavía no sumaste nada. Con una cosa chica alcanza." : wc < 3 ? "Vas sumando. Tres días en la semana ya es una gran constancia." : "¡Muy buena semana! Así se construye el orden.";
    var gr = '<p class="muted small" style="margin:0">' + esc(dateStr) + "</p>" + '<h1 class="hello">' + greet + ", " + esc(S.profile.name) + "</h1>";
    var html = gr +
      '<div class="card dark streakcard"><div class="row between"><div class="row"><span class="bigflame' + (wc ? " on" : "") + '">' + ICON.flame + "</span><div><b style='font-size:30px;line-height:1'>" + wc + "<span style='font-size:18px;opacity:.7'>/7</span></b><div class='small' style='opacity:.85'>días con algo hecho esta semana</div></div></div>" +
      '<div class="ring" style="--p:' + pct + '"><b>' + pct + "%</b></div></div>" + weekStrip() + '<div class="small" style="opacity:.85;margin-top:6px">' + head + (ws ? " · " + ws + (ws === 1 ? " semana" : " semanas") + " seguidas con 3+ días" : "") + "</div></div>";
    if (S.intencion) html += '<div class="card small"><span class="muted">Tu intención de la semana</span><br><b>' + esc(S.intencion) + "</b></div>";
    html += goalCard() + reviewCard() + "@@ARM@@";
    html += reminderCard() + cierreCard() + mananaCard();
    if (armBlocks().length) {
      if (viewMode() === "now") {
        return gr + viewToggle() + nowSection() + prioCard() + goalCard(true) + weekSumCard() + cierreCard() + mananaCard() + reviewCard() + weekCard();
      }
      return html.replace("@@ARM@@", viewToggle() + prioCard() + weekCard() + armSection());
    }
    return html.replace("@@ARM@@", armSection());
  }

  // --- Planes (como los cursos) ---
  function recIds() { return ((S.test && S.test.rec) || []).map(function (r) { return r.id; }); }
  function planCard(p) {
    var pro = p.live ? (p.prog ? pgOwns(p.id) : isPro(p.id)) : false, rec = recIds().indexOf(p.id) >= 0, items = inPlan(p.id), got = items.filter(owns).length;
    var tag = !p.live ? '<span class="tag">Próximamente</span>' : pro ? '<span class="tag ok">Activo</span>' : rec ? '<span class="tag rec">Para vos</span>' : p.inc ? '<span class="tag">Incluido en Pro</span>' : "";
    var sub = !p.live ? esc(p.d) : (p.prog ? esc(p.d) : (items.length ? got + " de " + items.length + " productos desbloqueados" : esc(p.d)));
    return '<button class="plancard" data-plan="' + p.id + '" style="--c:' + p.c + '"><span class="shape">' + SHAPES[p.id] + "</span><span style='flex:1;min-width:0'><b>" + esc(p.n) + "</b><small>" + sub + "</small>" +
      (p.live && !p.prog && items.length ? '<span class="bar"><i style="width:' + Math.round(got * 100 / items.length) + '%"></i></span>' : "") + "</span>" + tag + "</button>";
  }
  function vPlanes() {
    var rec = recIds(), head = "";
    if (rec.length) head = '<div class="sec">Para vos</div>' + rec.map(function (id) { return planCard(planOf(id)); }).join("") + '<button class="linkbtn small" data-open="test" style="margin:4px 0 8px">Rehacer el test</button>';
    else head = '<div class="card testcta"><b>¿Qué querés lograr?</b><p class="small muted" style="margin:6px 0 12px">Contanos tu objetivo y te mostramos los planes que van con eso. Gratis.</p><button class="btn sage" data-open="test">Elegir mi objetivo</button></div>';
    var GR = ["Vida diaria", "Estudio y trabajo", "Deportes", "Servicios extras"], out = "";
    GR.forEach(function (g) {
      var L = PLANS.filter(function (p) { return p.grp === g && rec.indexOf(p.id) < 0; }).sort(function (a, b) { return (b.live ? 1 : 0) - (a.live ? 1 : 0); });
      if (L.length) out += '<div class="sec">' + g + "</div>" + (g === "Vida diaria" ? '<p class="small muted" style="margin:0 0 8px">Los planes de todos los días vienen incluidos en Vida diaria Pro.</p>' : g === "Servicios extras" ? '<p class="small muted" style="margin:0 0 8px">Cosas puntuales que se piden aparte.</p>' : "") + L.map(planCard).join("");
    });
    return "<h1 class='hello'>Planes</h1><p class='muted small'>Cada plan te ayuda con algo concreto, con un programa de 14 días dentro de la app.</p>" + head + out;
  }
  function openPlan(id) {
    var p = planOf(id); if (!p) return;
    var pro = p.prog ? pgOwns(id) : isPro(id), pp = p.inc ? planOf("vida") : p, h = '<div class="row"><span class="shape">' + SHAPES[p.id] + '</span><div><h2 style="font-size:24px">' + esc(p.n) + '</h2><span class="small muted">' + (!p.live ? "Próximamente" : pro ? "Plan activo" : p.inc ? "Incluido en Vida diaria Pro" : "Plan completo (Pro)") + "</span></div></div><p style='margin:14px 0'>" + esc(p.d) + "</p>";
    if (!p.live) {
      h += '<div class="card"><b>Todavía no está disponible</b><p class="small muted" style="margin:6px 0 0">Dejá tu email y te avisamos cuando abra.</p></div>' + notifyForm(p.n, S.profile && S.profile.email);
    } else {
      h += '<div class="cols"><div class="card"><b>Gratis</b><ul class="ticks">' + p.free.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="card pro"><b>Pro</b><ul class="ticks">' + p.pros.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></div>";
      if (p.prog) h += pgOwns(id) ? '<button class="btn block" data-pgopen="' + id + '" style="margin-top:12px">Abrir mi programa</button>' : '<button class="btn sage block" data-pgtry="' + id + '" style="margin-top:12px">Probar el paso 1 gratis</button>';
      if (toolsOf(id).length) h += '<div class="sec" style="margin-top:10px">Herramientas del plan</div>' + toolsOf(id).map(toolRow).join("");
      var items = inPlan(id);
      if (items.length) h += '<div class="sec" style="margin-top:6px">Productos del plan</div>' + items.map(prodRow).join("");
      if (pro) h += '<div class="card"><b>Tenés este plan.</b><p class="small muted" style="margin:6px 0 0">Todo lo del plan es tuyo, incluidos los productos que se sumen.</p></div>';
      else h += (p.inc ? '<p class="small muted" style="margin:12px 0 0">Este plan viene incluido en Vida diaria Pro, junto con los otros planes de todos los días.</p>' : "") + '<div class="card dark" style="margin-top:12px"><div class="row between"><b>Forma ' + esc(pp.n) + " Pro</b>" + (pp.price ? "<span><b style='font-size:22px'>" + esc(pp.price) + "</b>" + (pp.was ? " <s class='small' style='opacity:.7'>" + esc(pp.was) + "</s>" : "") + "</span>" : "<span class='small'>Precio a definir</span>") + "</div>" +
        (pp.promo ? "<p class='small' style='margin:6px 0 0;opacity:.85'>" + esc(pp.promo) + ".</p>" : "") + "</div>" + payButtons(pp.pro, "Forma " + pp.n + " Pro");
    }
    sheet(h + '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }

  // --- Catálogo (productos sueltos) ---
  function prodRow(p) {
    var ok = owns(p), viaPro = ok && !hasProduct(p.id) && isPro(p.s);
    var tag = ok ? (viaPro ? "Incluido en Pro" : "Tuyo") : (p.soon ? "Pronto" : (p.price || "Disponible"));
    return '<button class="prod" data-prod="' + p.id + '"><span class="shape">' + SHAPES[p.s] + "</span><span style='flex:1;min-width:0'><b>" + esc(p.n) + "</b><small>" + esc(p.d) + '</small></span><span class="tag' + (ok ? " ok" : "") + '">' + esc(tag) + "</span></button>";
  }
  function vCatalogo() {
    var html = "<h1 class='hello'>Catálogo</h1>" +
      "<div class='card small'><b>Productos sueltos.</b> Comprás solo lo que necesitás y es tuyo para siempre. Si querés todo de una sección, el <button class='linkbtn' data-tab='planes'>plan Pro</button> sale mejor.</div>" +
      '<div class="chips" style="margin:14px 0">' + [["todos", "Todos"]].concat(PLANS.filter(function (p) { return inPlan(p.id).length; }).map(function (p) { return [p.id, p.n]; })).map(function (c) {
        return '<button class="chip" data-cat="' + c[0] + '" aria-pressed="' + (catFilter === c[0]) + '">' + esc(c[1]) + "</button>";
      }).join("") + "</div>";
    PLANS.forEach(function (p) {
      var items = inPlan(p.id); if (!items.length || (catFilter !== "todos" && catFilter !== p.id)) return;
      html += '<div class="sec">' + esc(p.n) + " · productos sueltos</div>";
      if (p.id === "vida") {
        ["Cuerpo", "Mente", "Orden"].forEach(function (g) { html += '<div class="subsec">' + g + "</div>" + items.filter(function (x) { return x.g === g; }).map(prodRow).join(""); });
      } else html += items.map(prodRow).join("");
    });
    html += '<div class="sec">Gratis</div>' +
      '<button class="prod" data-open="organizar"><span class="shape">' + SHAPES.vida + '</span><span style="flex:1"><b>Organizá tu día</b><small>Tu día en bloques con horarios</small></span><span class="tag ok">Gratis</span></button>' +
      '<button class="prod" data-open="respirar"><span class="shape">' + SHAPES.tenis + '</span><span style="flex:1"><b>Respirar 1 minuto</b><small>Pausa guiada</small></span><span class="tag ok">Gratis</span></button>';
    return html;
  }

  // --- Perfil ---
  function progressCard() {
    if (!S.mapa) return '<div class="card"><b>Tu mapa de vida</b><p class="small muted" style="margin:6px 0 10px">Todavía no lo armaste. Es el punto de partida de todo.</p><button class="btn sage" id="mapa">Armar mi mapa</button></div>';
    var first = (S.mapa.h && S.mapa.h[0] && S.mapa.h[0].scores) || S.mapa.scores, now = S.mapa.scores, last7 = [];
    weekDates(0).concat(weekDates(-1)).forEach(function (d) { if (S.checks[d]) last7.push(S.checks[d]); });
    var avg = function (k) { return last7.length ? (last7.reduce(function (a, c) { return a + c[k]; }, 0) / last7.length) : 0; };
    return '<div class="card"><b>Tu mapa de vida</b>' + (S.mapa.vida ? '<p class="small muted" style="margin:6px 0 0">“' + esc(S.mapa.vida) + "”</p>" : "") + '<div style="margin-top:10px">' + AREAS.map(function (a) {
      var f = first[a[0]] || 0, n = now[a[0]] || 0, up = n - f;
      return '<div class="prog"><span class="small">' + esc(a[1]) + '</span><span class="track"><i class="was" style="width:' + f * 20 + '%"></i><i class="now" style="width:' + n * 20 + '%"></i></span><span class="small muted">' + n + (up ? " (" + (up > 0 ? "+" : "") + up + ")" : "") + "</span></div>";
    }).join("") + '</div><p class="small muted" style="margin:8px 0 10px">Barra clara: cómo empezaste. Barra verde: cómo estás hoy.</p>' +
      (last7.length ? '<p class="small" style="margin:0 0 10px">Últimos 14 días: ánimo promedio <b>' + avg("mood").toFixed(1) + "/5</b> · energía <b>" + avg("energy").toFixed(1) + "/3</b></p>" : "") + '<button class="btn ghost" id="mapa">Rehacer mi mapa</button></div>';
  }
  function vPerfil() {
    var p = S.profile, initial = (p.name || "?").charAt(0).toUpperCase();
    var syncTxt = user ? (sync.state === "ok" ? "Sincronizado" : sync.state === "pending" ? "Sincronizando..." : sync.state === "error" ? "Sin sincronizar (se reintenta al cambiar algo)" : "Conectado") : "";
    var html = "<h1 class='hello'>Tu perfil</h1>" +
      '<div class="card row"><span class="avatar">' + esc(initial) + '</span><div style="min-width:0"><b style="font-size:20px">' + esc(p.name) + "</b><div class='small muted'>" + (acct.username ? "@" + esc(acct.username) : "Sin cuenta") + (p.created ? " · desde " + esc(p.created) : "") + "</div></div></div>" +
      '<div class="grid3"><div class="card stat"><b>' + weekCount(0) + '</b><span>días esta semana</span></div><div class="card stat"><b>' + weekStreak() + '</b><span>semanas con 3+ días</span></div><div class="card stat"><b>' + totalDone() + '</b><span>hábitos hechos</span></div></div>' +
      levelCard() + themeCard() + progressCard() +
      '<div class="card"><b>Tus planes</b><div style="margin-top:8px">' + PLANS.filter(function (x) { return x.live; }).map(function (x) {
        return '<div class="row between" style="padding:6px 0"><span class="row"><span class="shape" style="width:26px;height:26px">' + SHAPES[x.id] + "</span>" + esc(x.n) + '</span><span class="tag' + (isPro(x.id) ? " ok" : "") + '">' + (isPro(x.id) ? "Pro" : "Gratis") + "</span></div>";
      }).join("") + "</div></div>";
    if (PRUEBA) html += '<div class="card"><b>Versión de prueba ' + esc(BUILD) + '</b><p class="small muted" style="margin:6px 0 10px">Tus datos quedan solo en este celular. Usá el botón Comentarios (a la derecha) cuando algo no te cierre.</p><button class="btn ghost sm" data-fbreset>Empezar de cero</button></div>';
    html += '<div class="card stack"><b>Tu cuenta</b>' +
      (user ? '<div class="small muted">' + esc(user.email || "") + " · " + esc(syncTxt) + "</div>" : '<p class="small muted" style="margin:0">Estás usando la app sin cuenta: tus datos están solo en este dispositivo y no podés guardar compras.</p><button class="btn sage block" id="mkacct">Crear cuenta o iniciar sesión</button>') +
      '<label class="field"><span>Nombre</span><input id="p-name" value="' + esc(p.name) + '" maxlength="40"></label>' +
      '<div><span class="small" style="font-weight:600">Deportes</span><div class="chips" style="margin-top:8px">' +
      SPORTS.map(function (a) { return '<button class="chip" data-psport="' + a[0] + '" aria-pressed="' + (p.sports.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
      '<button class="btn" id="psave">Guardar cambios</button><div class="msg" id="pmsg"></div></div>' +
      '<div class="card stack"><b>Tus datos</b><p class="small muted" style="margin:0">' + (user ? "Tus datos se guardan en tu cuenta. Podés descargar una copia o borrar tu cuenta cuando quieras." : "Todo se guarda solo en este dispositivo. Si cambiás de teléfono o borrás los datos del navegador, se pierde.") + "</p>" +
      '<div class="grid2"><button class="btn ghost" id="export">Descargar copia</button><button class="btn ghost" id="wipe">' + (user ? "Borrar mi cuenta" : "Borrar todo") + "</button></div>" +
      (user ? '<button class="btn ghost block" id="logout">Cerrar sesión</button>' : "") + "</div>" +
      '<div class="card small"><a data-link="instagram" href="' + esc(CFG.instagram || "#") + '" target="_blank" rel="noopener">Instagram @formargentina</a> · <a href="privacidad">Privacidad</a> · <a href="terminos">Términos</a> · <a href="./">Sitio de Forma</a></div>';
    return html;
  }

  // ---------- hojas / pantallas ----------
  function sheet(html) {
    close();
    var el = document.createElement("div"); el.className = "sheet"; el.id = "sheet";
    el.innerHTML = "<div>" + html + "</div>"; document.body.appendChild(el);
  }
  function close() { var s = $("#sheet"); if (s) s.remove(); var f = $("#full"); if (f) f.remove(); stopBreath(); }
  function notifyForm(label, email) {
    return '<form id="notify" class="stack" style="margin-top:10px"><input id="n-email" type="email" required placeholder="tu@email.com" value="' + esc(email || "") + '" style="' + fieldCss() + '"><button class="btn block">Avisame</button><div class="msg" id="nmsg"></div></form>';
  }
  function payButtons(id, label) {
    var link = (CFG.links && CFG.links[id]) || CFG.mercadoPago, h = "";
    if (!user && !S.demo) return '<div class="card" style="margin-top:12px"><b>Para comprar necesitás una cuenta</b><p class="small muted" style="margin:6px 0 10px">Así tu compra queda guardada y se desbloquea sola en la app.</p><button class="btn block" id="mkacct">Crear cuenta o iniciar sesión</button></div>';
    if (NATIVE) link = "";
    if (link) h += '<a class="btn block" target="_blank" rel="noopener" href="' + esc(link) + '" style="margin-top:12px">Pagar con Mercado Pago</a><p class="small muted">Pagá con el mismo email de tu cuenta (' + esc(user && user.email || "") + ") para que se desbloquee solo.</p>";
    if (CFG.paypal && !NATIVE) h += '<a class="btn ghost block" target="_blank" rel="noopener" href="' + esc(CFG.paypal) + '" style="margin-top:8px">Pagar con PayPal</a>';
    if (!h) h = '<p class="small muted" style="margin-top:12px">Los pagos todavía no están abiertos. Dejá tu email y te avisamos primero (' + esc(label || "") + ').</p>' + notifyForm(label, (user && user.email) || (S.profile && S.profile.email));
    return h;
  }
  function openProduct(id) {
    var p = prodOf(id); if (!p) return;
    var pl = planOf(p.s), ok = owns(p), viaPro = ok && !hasProduct(p.id);
    if (ok && p.prog) return openProgram(p.prog);
    sheet('<div class="row"><span class="shape">' + SHAPES[p.s] + '</span><div><span class="badge">Producto suelto</span><h2 style="font-size:22px;margin-top:4px">' + esc(p.n) + '</h2><span class="small muted">' + esc(pl ? pl.n : "") + " · " + esc(p.g) + (p.price ? " · " + esc(p.price) : "") + "</span></div></div>" +
      '<p style="margin:14px 0">' + esc(p.d) + "</p>" +
      (ok ? '<div class="card"><b>' + (viaPro ? "Lo tenés incluido en tu plan Pro." : "Ya es tuyo.") + "</b>" + (p.act ? '<p class="small muted" style="margin:6px 0 12px">Es una actividad guiada: se tilda en tu día solo cuando la hacés completa.</p><button class="btn block" data-act="' + p.act + '">Hacer ahora</button>' : '<p class="small muted" style="margin:6px 0 0">Estamos terminando el contenido de este producto. Apenas esté listo lo vas a ver acá, sin que tengas que hacer nada.</p>') + "</div>"
        : progPreview(p) + actPreview(p) + (p.soon ? '<div class="card"><b>Todavía no está disponible</b><p class="small muted" style="margin:6px 0 0">Lo estamos armando. Va a estar incluido en Vida diaria Pro.</p></div>' : payButtons(p.id, p.n)) + (pl && pl.live ? '<div class="card" style="margin-top:12px"><b>¿Querés todo el plan?</b><p class="small muted" style="margin:6px 0 10px">Forma ' + esc(pl.n) + " Pro incluye este y los demás productos de la sección.</p><button class='btn ghost block' data-plan='" + pl.id + "'>Ver plan " + esc(pl.n) + "</button></div>" : "")) +
      (p.id === "ansiedad" || p.id === "dormir" || p.id === "celular" || p.id === "comidas" || p.id === "plata" ? '<p class="small muted">Es un apoyo de bienestar y organización. No reemplaza la consulta con un profesional de la salud' + (p.id === "plata" ? " ni el asesoramiento financiero" : "") + ".</p>" : "") +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function actPreview(p) {
    var A = p.act && ACTS[p.act]; if (!A) return "";
    return '<div class="card"><b>Qué vas a hacer</b><ol class="small" style="margin:8px 0 0;padding-left:18px">' + A.steps.map(function (x) { return "<li>" + esc(x.t) + (x.s ? " <span class='muted'>(" + (x.s >= 60 ? Math.round(x.s / 60) + " min" : x.s + " s") + ")</span>" : "") + "</li>"; }).join("") + "</ol></div>";
  }
  function openOrganizar() { armOpen(S.arm && S.arm.ans); }

  // ---------- programas de 14 días ----------
  var PG = window.FormaProg || { list: [], byId: {} };
  function pgOf(id) { return PG.byId[id]; }
  function pgOwns(id) { var p = planOf(id); if (!p) return false; return p.inc ? hasProduct(planOf("vida").pro) : hasProduct(p.pro); }
  function pgItem(id) { return S.prog && S.prog.items && S.prog.items[id]; }
  function pgCount(id) { var it = pgItem(id); return it && it.done ? Object.keys(it.done).length : 0; }
  function pgCur() { var id = S.prog && S.prog.cur; return id && pgOf(id) && pgOwns(id) ? id : null; }
  function pgToday(id) { var it = pgItem(id); return !!(it && it.last === today()); }
  function pgPreview(P) { return '<ol class="small pgprev">' + P.days.map(function (x) { return "<li>" + esc(x.t) + "</li>"; }).join("") + "</ol>"; }
  function progPreview(p) {
    var P = p.prog && pgOf(p.prog); if (!P) return "";
    return '<div class="card"><b>Qué vas a hacer</b><p class="small muted" style="margin:6px 0 4px">Un paso por día, de 2 a 5 minutos, durante 14 días. Medís cómo estás antes y después para ver si funcionó.</p>' + pgPreview(P) + '<button class="btn sage block" data-pgtry="' + p.prog + '" style="margin-top:12px">Probar el paso 1 gratis</button></div>';
  }
  function scaleChips(P, key, sel) {
    return '<div class="pgm" data-key="' + key + '">' + [1, 2, 3, 4, 5].map(function (n) { return '<button class="chip" data-pgm="' + n + '" aria-pressed="' + (sel === n) + '">' + n + "</button>"; }).join("") + '</div><div class="row between small muted" style="margin-top:4px"><span>1 · ' + esc(P.lo) + "</span><span>5 · " + esc(P.hi) + "</span></div>";
  }
  function openPrograms() {
    sheet('<h2 style="font-size:22px">Programas de 14 días</h2><p class="muted small">Uno por vez, un paso por día. Elegí el que más te haga falta ahora.</p>' +
      PG.list.map(function (P) { var it = pgItem(P.id), n = pgCount(P.id), st = !it ? "Empezar" : n >= 14 ? "Terminado" : (S.prog.cur === P.id ? "Paso " + (n + 1) + " de 14" : "Retomar");
        return '<button class="prod" data-pgopen="' + P.id + '"><span class="shape">' + (SHAPES[P.id] || SHAPES.vida) + "</span><span style='flex:1;min-width:0'><b>" + esc(P.n) + "</b><small>" + esc(P.tag) + " · " + esc(P.intro.split(".")[0]) + '.</small></span><span class="tag">' + st + "</span></button>"; }).join("") +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  // ---- pasos interactivos: solo cuentan si se completan ----
  function pgWhenOk(st) { if (!st.when) return true; var d = new Date(), m = d.getHours() * 60 + d.getMinutes(); return st.when === "am" ? m < 840 : m >= 1080; }
  function pgWhenTxt(st) { return st.when === "am" ? "Este paso se hace de día. Está disponible hasta las 14:00." : "Este paso se hace de noche. Se habilita a las 18:00."; }
  function pgDr(it, k) { return it && it.dr && it.dr[k] !== undefined ? it.dr[k] : ""; }
  function pgMmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60)).slice(-2); }
  function pgFieldHtml(f, key, it) {
    var lab = f.l ? '<label class="pgl">' + esc(f.l) + "</label>" : "";
    if (f.k === "text") return lab + '<textarea class="pgin" rows="2" maxlength="300" data-fk="' + key + '" placeholder="' + esc(f.ph || "") + '">' + esc(pgDr(it, key)) + "</textarea>";
    if (f.k === "list") { var o = ""; for (var i = 0; i < f.n; i++) o += '<input class="pgin" maxlength="80" data-fk="' + key + "_" + i + '" placeholder="' + esc(f.ph || "") + '" value="' + esc(pgDr(it, key + "_" + i)) + '">'; return lab + o; }
    if (f.k === "choice") { var cur = pgDr(it, key); return lab + '<div class="pgch2">' + f.o.map(function (x, i) { return '<button class="chip" data-pgc="' + key + "|" + i + '" aria-pressed="' + (String(cur) === String(i)) + '">' + esc(x) + "</button>"; }).join("") + "</div>"; }
    if (f.k === "time") return lab + '<input class="pgin" type="time" data-fk="' + key + '" value="' + esc(pgDr(it, key)) + '">';
    if (f.k === "num") return lab + '<div class="row"><input class="pgin" type="number" inputmode="numeric" min="' + (f.min || 0) + '" max="' + (f.max || 99999) + '" data-fk="' + key + '" value="' + esc(pgDr(it, key)) + '" style="flex:1">' + (f.u ? '<span class="small muted">' + esc(f.u) + "</span>" : "") + "</div>";
    if (f.k === "check") return lab + f.o.map(function (x, i) { return '<button class="pgck" data-pgk="' + key + "_" + i + '" aria-pressed="' + (pgDr(it, key + "_" + i) === 1) + '"><i></i><span>' + esc(x) + "</span></button>"; }).join("");
    if (f.k === "timer") {
      var tm = it && it.st && it.st.tm, run = tm && Date.now() < tm.end, fin = tm && !run;
      return '<div class="pgtimer"><b>' + esc(f.l) + "</b>" + (fin ? '<div class="pgt done">✓ Completado</div>' : run ? '<div class="pgt" id="pgtmr" data-end="' + tm.end + '">' + pgMmss(tm.end - Date.now()) + '</div><p class="small muted" style="margin:4px 0 0">Seguí con lo tuyo. Cuando llegue a cero, volvé y completá el paso.</p>' : '<button class="btn sage block" data-pgtm="' + Math.round((FAST ? 3 : f.s)) + '" style="margin-top:8px">Empezar (' + (f.s >= 60 ? Math.round(f.s / 60) + " min" : f.s + " s") + ")</button>") + "</div>";
    }
    if (f.k === "act") { var dn = it && it.st && it.st.acts && it.st.acts[f.a]; return '<div class="pgtimer"><b>' + esc(f.l || "Actividad guiada") + "</b>" + (dn ? '<div class="pgt done">✓ Hecha completa</div>' : '<button class="btn sage block" data-pgact="' + f.a + '" style="margin-top:8px">Hacer ahora</button><p class="small muted" style="margin:6px 0 0">Cuenta cuando la terminás entera.</p>') + "</div>"; }
    return "";
  }
  function pgFieldCheck(f, key, it) {
    function bad(m) { return { ok: false, msg: m }; }
    var d = it.dr || {}, v;
    if (f.k === "text") { v = String(d[key] || "").trim(); return v.length >= f.min ? { ok: true, v: v } : bad("Falta completar: " + (f.l || "el texto") + " (un poco más largo).") }
    if (f.k === "list") { var a = []; for (var i = 0; i < f.n; i++) a.push(String(d[key + "_" + i] || "").trim()); return a.every(function (x) { return x.length >= 2; }) ? { ok: true, v: a } : bad("Completá los " + f.n + " casilleros: " + (f.l || "")); }
    if (f.k === "choice") { v = d[key]; if (v === undefined || v === "") return bad("Elegí una opción: " + (f.l || "")); if (f.need && f.need.indexOf(+v) < 0) return bad("Para que este paso cuente, la respuesta tiene que ser: " + f.need.map(function (i) { return f.o[i]; }).join(" o ") + ". Si hoy no pudiste, probalo de nuevo mañana."); return { ok: true, v: +v }; }
    if (f.k === "time") { v = String(d[key] || ""); return /^\d\d:\d\d$/.test(v) ? { ok: true, v: v } : bad("Falta una hora: " + (f.l || "")); }
    if (f.k === "num") { v = parseFloat(d[key]); return !isNaN(v) && v >= (f.min || 0) && v <= (f.max || 99999) ? { ok: true, v: v } : bad("Falta un número válido: " + (f.l || "")); }
    if (f.k === "check") { var all = f.o.every(function (x, i) { return d[key + "_" + i] === 1; }); return all ? { ok: true, v: 1 } : bad("Marcá todo lo que hiciste. Si falta algo, hacelo primero y después completás el paso."); }
    if (f.k === "timer") return it.st && it.st.tm && Date.now() >= it.st.tm.end ? { ok: true, v: 1 } : bad("Falta terminar el tiempo: " + f.l + ".");
    if (f.k === "act") return it.st && it.st.acts && it.st.acts[f.a] ? { ok: true, v: 1 } : bad("Falta hacer la actividad guiada completa.");
    return { ok: true };
  }
  function pgAvg(a) { return a.reduce(function (s, x) { return s + x; }, 0) / (a.length || 1); }
  function pgSeries(P, it) { return Object.keys(it.lg || {}).sort().map(function (d) { return P.metric(it.lg[d]); }); }
  function pgChart(P, it) {
    var v = pgSeries(P, it); if (v.length < 2) return "";
    var mx = Math.max.apply(null, v) || 1;
    return '<div class="sec" style="margin-top:16px">' + esc(P.ml) + '</div><div class="pgbars">' + v.map(function (x) { return '<i style="height:' + Math.max(8, Math.round(x / mx * 64)) + 'px"></i>'; }).join("") + '</div><div class="row between small muted" style="margin-top:4px"><span>Día 1: ' + esc(P.fmt(v[0])) + "</span><span>Último: " + esc(P.fmt(v[v.length - 1])) + "</span></div>";
  }
  function pgReport(P, it) {
    var v = pgSeries(P, it), out = [];
    if (v.length >= 2) { var k = Math.min(3, Math.floor(v.length / 2)), a = pgAvg(v.slice(0, k)), b = pgAvg(v.slice(-k)); out.push(P.ml + ": " + P.fmt(a) + " al principio → " + P.fmt(b) + " al final"); }
    else out.push("Registraste " + v.length + " día(s).");
    if (P.extra) out = out.concat(P.extra(it)); return out;
  }
  function pgStepForm(P, id, n, it) {
    var st = P.days[n], html = "", j;
    if (P.log) {
      var lg = it.lg && it.lg[today()];
      if (lg && (!it.dr || !Object.keys(it.dr).length)) { it.dr = it.dr || {}; P.log.forEach(function (f, i) { var v = lg[P.logKeys[i]]; if (v !== undefined) it.dr["L" + i] = v; }); }
      html += '<div class="sec" style="margin-top:14px">Tu registro de hoy</div>' + P.log.map(function (f, i) { return pgFieldHtml(f, "L" + i, it); }).join("");
    }
    if (st.f && st.f.length) html += '<div class="sec" style="margin-top:14px">Tu paso</div>' + st.f.map(function (f, i) { return pgFieldHtml(f, "F" + i, it); }).join("");
    return html;
  }
  function openProgram(id) {
    var P = pgOf(id); if (!P) return;
    if (!pgOwns(id)) return openPlan(id);
    var it = pgItem(id), n = pgCount(id), h = '<span class="badge">Programa de 14 días</span><h2 style="font-size:24px;margin:8px 0 4px">' + esc(P.n) + "</h2>";
    if (!it) {
      h += '<p>' + esc(P.intro) + '</p><div class="card"><b>Antes de empezar</b><p class="small" style="margin:6px 0 10px">' + esc(P.q) + "</p>" + scaleChips(P, "before", 0) + "</div>" +
        '<div class="card"><b>Tu razón</b><p class="small muted" style="margin:4px 0 8px">Escribila: te la vamos a recordar cuando cueste seguir.</p><textarea id="pgwhy" class="pgin" rows="2" maxlength="200" placeholder="Quiero hacer esto porque…"></textarea>' +
        '<label class="pgl">¿A qué hora querés hacer tu paso de cada día?</label><input id="pgat" class="pgin" type="time" value="' + (P.reminder || "20:00") + '"><p class="small muted" style="margin:6px 0 0">Te avisamos a esa hora si tenés la app abierta o el aviso activado.</p></div>' +
        '<p class="small" id="pgmsg" style="margin:0 0 8px;color:var(--err)"></p><button class="btn sage block" data-pgstart="' + id + '">Empezar programa</button><div class="sec" style="margin-top:16px">Los 14 pasos</div>' + pgPreview(P) + '<p class="small muted">' + esc(P.note) + "</p>";
    } else if (n >= 14) {
      var b = it.before, a = it.after, rep = pgReport(P, it);
      h += '<div class="card' + (a ? " sage" : "") + '"><b>¡Terminaste los 14 pasos!</b>' + (a ? '<p style="margin:8px 0 0">' + esc(P.q) + "<br><b>Antes: " + b + " · Después: " + a + "</b></p><p class=\"small\" style=\"margin:6px 0 0\">" + (P.better === "up" ? (a > b ? "Mejoraste. Mantené tus pasos favoritos." : "Todavía no se nota el cambio. Es normal: repetí los pasos que más te sirvieron.") : (a < b ? "Bajó la tensión. Usá tu kit cuando haga falta." : "Todavía no bajó. Repetí lo que más te sirvió y, si sigue, hablalo con un profesional.")) + "</p>" :
        '<p class="small" style="margin:6px 0 10px">Último paso: contanos cómo estás ahora. ' + esc(P.q) + "</p>" + scaleChips(P, "after", 0) + '<button class="btn sage block" data-pgafter="' + id + '" style="margin-top:10px">Ver mi resultado</button>') + "</div>" +
        (a ? '<div class="card"><b>Tus datos reales</b><ul class="ticks" style="margin:8px 0 0">' + rep.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" + pgChart(P, it) : "") +
        '<button class="btn ghost block" data-pgagain="' + id + '" style="margin-top:12px">Repetir el programa</button><button class="btn ghost block" data-pgall style="margin-top:8px">Elegir otro programa</button>';
    } else {
      var st = P.days[n], done = pgToday(id), ok = pgWhenOk(st);
      h += '<div class="pgbar"><i style="width:' + Math.round(n * 100 / 14) + '%"></i></div><p class="small muted" style="margin:6px 0 4px">Paso ' + (n + 1) + " de 14 · " + n + " hechos</p>" + (it.why ? '<p class="small pgwhy">Tu razón: «' + esc(it.why) + "»</p>" : "");
      if (done) h += '<div class="card sage"><b>Listo por hoy</b><p class="small" style="margin:4px 0 0">Mañana te espera el paso siguiente. Una cosa por día alcanza.</p></div>';
      else if (!ok) h += '<div class="card"><b style="font-size:18px">' + esc(st.t) + '</b><p class="small muted" style="margin:8px 0 0">' + pgWhenTxt(st) + "</p></div>";
      else h += '<div class="card"><b style="font-size:18px">' + esc(st.t) + "</b><p style='margin:8px 0'>" + esc(st.a) + "</p><p class='small muted' style='margin:0'>" + esc(st.w) + "</p>" + pgStepForm(P, id, n, it) + '<p class="small" id="pgmsg" style="margin:12px 0 0;color:var(--err)"></p><button class="btn block" data-pgdone="' + id + '" style="margin-top:10px">Completar paso</button></div>';
      h += pgChart(P, it) + '<div class="sec" style="margin-top:16px">Tu camino</div><ol class="small pgprev">' + P.days.map(function (x, i) { return '<li class="' + (i < n ? "ok" : i === n ? "cur" : "") + '">' + (i < n ? "✓ " : "") + esc(x.t) + "</li>"; }).join("") + "</ol>" +
        (S.prog.cur === id ? '<button class="linkbtn small" data-pgquit="' + id + '">Pausar este programa</button>' : '<button class="btn ghost block" data-pgresume="' + id + '">Retomar este programa</button>') + '<p class="small muted" style="margin-top:10px">' + esc(P.note) + "</p>";
    }
    sheet(h + '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function openPgQuit(id) {
    var it = pgItem(id); if (!it) return;
    sheet('<h2 style="font-size:22px">¿Pausar el programa?</h2>' + (it.why ? '<div class="card"><span class="small muted">Tu razón era</span><b style="display:block;margin-top:4px">«' + esc(it.why) + "»</b></div>" : "") + '<p class="small muted">Tu avance queda guardado y lo podés retomar cuando quieras.</p><button class="btn sage block" data-pgopen="' + id + '">Seguir con el programa</button><button class="btn ghost block" data-pgquit2="' + id + '" style="margin-top:8px">Pausar igual</button>');
  }
  function progCard() {
    if (!isProU() || !PG.list.length) return "";
    var id = pgCur();
    if (!id) {
      if (S.prog && S.prog.items && Object.keys(S.prog.items).length) return "";
      return '<div class="card" style="margin-top:12px"><b>Programas de 14 días</b><p class="small muted" style="margin:6px 0 10px">Un paso por día para dormir mejor, calmarte, arrancar o estudiar.</p><button class="btn sage" data-pgall>Elegir un programa</button></div>';
    }
    var P = pgOf(id), n = pgCount(id);
    if (n >= 14) return '<div class="card sage" style="margin-top:12px"><b>Terminaste «' + esc(P.n) + '»</b><p class="small" style="margin:6px 0 10px">' + (pgItem(id).after ? "Mirá tu resultado y elegí qué sigue." : "Falta un último paso: contanos cómo estás ahora.") + '</p><button class="btn" data-pgopen="' + id + '">Ver resultado</button></div>';
    var st = P.days[n], dn = pgToday(id), ok = pgWhenOk(st);
    return '<div class="card pgcard" style="margin-top:12px"><span class="small muted">' + esc(P.n) + " · paso " + (n + 1) + " de 14</span><b style='display:block;font-size:18px;margin:4px 0 10px'>" + (dn ? "Listo por hoy ✓" : esc(st.t)) + "</b>" +
      (dn ? "" : !ok ? '<p class="small muted" style="margin:0 0 10px">' + (st.when === "pm" ? "Esta noche, desde las 18:00." : "Mañana a la mañana, hasta las 14:00.") + "</p>" : "") +
      '<button class="btn ' + (dn ? "ghost" : "sage") + ' sm" data-pgopen="' + id + '">' + (dn ? "Ver programa" : ok ? "Hacer el paso" : "Ver paso") + "</button></div>";
  }
  function pgActDone(key) {
    var id = pgCur(); if (!id) return; var it = pgItem(id), P = pgOf(id), n = pgCount(id); if (!it || n >= 14 || pgToday(id)) return;
    var st = P.days[n]; if (!(st.f || []).some(function (f) { return f.k === "act" && f.a === key; })) return;
    it.st = it.st || {}; it.st.acts = it.st.acts || {}; it.st.acts[key] = 1;
  }
  function pgSubmit(id) {
    if (!pgOwns(id)) return; var it = pgItem(id), P = pgOf(id), n = pgCount(id); if (!it || pgToday(id) || n >= 14) return;
    var st = P.days[n], msg = $("#pgmsg"), data = { log: {}, f: [] }, i, r;
    function fail(m) { if (msg) msg.textContent = m; }
    if (!pgWhenOk(st)) return fail(pgWhenTxt(st));
    for (i = 0; i < (P.log || []).length; i++) { r = pgFieldCheck(P.log[i], "L" + i, it); if (!r.ok) return fail(r.msg); data.log[P.logKeys[i]] = r.v; }
    for (i = 0; i < (st.f || []).length; i++) { r = pgFieldCheck(st.f[i], "F" + i, it); if (!r.ok) return fail(r.msg); data.f.push(r.v); }
    if (P.log) { it.lg = it.lg || {}; it.lg[today()] = data.log; }
    it.fl = it.fl || {}; it.fl[n] = data.f;
    it.done[n] = today(); it.last = today(); it.dr = {}; it.st = null;
    S.ad = S.ad || {}; S.ad[today()] = S.ad[today()] || {}; S.ad[today()]["p|" + id] = 1; touchBest(); save(); close(); render();
    openProgram(id);
  }
  setInterval(function () {
    var e = document.getElementById("pgtmr"); if (!e) return;
    var rem = (+e.getAttribute("data-end")) - Date.now();
    if (rem <= 0) { e.textContent = "✓ Completado"; e.className = "pgt done"; e.removeAttribute("id"); } else e.textContent = pgMmss(rem);
  }, 1000);
  function openPgTry(id) {
    var P = pgOf(id); if (!P) return; var st = P.days[0];
    sheet('<span class="badge">Prueba gratis · paso 1 de 14</span><h2 style="font-size:24px;margin:8px 0 4px">' + esc(st.t) + '</h2><div class="card"><p style="margin:0 0 8px">' + esc(st.a) + '</p><p class="small muted" style="margin:0">' + esc(st.w) + '</p></div>' +
      '<div class="card dark"><b>Quedan 13 pasos más</b><p class="small" style="margin:6px 0 12px;opacity:.9">' + (planOf(id) && planOf(id).inc ? "Con Vida diaria Pro seguís" : "Con este plan seguís") + ' los 14 pasos, medís tu antes y después y se suma a tu constancia.</p><button class="btn sage" data-plan="' + (planOf(id) && planOf(id).inc ? "vida" : id) + '">' + (planOf(id) && planOf(id).inc ? "Ver Vida diaria Pro" : "Ver el plan") + '</button></div>' +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  // ---------- versión de prueba: comentarios ----------
  var BUILD = (function () { try { var m = ((document.querySelector('script[src*="miforma.js"]') || {}).src || "").match(/v=(\d+)/); return m ? m[1] : "?"; } catch (e) { return "?"; } })();
  var fbCat = "";
  function openFeedback() {
    var cats = ["Algo no funciona", "No se entiende", "Una idea", "Me gustó"];
    sheet('<h2 style="font-size:22px">Tu comentario</h2><p class="muted small">Contame qué te pasó o qué pensás. Todo sirve, lo bueno y lo malo.</p><div class="chips" style="margin:8px 0">' + cats.map(function (c) { return '<button class="chip" data-fbc="' + esc(c) + '" aria-pressed="' + (fbCat === c) + '">' + esc(c) + "</button>"; }).join("") + '</div><textarea id="fbt" rows="5" maxlength="800" placeholder="Escribí acá..." style="width:100%;' + fieldCss() + '"></textarea><button class="btn sage block" data-fbsend style="margin-top:12px">Enviar</button><p class="small muted" style="margin:8px 0 0">Se abre para que lo mandes por WhatsApp o donde quieras. Ya incluye en qué pantalla estabas.</p><button class="btn ghost block" data-close style="margin-top:8px">Cancelar</button>');
  }
  function sendFeedback() {
    var t = ($("#fbt") || {}).value || ""; if (!t.trim()) return;
    var txt = "Comentario sobre Forma (" + (fbCat || "general") + "):\n" + t.trim() + "\n\n— versión " + BUILD + " · " + (PFREE ? "gratis" : "completa") + " · pantalla: " + tab + " · " + window.innerWidth + "x" + window.innerHeight;
    function done(m) { sheet('<h2 style="font-size:22px">' + m + '</h2><button class="btn block" data-close>Listo</button>'); }
    if (navigator.share) navigator.share({ text: txt }).then(function () { done("¡Gracias!"); }, function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { done("Copiado. Pegalo en un mensaje para mandármelo."); }, function () { done("No se pudo copiar."); });
  }
  if (PRUEBA) { document.addEventListener("DOMContentLoaded", function () { var b = document.createElement("button"); b.id = "fbtab"; b.textContent = "Comentarios"; b.setAttribute("data-fbopen", ""); document.body.appendChild(b); }); if (document.readyState !== "loading") { var b0 = document.createElement("button"); b0.id = "fbtab"; b0.textContent = "Comentarios"; b0.setAttribute("data-fbopen", ""); document.body.appendChild(b0); } }

  // ---------- test de planes ----------
  var TESTQ = [
    { k: "occ", q: "¿A qué te dedicás hoy?", o: ["Estudio", "Trabajo", "Estudio y trabajo", "Otra cosa"], w: [{}, {}, {}, {}] },
    { k: "study", q: "¿Cómo te va con el estudio?", o: ["Bien", "Me cuesta organizarme", "Me cuesta concentrarme y rindo menos de lo que podría"], w: [{}, { estudio: 2 }, { estudio: 2 }], when: function (a) { return a.occ === 0 || a.occ === 2; } },
    { k: "exams", q: "¿Tenés exámenes o entregas en las próximas semanas?", o: ["No por ahora", "Sí, algunos", "Sí, muchos"], w: [{}, { estudio: 1 }, { estudio: 2 }], when: function (a) { return a.occ === 0 || a.occ === 2; } },
    { k: "sleep", q: "¿Cómo estás durmiendo últimamente?", o: ["Bien", "A veces me cuesta", "Mal, casi siempre"], w: [{}, { dormir: 1 }, { dormir: 2 }] },
    { k: "sleep2", q: "¿Cómo te levantás a la mañana?", o: ["Con energía", "Cansado/a, pero funciono", "Muy cansado/a, me cuesta mucho"], w: [{}, { dormir: 1 }, { dormir: 2 }] },
    { k: "phone", q: "¿Cuántas horas de pantalla de celular tenés por día?", o: ["Menos de 2", "Entre 2 y 4", "Entre 4 y 6", "Más de 6"], w: [{}, { celular: 1 }, { celular: 2 }, { celular: 2 }] },
    { k: "phone2", q: "Cuando querés dejar el celular…", o: ["Lo dejo sin problema", "Me cuesta", "Vuelvo enseguida sin darme cuenta"], w: [{}, { celular: 1 }, { celular: 2 }] },
    { k: "proc", q: "¿Postergás lo importante?", o: ["Casi nunca", "A veces", "Seguido"], w: [{}, { arrancar: 1 }, { arrancar: 2 }] },
    { k: "proc2", q: "Cuando tenés que empezar algo difícil…", o: ["Arranco", "Me cuesta arrancar, pero lo hago", "Lo dejo para último momento"], w: [{}, { arrancar: 1 }, { arrancar: 2 }] },
    { k: "stress", q: "¿Cómo está tu tensión o ansiedad?", o: ["Estoy tranquilo/a", "Por momentos tenso/a", "Seguido tenso/a"], w: [{}, { calma: 1 }, { calma: 2 }] },
    { k: "stress2", q: "¿Se te acelera la cabeza o te cuesta frenar los pensamientos?", o: ["Casi nunca", "A veces", "Seguido"], w: [{}, { calma: 1 }, { calma: 2 }] },
    { k: "sport", q: "¿Practicás algún deporte con regularidad?", o: ["Tenis", "Fútbol", "Vóley", "Básquet", "Handball", "Otro o ninguno"], w: [{ tenis: 3 }, { futbol: 3 }, { voley: 3 }, { basquet: 3 }, { handball: 3 }, {}] },
    { k: "extra", q: "¿Hay otra cosa que te gustaría ordenar?", o: ["Mi plata", "Moverme más o entrenar", "Comer más ordenado", "Buscar trabajo", "Nada más"], w: [{ plata: 2 }, { movimiento: 2 }, { comer: 2 }, { laburo: 2 }, {}] },
    { k: "top", q: "Si pudieras mejorar una sola cosa en 14 días, ¿cuál elegirías?", o: ["Dormir mejor", "Usar menos el celular", "Dejar de postergar", "Estar más tranquilo/a", "Estudiar mejor", "Ninguna en particular"], w: [{ dormir: 2 }, { celular: 2 }, { arrancar: 2 }, { calma: 2 }, { estudio: 2 }, {}] },
    { k: "time", q: "¿Cuánto tiempo por día podés dedicarle a mejorar?", o: ["5 a 10 minutos", "15 a 20 minutos", "30 minutos o más"], w: [{}, {}, {}] }
  ];
  var tst = null;
  function testVisible(a) { return TESTQ.filter(function (q) { return !q.when || q.when(a); }); }
  function testRecs(a) {
    var sc = {}, why = {};
    TESTQ.forEach(function (q) {
      if (a[q.k] === undefined || (q.when && !q.when(a))) return;
      var w = q.w[a[q.k]] || {};
      Object.keys(w).forEach(function (pid) { sc[pid] = (sc[pid] || 0) + w[pid]; if (!why[pid] || w[pid] > why[pid].p) why[pid] = { p: w[pid], t: "Respondiste «" + q.o[a[q.k]] + "» a «" + q.q.replace(/[¿?]/g, "").replace(/…$/, "") + "»" }; });
    });
    var out = Object.keys(sc).filter(function (id) { return planOf(id) && sc[id] >= 2; }).map(function (id) { return { id: id, sc: sc[id], why: why[id].t }; });
    out.sort(function (x, y) { return y.sc - x.sc; });
    if (!out.length) Object.keys(sc).forEach(function (id) { if (planOf(id) && sc[id] >= 1 && !out.length) out.push({ id: id, sc: sc[id], why: why[id].t }); });
    var maxLive = a.time === 0 ? 1 : a.time === 1 ? 2 : 3, live = out.filter(function (r) { return planOf(r.id).live; }).slice(0, maxLive), soon = out.filter(function (r) { return !planOf(r.id).live; }).slice(0, 1), res = live.concat(soon);
    if (!res.length) res.push({ id: "vida", why: "Te ayuda a sostener tu día y tu constancia" });
    return res.map(function (r) { return { id: r.id, why: r.why }; });
  }
  // ---------- OBJETIVOS: qué querés lograr -> cuestionario a fondo -> día nuevo por etapas ----------
  function ah(k) { return function (a) { var h = (a.habits || []).slice(); if (h.indexOf(k) < 0 && h.length < 3) h.push(k); a.habits = h; }; }
  function pcat() { var fs = arguments; return function (a) { for (var i = 0; i < fs.length; i++) fs[i](a); }; }
  function hrsTxt(m) { return (Math.round(m / 6) / 10).toString().replace(".", ",") + " h"; }
  function fmtT(m) { return window.FormaDia ? window.FormaDia.fmt(m) : String(m); }
  function A_(l, m, at, note, x) { return Object.assign({ l: l, m: m, at: at, note: note }, x || {}); }
  var GOALS = [
    { id: "dormir", n: "Dormir mejor", d: "Acostarte y levantarte mejor, sin darle vueltas", plan: "dormir",
      qs: [
        { k: "w", q: "¿Qué te pasa con el sueño?", o: ["Me cuesta dormirme", "Me despierto de noche", "Duermo poco por mis horarios", "Duermo pero me levanto cansado"] },
        { k: "l", q: "¿Qué hacés la última hora antes de acostarte?", o: ["Celular, series o redes", "Trabajo o estudio", "Cosas de la casa", "Ya me relajo"] },
        { k: "c", q: "¿Tomás café, mate o energizantes a la tarde o noche?", o: ["Sí, seguido", "A veces", "No"] },
        { k: "h", q: "¿Cuántas horas te gustaría dormir?", o: ["6 horas", "7 horas", "8 horas", "9 horas"] },
        { k: "f", q: "¿Cambia mucho tu horario los fines de semana?", o: ["Mucho", "Un poco", "Casi nada"] },
        { k: "p", q: "¿Cuánto cambio podés hacer por semana en tu hora de dormir?", o: ["Muy poco: 15 minutos", "Moderado: 30 minutos", "Lo que haga falta: 1 hora"] }
      ],
      build: function (g, A) {
        var H = [6, 7, 8, 9][g.h]; if (H === undefined) H = 8; var step = [15, 30, 60][g.p] || 30;
        var tgt = Math.max(1200, A.wake + 1440 - H * 60), cur = A.sleep, need = cur > tgt, out = [];
        function sl(n) { return Math.max(tgt, cur - step * n); }
        var hoy = hrsTxt(1440 - (cur - A.wake));
        if (need) out.push({ s: 1, t: "Acostarte a las " + fmtT(sl(1)) + " (antes: " + fmtT(cur) + ")", why: "Hoy dormís unas " + hoy + " y querés " + H + ". Lo hacemos de a poco, " + step + " minutos por semana.", patch: function (a) { a.sleep = sl(1); } });
        else out.push({ s: 1, t: "Tu horario ya alcanza para dormir " + H + " horas", why: "Entonces trabajamos la calidad del sueño, no la hora.", patch: null, tip: true });
        var ln = ["Celular a cargar fuera de la cama antes de empezar.", "Si en 20 minutos no te dormís, levantate, hacé algo tranquilo con luz baja y volvé cuando tengas sueño.", "Sin pantallas ni trabajo: luz baja y algo tranquilo.", "Sin pantallas: luz baja, ducha tibia o lectura."][g.l === 0 ? 0 : g.w === 0 ? 1 : g.w === 3 ? 3 : 2];
        out.push({ s: 1, t: "Rutina de bajada", why: "Una rutina fija antes de acostarte le avisa al cuerpo que viene el sueño.", patch: null, act: A_("Rutina de bajada: sin pantallas", 20, [["sleep", -70]], ln) });
        if (g.l === 0) out.push({ s: 1, t: "Celular afuera de la cama", why: "Es lo que más sueño le saca a quien lo usa antes de dormir.", patch: null, act: A_("Dejar el celular cargando fuera del cuarto", 5, [["sleep", -75]], "Despertador común o el celular lejos de la cama.") });
        if (g.l === 1) out.push({ s: 1, t: "Cerrar el trabajo o el estudio", why: "Para que la cabeza deje de resolver cosas en la cama.", patch: null, act: A_("Cerrar el trabajo y anotar pendientes", 10, [["sleep", -100]], "Escribí lo que queda para mañana y cerrá todo.") });
        if (g.l === 2) out.push({ s: 1, t: "Dejar la casa lista", why: "Para que la última hora sea solo para vos.", patch: null, act: A_("Dejar la casa lista para mañana", 10, [["sleep", -100]], "") });
        if (g.w === 1) out.push({ s: 1, t: "Respiración si te despertás de noche", why: "Respirar lento baja el ritmo sin mirar el celular.", patch: null, act: A_("Respiración 4-6 antes de acostarte", 5, [["sleep", -15]], "Si te despertás de noche, repetila sin mirar el celular: 4 segundos entrando, 6 saliendo.") });
        if (g.c === 0) out.push({ s: 1, t: "Último café del día", why: "La cafeína tarda horas en irse del cuerpo.", patch: null, act: A_("Último café, mate o energizante", 5, [["abs", 900]], "Después de esta hora, agua o té sin cafeína.") });
        if (g.c === 1) out.push({ s: 2, t: "Cortar la cafeína a las 16:00", why: "La cafeína tarda horas en irse del cuerpo.", patch: null, act: A_("Último café o mate del día", 5, [["abs", 960]], "Después de esta hora, agua o té sin cafeína.") });
        if (need && sl(2) < sl(1)) out.push({ s: 2, t: "Acostarte a las " + fmtT(sl(2)), why: "Un paso más hacia tus " + H + " horas", patch: function (a) { a.sleep = sl(2); } });
        out.push({ s: 2, t: "Respiración antes de dormir", why: "Ayuda a bajar el ritmo y a dormirte más rápido", patch: ah("breathe") });
        if (g.f === 0) out.push({ s: 2, t: "Mismo horario el fin de semana", why: "Cambiar mucho el horario desordena el reloj del cuerpo.", patch: null, act: A_("Hoy es finde: acostate a tu hora de siempre (máx. 1 h de diferencia)", 5, [["sleep", -60]], "", { dow: [5, 6] }) });
        if (need && sl(3) < sl(2)) out.push({ s: 3, t: "Acostarte a las " + fmtT(sl(3)), why: sl(3) === tgt ? "¡Llegás a tus " + H + " horas!" : "Seguimos acercándonos a tus " + H + " horas", patch: function (a) { a.sleep = sl(3); } });
        out.push({ s: 3, t: "Dejar anotado lo de mañana antes de dormir", why: "Sacás las cosas de la cabeza y llegás más tranquilo a la cama", patch: ah("plan") });
        return out;
      } },
    { id: "celular", n: "Usar menos el celular", d: "Dejar de perder horas y recuperar tu tiempo", plan: "celular",
      qs: [
        { k: "u", q: "¿Cuándo lo usás más, sin querer?", o: ["Apenas me levanto", "En los ratos libres", "Cuando tengo algo importante que hacer", "De noche, en la cama"] },
        { k: "h", q: "¿Cuántas horas por día mirás la pantalla? (lo ves en los ajustes del celular)", o: ["Menos de 3", "Entre 3 y 5", "Entre 5 y 7", "Más de 7"] },
        { k: "a", q: "¿Qué es lo que más tiempo te lleva?", o: ["Redes (Instagram, TikTok)", "Videos o series", "Mensajes", "Juegos"] },
        { k: "t", q: "¿Qué te gustaría hacer con ese tiempo?", o: ["Leer o aprender", "Moverme", "Estar con gente", "Descansar de verdad"] },
        { k: "m", q: "¿Cuánto querés bajar?", o: ["Un poco, me alcanza", "Casi la mitad", "Todo lo que se pueda"] }
      ],
      build: function (g) {
        var out = [];
        out.push({ s: 1, t: "«Celular y redes, con límite» en tu día", why: "Un momento elegido para usarlo sin culpa, en vez de miradas sueltas todo el día.", patch: function (a) { a.waste = "phone"; } });
        if (g.u === 0) out.push({ s: 1, t: "Mañana sin celular", why: "Lo primero que mirás define cómo arrancás el día.", patch: null, act: A_("", 0, [], "Primeros 30 minutos sin celular: agua y luz natural.", { into: "first" }) });
        if (g.u === 0 || g.u === 3) out.push({ s: 1, t: "Celular lejos de la cama", why: "Si no está al alcance, no lo agarrás.", patch: null, act: A_("Dejar el celular cargando fuera del cuarto", 5, [["sleep", -45]], "Usá un despertador común.") });
        if (g.u === 1) out.push({ s: 1, t: "Redes fuera de la primera pantalla", why: "Si cuesta abrirlas, las abrís menos.", patch: null, act: A_("Sacar las redes de la primera pantalla", 5, [["mid", 0]], "Movelas a una carpeta de la segunda pantalla.", { once: true }) });
        if (g.u === 2) out.push({ s: 1, t: "Celular lejos cuando hay algo importante", why: "Es el momento donde más te cuesta.", patch: null, act: A_("", 0, [], "Celular en otra habitación o en modo avión.", { into: "focus" }) });
        out.push({ s: 1, t: "Límite diario en la app que más usás", why: "Un límite que te avisa es más fácil que la fuerza de voluntad.", patch: null, act: A_("Poner límite diario a " + (["tus redes", "tus videos y series", "tus mensajes", "tus juegos"][g.a] || "tu app más usada"), 5, [["mid", 0]], "Ajustes del celular → Bienestar digital o Tiempo en pantalla.", { once: true }) });
        out.push({ s: 2, t: "Pausas sin pantalla durante el día", why: "Para que el celular no ocupe todos los huecos libres", patch: function (a) { a.pauses = Math.max(a.pauses || 0, 2); } });
        var hb = [["read", "Leer 10 minutos"], ["move", "Moverte y estirar"], ["walk", "Caminar 15 minutos, mejor con alguien"], ["breathe", "Respirar y descansar de verdad"]][g.t] || ["read", "Leer 10 minutos"];
        out.push({ s: 2, t: "Hábito para reemplazar la pantalla: " + hb[1], why: "Es lo que dijiste que querés hacer con ese tiempo", patch: ah(hb[0]) });
        out.push({ s: 3, t: "Un sábado a la tarde sin redes", why: ["Sirve para ver cuánto cambia cómo te sentís.", "Con la mitad ya hay un cambio enorme. Esto te muestra que se puede.", "Si querés llegar lejos, hay que probar qué se siente."][g.m] || "Sirve para ver cómo te sentís.", patch: null, act: A_("Tarde sin redes (probá hasta la noche)", 60, [["abs", 960]], "Dejalas cerradas y fijate cómo te sentís.", { dow: [6] }) });
        out.push({ s: 3, t: "Dejar listo mañana antes de dormir", why: "Así arrancás sin pantalla", patch: ah("plan") });
        return out;
      } },
    { id: "estudio", n: "Estudiar y rendir mejor", d: "Organizar tu estudio y mejorar tus notas", plan: "estudio",
      qs: [
        { k: "e", q: "¿Qué estudiás?", o: ["Colegio", "Terciario o universidad", "Un idioma", "Cursos o por mi cuenta"] },
        { k: "d", q: "¿Qué es lo que más te cuesta?", o: ["Empezar", "Concentrarme", "Organizarme con las fechas", "Acordarme de lo que estudié"] },
        { k: "h", q: "¿Cuántas horas por día podés estudiar de verdad?", o: ["1 hora", "2 horas", "3 horas", "4 horas o más"] },
        { k: "x", q: "¿Tenés algún examen cerca?", o: ["Sí, en menos de 2 semanas", "En 1 o 2 meses", "No, o no tengo fecha fija"] },
        { k: "r", q: "¿Cuándo rendís mejor?", o: ["A la mañana", "A la tarde", "A la noche", "Me da igual"] }
      ],
      build: function (g) {
        var out = [], hrs = [60, 120, 180, 240][g.h] || 120, en = ["am", "pm", "night", "any"][g.r] || "any";
        out.push({ s: 1, t: "Reservar " + hrsTxt(hrs) + " por día para estudiar, en tu mejor momento", why: "Estudiar pasa a ser una prioridad de tu día, con horario.", patch: function (a) { var p = (a.prios || []).slice(); if (p.indexOf("study") < 0) { if (p.length >= 3) p.pop(); p.unshift("study"); } a.prios = p; a.free = Math.max(a.free || 0, hrs); a.energy = en; } });
        if (g.d === 0) out.push({ s: 1, t: "Empezar con 10 minutos", why: "Empezar es lo más difícil, no seguir.", patch: function (a) { if (!a.waste || a.waste === "none") a.waste = "procrastinate"; }, act: A_("", 0, [], "Regla de 10 minutos: empezá solo 10 y después decidís si seguís.", { into: "focus" }) });
        if (g.d === 1) out.push({ s: 1, t: "Celular lejos mientras estudiás", why: "Cada vez que lo mirás perdés el hilo.", patch: null, act: A_("", 0, [], "Celular en otra habitación mientras estudiás.", { into: "focus" }) });
        if (g.d === 2) out.push({ s: 1, t: "Anotar qué estudiar mañana", why: "Así sabés qué hacer apenas te sentás.", patch: ah("plan"), act: A_("Anotar qué estudiar mañana", 5, [["sleep", -150]], "Materia, tema y cuántos minutos.") });
        if (g.d === 3) out.push({ s: 1, t: "Cerrar el cuaderno y escribir lo que recordás", why: "Recordar sin mirar es lo que más fija lo que estudiás.", patch: null, act: A_("", 0, [], "Al terminar, cerrá el cuaderno y escribí de memoria lo que recordás.", { into: "focus" }) });
        out.push({ s: 2, t: "Estudiar en tandas con pausa corta", why: "El cerebro rinde más con pausas que con una maratón", patch: function (a) { a.pauses = Math.max(a.pauses || 0, 2); }, act: A_("", 0, [], "Tandas de 25 a 50 minutos con una pausa de 5.", { into: "focus" }) });
        if (g.x === 0) out.push({ s: 2, t: "Repaso diario para el examen", why: "Repasar de a poco rinde más que todo junto.", patch: null, act: A_("Repasar lo que ya viste (examen cerca)", 30, [["mid", 0]], "Sin material nuevo: solo lo que ya estudiaste. Hacé un simulacro la semana previa.") });
        if (g.x === 1) out.push({ s: 2, t: "Calendario hacia el examen", why: "Con tiempo, la clave es repartir.", patch: null, act: A_("Armar el calendario hacia el examen", 20, [["mid", 0]], "Temas por semana y un repaso final.", { once: true }) });
        out.push({ s: 3, t: "Repaso semanal", why: "Repasar espaciado es lo que más ayuda a recordar", patch: ah("read"), act: A_("Repaso semanal de todo lo de la semana", 20, [["mid", 0]], "Mirá los temas de la semana y probate sin mirar.", { dow: [0] }) });
        return out;
      } },
    { id: "calma", n: "Bajar la ansiedad", d: "Estar más tranquilo y manejar la tensión", plan: "calma",
      qs: [
        { k: "c", q: "¿Cuándo la sentís más?", o: ["Al despertarme", "Durante el día", "A la noche", "Sin horario claro"] },
        { k: "s", q: "¿Cómo se nota?", o: ["Pensamientos acelerados", "Tensión en el cuerpo", "Inquietud, no puedo parar", "Un poco de todo"] },
        { k: "g", q: "¿Qué la dispara más?", o: ["Trabajo o estudio", "Pensar en el futuro", "Las relaciones", "No lo sé"] },
        { k: "a", q: "¿Qué te ayuda hoy?", o: ["Moverme", "Hablar con alguien", "Estar solo un rato", "Nada, no encuentro algo que me ayude"] },
        { k: "t", q: "¿Cuánto tiempo por día podés dedicarle?", o: ["5 minutos", "10 minutos", "20 minutos", "30 minutos o más"] }
      ],
      build: function (g) {
        var out = [];
        out.push({ s: 1, t: "Respiración y pausas en tu día", why: "Son herramientas simples que funcionan mejor cuando las usás todos los días, no solo cuando estás mal.", patch: pcat(ah("breathe"), function (a) { a.pauses = Math.max(a.pauses || 0, 2); }) });
        if (g.c === 0) out.push({ s: 1, t: "5 respiraciones al despertar", why: "Antes del celular, para arrancar más tranquilo.", patch: null, act: A_("", 0, [], "Antes de mirar el celular: 5 respiraciones lentas.", { into: "first" }) });
        if (g.c === 1 || g.c === 3) out.push({ s: 1, t: "Pausas de 2 minutos en el día", why: "Cortan la tensión antes de que se acumule.", patch: null, act: A_("Pausa de 2 minutos: soltá hombros y respirá", 5, [["abs", 660], ["abs", 900]], "4 segundos entrando, 6 saliendo.") });
        if (g.c === 2 || g.c === 3) out.push({ s: 1, t: "Anotar lo que te preocupa", why: "Sacarlo de la cabeza antes de dormir ayuda.", patch: null, act: A_("Anotar lo que te preocupa", 10, [["sleep", -100]], "Un papel: qué me preocupa y qué puedo hacer mañana.") });
        out.push({ s: 2, t: "Caminar 15 minutos por día", why: g.a === 0 ? "Dijiste que moverte te ayuda: lo sumamos a tu día." : "Moverse baja la tensión del cuerpo.", patch: ah("walk") });
        if (g.a === 1) out.push({ s: 2, t: "Hablar con alguien", why: "Dijiste que hablar te ayuda.", patch: null, act: A_("Hablar con alguien que te hace bien (aunque sean 10 minutos)", 10, [["mid", 0]], "Un llamado o un mensaje de voz.", { dow: [3, 6] }) });
        if (g.a === 3) out.push({ s: 2, t: "Probar algo distinto cada día", why: "Todavía no sabés qué te sirve: lo descubrimos probando.", patch: null, act: A_("Probar algo distinto: caminar, respirar, escribir o hablar", 10, [["mid", 0]], "Anotá cuál te hizo bien.") });
        out.push({ s: 3, t: "Escribir 3 líneas antes de dormir", why: "Escribirlo ayuda a soltarlo", patch: ah("write") });
        out.push({ s: 3, t: "Si en 3 semanas sigue igual o te frena en tu vida, hablalo con un profesional", why: "Forma ordena tus hábitos, pero no reemplaza un tratamiento", patch: null, tip: true });
        return out;
      } },
    { id: "arrancar", n: "Arrancar el día con energía", d: "Mañanas ordenadas y dejar de postergar", plan: "arrancar",
      qs: [
        { k: "m", q: "¿Cómo son tus mañanas hoy?", o: ["Pesadas, me cuesta salir de la cama", "Apuradas, siempre llego justo", "Bien, pero sin una rutina", "Pierdo la mañana y arranco tarde"] },
        { k: "p", q: "¿Qué hacés primero al despertarte?", o: ["Miro el celular", "Tomo algo y salgo", "Me ducho o me preparo", "Nada fijo"] },
        { k: "c", q: "¿Qué es lo que más te cuesta?", o: ["Levantarme", "Empezar a hacer cosas", "Concentrarme", "Todo un poco"] },
        { k: "t", q: "¿Cuánto tiempo podés dedicarle a tu mañana?", o: ["15 minutos", "30 minutos", "45 minutos", "1 hora"] }
      ],
      build: function (g) {
        var out = [];
        out.push({ s: 1, t: "Un primer paso fijo cada mañana", why: "Arrancar siempre igual saca la decisión y baja la pereza.", patch: pcat(ah("plan"), function (a) { if (g.c === 1 || g.c === 3) a.waste = "procrastinate"; }), act: A_("", 0, [], "Agua, luz natural y un primer paso chico." + (g.p === 0 ? " Primeros 20 minutos sin celular." : ""), { into: "first" }) });
        if (g.c === 0) out.push({ s: 1, t: "Despertador lejos de la cama", why: "Para lo que más te cuesta: levantarte.", patch: null, act: A_("Dejar el despertador lejos de la cama", 2, [["sleep", -40]], "Levantate al primer sonido.") });
        out.push({ s: 2, t: "Moverte 5 minutos apenas te levantás", why: "Despierta el cuerpo y sube la energía", patch: ah("move") });
        if (g.c === 1 || g.c === 3) out.push({ s: 2, t: "Regla de 10 minutos", why: "Empezar es lo más difícil, no seguir.", patch: null, act: A_("", 0, [], "Regla de 10 minutos: empezá solo 10 y después decidís.", { into: "focus" }) });
        out.push({ s: 3, t: "Dejar la mañana preparada la noche anterior", why: "Ropa, mochila y lo primero que vas a hacer", patch: ah("write"), act: A_("Dejar lista la ropa y lo primero de mañana", 10, [["sleep", -100]], "") });
        return out;
      } },
    { id: "deporte", n: "Mejorar en mi deporte", d: "Entrenar mejor y rendir más", plan: "tenis", go: "planes" },
    { id: "peso", n: "Comer mejor y bajar de peso", d: "Comidas más ordenadas y más movimiento, sin dietas", plan: "comer",
      qs: [
        { k: "m", q: "¿Qué es lo que más te cuesta hoy?", o: ["Picotear entre comidas", "Comer muy tarde o saltearme comidas", "Las porciones grandes", "Comer por ansiedad o aburrimiento", "No sé por dónde empezar"] },
        { k: "c", q: "¿Cuántas comidas hacés por día?", o: ["1 o 2", "3", "4 o más"] },
        { k: "a", q: "¿Tomás agua durante el día?", o: ["Casi nada", "Algo", "Sí, bastante"] },
        { k: "e", q: "¿Cuánto te movés hoy?", o: ["Casi nada", "Camino algo", "Entreno 1 o 2 veces por semana", "Entreno 3 veces o más"] },
        { k: "t", q: "¿Cuánto tiempo podés sumar por día para moverte?", o: ["10 minutos", "20 minutos", "30 minutos", "45 minutos o más"] },
        { k: "o", q: "¿Tenés una indicación médica o de un nutricionista?", o: ["No", "Sí, y la sigo"] }
      ],
      build: function (g) {
        var out = [], mv = [10, 20, 30, 45][g.t] || 20;
        out.push({ s: 1, t: "Comer sin pantallas, despacio", why: "Prestar atención a la comida ayuda a notar cuándo ya estás conforme.", patch: null, act: A_("", 0, [], "Sin pantalla y despacio. Parate cuando estés conforme.", { into: "meal" }) });
        if (g.a < 2) out.push({ s: 1, t: "Un vaso de agua al despertar", why: "Es fácil y arranca el hábito de tomar agua.", patch: null, act: A_("", 0, [], "Un vaso de agua apenas te levantás.", { into: "first" }) });
        if (g.m === 0) out.push({ s: 1, t: "Dejar lista una colación", why: "Si ya tenés algo preparado, picoteás menos.", patch: null, act: A_("Preparar una colación (fruta, yogur, frutos secos)", 5, [["abs", 600]], "Dejala a la vista para cuando te dé hambre.") });
        if (g.m === 1) out.push({ s: 1, t: "No saltear la comida principal", why: "Llegar con mucha hambre hace comer más y peor.", patch: null, act: A_("", 0, [], "No te la saltees: comer a horario evita llegar con demasiada hambre.", { into: "meal" }) });
        if (g.m === 2) out.push({ s: 1, t: "Servirte una porción y esperar 10 minutos", why: "La señal de estar conforme tarda en llegar.", patch: null, act: A_("", 0, [], "Servite una sola porción y esperá 10 minutos antes de repetir.", { into: "meal" }) });
        if (g.m === 3) out.push({ s: 1, t: "Pausa antes de comer algo fuera de hora", why: "Ayuda a distinguir hambre de ansiedad o aburrimiento.", patch: null, act: A_("Pausa de 5 minutos: ¿tengo hambre o es otra cosa?", 5, [["abs", 1020]], "Tomá agua, respirá o caminá un poco. Si sigue el hambre, comé algo tranquilo.") });
        if (g.m === 4) out.push({ s: 1, t: "Anotar lo que comés, sin juzgar", why: "Para ver dónde estás antes de cambiar nada.", patch: null, act: A_("Anotar lo que comí hoy (solo anotar)", 5, [["sleep", -100]], "Sin culpa: es para conocerte.") });
        out.push({ s: 2, t: "Caminar " + mv + " minutos por día", why: "Moverte todos los días pesa más que un gran esfuerzo un día.", patch: null, act: A_("Caminar " + mv + " minutos", mv, [["mid", 0]], "Al ritmo que puedas.") });
        out.push({ s: 2, t: "Dejar preparada la comida de mañana", why: "Decidir con hambre es lo más difícil.", patch: null, act: A_("Dejar lista la comida de mañana", 15, [["sleep", -120]], "Aunque sea una parte: la base, la fruta o la vianda.") });
        out.push({ s: 3, t: "Un paso más de movimiento", why: "Cuando ya caminás, sumamos movimiento con fuerza o estiramiento.", patch: ah("move") });
        out.push({ s: 3, t: "Repasar la semana de comidas", why: "Ver qué te costó más te dice qué cambiar.", patch: null, act: A_("Repasar la semana: qué comida me costó más", 10, [["mid", 0]], "Elegí un solo cambio para la semana que viene.", { dow: [0] }) });
        out.push({ s: 1, t: g.o === 1 ? "Seguí la indicación de tu médico o nutricionista: Forma la complementa, no la reemplaza" : "Para bajar de peso de forma segura, consultá a un médico o nutricionista", why: "Forma ordena tus hábitos pero no da dietas ni reemplaza a un profesional", patch: null, tip: true });
        return out;
      } },
    { id: "movimiento", n: "Moverme más", d: "Empezar a entrenar o a moverte, de a poco", plan: "movimiento",
      qs: [
        { k: "e", q: "¿Cuánto te movés hoy?", o: ["Casi nada", "Camino algo", "Entreno 1 o 2 veces por semana", "Entreno 3 veces o más"] },
        { k: "q", q: "¿Qué te gustaría hacer?", o: ["Caminar", "Entrenar en casa", "Ir al gimnasio", "Un deporte"] },
        { k: "l", q: "¿Tenés alguna molestia o lesión?", o: ["No", "Sí, leve", "Sí, y me limita"] },
        { k: "d", q: "¿Cuándo preferís moverte?", o: ["A la mañana", "A la tarde", "A la noche", "Me da igual"] },
        { k: "t", q: "¿Cuánto tiempo podés por sesión?", o: ["20 minutos", "30 minutos", "45 minutos", "1 hora"] }
      ],
      build: function (g) {
        var out = [], dur = [30, 30, 45, 60][g.t] || 30, tw = ["am", "pm", "night", "any"][g.d] || "any", nm = ["Caminata", "Entrenamiento en casa", "Gimnasio", "Deporte"][g.q] || "Movimiento";
        out.push({ s: 1, t: nm + " de " + (g.t === 0 ? 20 : dur) + " minutos en tu día", why: "Un horario fijo es lo que más ayuda a sostener el movimiento.", patch: function (a) { a.train = Math.max(a.train || 0, 30); a.trainWhen = tw; } });
        out.push({ s: 1, t: "Caminar 10 minutos después de comer", why: "Es poco, se puede hacer en cualquier lado y suma mucho.", patch: null, act: A_("", 0, [], "Caminá 10 minutos después de comer.", { into: "meal" }) });
        if (g.l >= 1) out.push({ s: 1, t: g.l === 2 ? "Antes de empezar, consultá a un médico por tu molestia" : "Empezá suave y parás si algo duele", why: "Moverte con una molestia pide cuidado.", patch: null, tip: true });
        out.push({ s: 2, t: "Subir la sesión a " + Math.max(dur, 45) + " minutos", why: "Cuando ya te acostumbraste, sumamos un poco más.", patch: function (a) { a.train = Math.max(a.train || 0, dur >= 60 ? 60 : 45); } });
        out.push({ s: 2, t: "Estirar 5 minutos al terminar", why: "Ayuda a recuperarte y a evitar molestias.", patch: ah("move") });
        out.push({ s: 3, t: "Anotar cómo te sentiste en cada sesión", why: "Te muestra tu progreso aunque la balanza o el espejo no cambien.", patch: null, act: A_("Anotar cómo me sentí al entrenar", 5, [["sleep", -100]], "Una frase: energía, ánimo y qué me costó.") });
        out.push({ s: 3, t: "Pensar un objetivo concreto para el mes", why: "Es más fácil sostener algo con una meta.", patch: null, act: A_("Elegir una meta de movimiento para el mes", 10, [["mid", 0]], "Por ejemplo: caminar 4 veces por semana.", { dow: [0], once: false }) });
        return out;
      } },
    { id: "plata", n: "Ordenar mi plata", d: "Saber en qué gastás y armar un presupuesto simple", plan: "plata",
      qs: [
        { k: "p", q: "¿Qué te pasa con la plata?", o: ["No sé en qué gasto", "Llego justo a fin de mes", "Tengo cuotas o deudas", "Quiero ahorrar pero no puedo"] },
        { k: "r", q: "¿Llevás algún registro de tus gastos?", o: ["No", "A veces", "Sí"] },
        { k: "m", q: "¿Cuál es tu meta?", o: ["Ordenarme", "Ahorrar para algo", "Salir de deudas"] },
        { k: "t", q: "¿Cuánto tiempo podés dedicarle?", o: ["5 minutos por día", "5 minutos por día y 15 por semana"] }
      ],
      build: function (g) {
        var out = [];
        out.push({ s: 1, t: "Anotar los gastos del día", why: g.r === 2 ? "Ya llevás un registro: lo hacemos parte del día." : "Anotar es el paso que más ordena. Sin juzgar, solo anotar.", patch: null, act: A_("Anotar los gastos de hoy", 5, [["sleep", -100]], "Todo lo que gastaste hoy, aunque sea poco.") });
        out.push({ s: 1, t: "Anotar tus gastos fijos del mes", why: "Alquiler, servicios, cuotas, suscripciones: la base del presupuesto.", patch: null, act: A_("Anotar mis gastos fijos del mes", 15, [["mid", 0]], "Una lista simple con el monto de cada uno.", { once: true }) });
        out.push({ s: 2, t: "Mirar cuánto gastaste en la semana", why: "Los domingos, 10 minutos para ver adónde se fue la plata.", patch: null, act: A_("Revisar los gastos de la semana", 15, [["mid", 0]], "Sumá por categoría: comida, transporte, salidas, otros.", { dow: [0] }) });
        out.push({ s: 2, t: "Revisar suscripciones y cuotas", why: "Casi todos tenemos alguna que no usamos.", patch: null, act: A_("Revisar suscripciones y cuotas", 15, [["mid", 0]], "¿Cuáles uso? ¿Cuáles puedo dar de baja?", { once: true }) });
        out.push({ s: 3, t: g.m === 2 ? "Elegir una deuda para ir cancelando primero" : "Separar un monto fijo apenas cobrás", why: g.m === 2 ? "Ir de a una es más claro que tratar de todo a la vez." : "Ahorrar lo primero, no lo que sobra.", patch: null, act: A_(g.m === 2 ? "Elegir qué deuda cancelar primero" : "Separar un monto para ahorrar", 10, [["mid", 0]], "Un monto chico que puedas sostener todos los meses.", { once: true }) });
        out.push({ s: 3, t: "Armar tu presupuesto simple del mes", why: "Con 2 semanas de registro ya sabés cuánto gastás de verdad.", patch: ah("plan"), act: A_("Armar mi presupuesto del mes", 20, [["mid", 0]], "Ingresos, gastos fijos, gastos variables y ahorro.", { once: true }) });
        out.push({ s: 1, t: "Forma te ayuda a ordenarte, pero no da asesoramiento financiero", why: "Para decisiones de inversión o deudas grandes, consultá a un profesional", patch: null, tip: true });
        return out;
      } },
    { id: "viaje", n: "Organizar un viaje", d: "Armar el viaje que querés, paso a paso", plan: "viajes",
      qs: [
        { k: "w", q: "¿En qué etapa estás?", o: ["Tengo ganas pero nada definido", "Ya sé adónde, falta organizar", "Ya tengo fecha y destino, faltan los detalles"] },
        { k: "c", q: "¿Con quién viajás?", o: ["Solo", "En pareja", "Con amigos", "En familia"] },
        { k: "b", q: "¿Qué es lo que más te frena?", o: ["La plata", "Elegir el destino", "Organizar los días", "Encontrar el momento"] },
        { k: "t", q: "¿Cuánto tiempo por día podés dedicarle?", o: ["10 minutos", "20 minutos", "30 minutos"] }
      ],
      build: function (g) {
        var out = [], mn = [10, 20, 30][g.t] || 20;
        if (g.w === 0) out.push({ s: 1, t: "Anotar 3 destinos posibles", why: "Es el primer paso para que deje de ser una idea suelta.", patch: null, act: A_("Anotar 3 destinos posibles y por qué", 10, [["mid", 0]], "Sin comparar todavía: solo qué te atrae de cada uno.", { once: true }) });
        if (g.w === 1) out.push({ s: 1, t: "Definir fechas y cuántos días", why: "Con fechas, todo lo demás se ordena.", patch: null, act: A_("Definir las fechas y cuántos días", 15, [["mid", 0]], "Mirá tu calendario y elegí un rango posible.", { once: true }) });
        if (g.w === 2) out.push({ s: 1, t: "Hacer la lista de lo que falta", why: "Pasajes, alojamiento, documentos, seguro: ver todo junto da tranquilidad.", patch: null, act: A_("Hacer la lista de lo que falta reservar", 15, [["mid", 0]], "Pasajes, alojamiento, documentos, seguro y traslados.", { once: true }) });
        out.push({ s: 1, t: "Un bloque corto de viaje por día", why: "De a " + mn + " minutos avanzás sin que se vuelva una tarea gigante.", patch: null, act: A_("Avanzar con el viaje", mn, [["abs", 1140]], "Una sola cosa por vez: buscar, comparar o reservar.") });
        if (g.b === 0) out.push({ s: 2, t: "Armar el presupuesto del viaje", why: "Dijiste que la plata es lo que más frena: ponerle números ayuda.", patch: null, act: A_("Armar el presupuesto del viaje", 20, [["mid", 0]], "Transporte, alojamiento, comidas, actividades y un margen.", { once: true }) });
        if (g.b === 0) out.push({ s: 2, t: "Separar un monto fijo para el viaje", why: "Ahorrar de a poco es más fácil que de golpe.", patch: null, act: A_("Separar plata para el viaje", 5, [["mid", 0]], "Un monto chico y fijo.", { dow: [1] }) });
        if (g.b === 1) out.push({ s: 2, t: "Comparar tus destinos con 3 criterios", why: "Costo, época y qué querés hacer. Así decidís con datos.", patch: null, act: A_("Comparar destinos: costo, época y qué hacer", 20, [["mid", 0]], "Una tabla simple de tres columnas.", { once: true }) });
        if (g.b === 2) out.push({ s: 2, t: "Armar los días de a uno", why: "Un día por vez es más fácil que todo el itinerario.", patch: null, act: A_("Armar un día del itinerario", 20, [["mid", 0]], "Mañana, tarde y noche. Qué es imprescindible y qué opcional.", { dow: [2, 4] }) });
        if (g.b === 3) out.push({ s: 2, t: "Elegir una fecha y bloquearla", why: "Si no la reservás en el calendario, se corre.", patch: null, act: A_("Elegir fecha y bloquearla en el calendario", 10, [["mid", 0]], "Aunque después la muevas.", { once: true }) });
        out.push({ s: 2, t: "Revisar pasajes y alojamiento", why: "Comparar con calma evita decidir apurado.", patch: null, act: A_("Comparar pasajes y alojamiento", 20, [["mid", 0]], "Anotá precio, cancelación y ubicación.", { dow: [6] }) });
        out.push({ s: 3, t: "Reservar lo principal", why: "Con lo grande resuelto, el resto es detalle.", patch: null, act: A_("Reservar pasaje o alojamiento", 20, [["mid", 0]], "Elegí una de las dos para esta semana.", { dow: [3] }) });
        out.push({ s: 3, t: "Lista de documentos y valija", why: "Se arma mejor de a poco que la noche anterior.", patch: null, act: A_("Lista de documentos y valija", 10, [["abs", 1140]], "Documentos, medicación, cargadores, ropa según el clima.", { once: true }) });
        out.push({ s: 3, t: "Dejar todo en una sola nota", why: "Reservas, horarios y direcciones juntas.", patch: ah("plan") });
        return out;
      } },
    { id: "laburo", n: "Buscar trabajo", d: "CV, entrevistas y búsqueda organizada", plan: "laburo",
      qs: [
        { k: "s", q: "¿Cómo estás hoy?", o: ["Sin trabajo y buscando", "Trabajo pero quiero cambiar", "Busco mi primer trabajo", "Quiero ofrecer mis servicios por mi cuenta"] },
        { k: "p", q: "¿Qué es lo que más te cuesta?", o: ["Armar el CV", "Encontrar dónde postularme", "Las entrevistas", "No recibir respuestas", "Empezar"] },
        { k: "h", q: "¿Cuánto tiempo por día podés dedicarle?", o: ["30 minutos", "1 hora", "2 horas", "3 horas o más"] },
        { k: "w", q: "¿Cuándo rendís mejor?", o: ["A la mañana", "A la tarde", "A la noche", "Me da igual"] }
      ],
      build: function (g) {
        var out = [], hrs = [30, 60, 120, 180][g.h] || 60, en = ["am", "pm", "night", "any"][g.w] || "any";
        out.push({ s: 1, t: "Un bloque de " + hrsTxt(hrs) + " por día para tu búsqueda", why: "Buscar trabajo es un trabajo: con horario se sostiene más.", patch: function (a) { var p = (a.prios || []).slice(); if (p.indexOf("income") < 0) { if (p.length >= 3) p.pop(); p.unshift("income"); } a.prios = p; a.free = Math.max(a.free || 0, hrs); a.energy = en; } });
        if (g.p === 0 || g.s === 2) out.push({ s: 1, t: "Armar o actualizar tu CV", why: "Es la base de todo lo demás.", patch: null, act: A_("Armar o actualizar mi CV", 30, [["mid", 0]], "Una página: datos, experiencia o estudios, y lo que sabés hacer.", { once: true }) });
        if (g.p === 1) out.push({ s: 1, t: "Postularte a 3 avisos por día", why: "Constancia gana a esperar el aviso perfecto.", patch: null, act: A_("Postularme a 3 avisos", 30, [["mid", 0]], "Anotá empresa, fecha y puesto en una lista.") });
        if (g.p === 2) out.push({ s: 1, t: "Practicar una entrevista en voz alta", why: "Hablarlo antes te saca nervios.", patch: null, act: A_("Practicar respuestas de entrevista en voz alta", 15, [["mid", 0]], "Contate: quién sos, qué sabés hacer y por qué ese puesto.", { dow: [1, 3, 5] }) });
        if (g.p === 3) out.push({ s: 1, t: "Anotar a quién te postulaste y cuándo", why: "Sin registro no sabés a quién seguir.", patch: null, act: A_("Actualizar la lista de postulaciones", 10, [["mid", 0]], "Empresa, fecha, estado.") });
        if (g.p === 4) out.push({ s: 1, t: "Regla de 10 minutos", why: "Empezar es lo más difícil, no seguir.", patch: null, act: A_("", 0, [], "Regla de 10 minutos: empezá solo 10 y después decidís si seguís.", { into: "focus" }) });
        if (g.s === 3) out.push({ s: 1, t: "Definir qué ofrecés y a quién", why: "Con una frase clara es más fácil que te contraten.", patch: null, act: A_("Escribir en una frase qué ofrezco y a quién", 15, [["mid", 0]], "Servicio, tipo de cliente y precio de referencia.", { once: true }) });
        out.push({ s: 2, t: "Escribirle a 2 personas por día", why: "Muchos trabajos se consiguen por contactos.", patch: null, act: A_("Escribirle a 2 personas del rubro", 15, [["mid", 0]], "Un mensaje corto y concreto: quién sos y qué buscás.", { dow: [1, 2, 3, 4] }) });
        out.push({ s: 2, t: "Perfil de LinkedIn al día", why: "Es lo primero que miran después del CV.", patch: null, act: A_("Actualizar mi perfil de LinkedIn", 20, [["mid", 0]], "Foto, titular y experiencia.", { once: true }) });
        out.push({ s: 2, t: "Seguimiento de lo que mandaste", why: "Un mensaje de seguimiento muchas veces abre la puerta.", patch: null, act: A_("Hacer seguimiento de postulaciones enviadas", 15, [["mid", 0]], "A los 5 a 7 días, un mensaje breve y amable.", { dow: [5] }) });
        out.push({ s: 3, t: "Repasar la semana de búsqueda", why: "Ver qué dio respuestas te dice qué repetir.", patch: null, act: A_("Repasar mi semana de búsqueda", 15, [["mid", 0]], "Cuántas postulaciones, respuestas y qué ajustar.", { dow: [0] }) });
        out.push({ s: 3, t: "Preparar historias para la entrevista", why: "Tener 3 ejemplos listos te da seguridad.", patch: null, act: A_("Preparar 3 historias de logros", 20, [["mid", 0]], "Situación, qué hiciste y qué resultado.", { once: true }) });
        out.push({ s: 3, t: "Cuidar la energía mientras buscás", why: "Buscar cansa: una pausa o salida al día ayuda a sostenerlo.", patch: ah("walk") });
        return out;
      } }
  ];
  function goalById(id) { return GOALS.filter(function (g) { return g.id === id; })[0]; }
  var gs = null;
  function goalStage() { var G = S.goal; return Math.max(1, Math.min(3, (G && G.st) || 1)); }
  function goalChanges() {
    var G = S.goal; if (!G || !S.arm || !S.arm.ans) return [];
    var base = S.arm.ans0 || S.arm.ans, out = [];
    (G.ids || []).forEach(function (id) { var g = goalById(id); if (!g || !g.build) return; var ga = (G.a && G.a[id]) || {}; g.build(ga, base).forEach(function (c, i) { out.push({ id: id + "_" + i, goal: id, s: c.s, t: c.t, why: c.why, patch: c.patch || null, act: c.act || null, tip: !!c.tip }); }); });
    return out;
  }
  function openGoals() {
    close(); var old = $("#full"); if (old) old.remove();
    gs = { st: "pick", sel: ((S.goal && S.goal.ids) || []).slice(), gi: 0, qi: 0, a: JSON.parse(JSON.stringify((S.goal && S.goal.a) || {})), other: (S.goal && S.goal.other) || "" };
    var el = document.createElement("div"); el.className = "full"; el.id = "full"; document.body.appendChild(el); drawGoals();
  }
  function gLive() { return gs.sel.map(goalById).filter(function (g) { return g && g.qs; }); }
  function drawGoals() {
    var el = $("#full"); if (!el || !gs) return;
    if (gs.st === "pick") {
      var cards = GOALS.map(function (g) {
        var on = gs.sel.indexOf(g.id) >= 0, pl = planOf(g.plan);
        return '<button class="plancard gpick" data-gpick="' + g.id + '" aria-pressed="' + on + '" style="--c:' + (pl ? pl.c : "#86A892") + '"><span class="shape">' + (SHAPES[g.plan] || SHAPES.vida) + "</span><span style='flex:1;min-width:0'><b>" + esc(g.n) + "</b><small>" + esc(g.d) + "</small></span>" + (g.soon ? '<span class="tag">Próximamente</span>' : "") + (on ? '<span class="tag ok">✓</span>' : "") + "</button>";
      }).join("");
      el.innerHTML = '<header><button class="btn ghost sm" data-gexit>Salir</button><b>Tu objetivo</b></header><div class="actbar"><i style="width:8%"></i></div><div class="dbody"><h2 style="font-size:26px;margin:0 0 6px">¿Qué querés lograr?</h2><p class="muted small" style="margin:0 0 12px">Elegí hasta 2. Con tu día de hoy como punto de partida, armamos los cambios para llegar ahí, de a poco.</p>' + cards +
        '<label class="field" style="margin-top:12px"><span>¿Otra cosa? <small class="muted" style="font-weight:400">(opcional)</small></span><input id="gother" maxlength="80" placeholder="Contanos qué querés lograr" value="' + esc(gs.other) + '" style="' + fieldCss() + '"></label></div><div class="dfoot"><button class="btn sage block" data-gnext' + (gs.sel.length ? "" : " disabled") + ">Continuar</button></div>";
      return;
    }
    if (gs.st === "q") {
      var L = gLive(), g = L[gs.gi]; if (!g) return gFinish();
      var q = g.qs[gs.qi], tot = 0, dn = 0; L.forEach(function (x, ix) { tot += x.qs.length; if (ix < gs.gi) dn += x.qs.length; }); dn += gs.qi;
      var cur = (gs.a[g.id] || {})[q.k];
      el.innerHTML = '<header><button class="btn ghost sm" data-gexit>Salir</button><b>' + esc(g.n) + '</b></header><div class="actbar"><i style="width:' + Math.round(10 + dn * 90 / tot) + '%"></i></div><div class="dbody"><span class="badge">Pregunta ' + (dn + 1) + " de " + tot + '</span><h2 style="font-size:24px;margin:10px 0 14px">' + esc(q.q) + "</h2>" +
        q.o.map(function (x, j) { return '<button class="btn ' + (cur === j ? "" : "ghost ") + 'block tstopt" data-gopt="' + j + '">' + esc(x) + "</button>"; }).join("") + '</div><div class="dfoot"><button class="btn ghost" data-gback>Atrás</button></div>';
    }
  }
  function gAnswer(j) {
    var L = gLive(), g = L[gs.gi], q = g.qs[gs.qi]; gs.a[g.id] = gs.a[g.id] || {}; gs.a[g.id][q.k] = j;
    if (gs.qi + 1 < g.qs.length) gs.qi++; else { gs.gi++; gs.qi = 0; }
    if (gs.gi >= L.length) return gFinish(); drawGoals();
  }
  function gBack() {
    if (gs.qi > 0) gs.qi--; else if (gs.gi > 0) { gs.gi--; gs.qi = gLive()[gs.gi].qs.length - 1; } else gs.st = "pick";
    drawGoals();
  }
  function gFinish() {
    var oldAns = S.arm && S.arm.ans ? JSON.stringify(S.arm.ans) : null;
    var ids = gs.sel.slice(), a = gs.a, other = gs.other; gs = null;
    S.goal = { ids: ids, a: a, other: other, at: today(), start: today(), rev: today(), st: 1, ap: {} };
    if (S.arm && S.arm.ans) {
      if (!S.arm.ans0) S.arm.ans0 = JSON.parse(oldAns);
      S.goal.apd = {}; goalChanges().forEach(function (c) { if (c.s === 1 && c.patch) { c.patch(S.arm.ans); } if (c.s === 1) { S.goal.ap[c.id] = 1; S.goal.apd[c.id] = today(); } });
    }
    var rec = []; ids.forEach(function (id) { var g = goalById(id); if (g && g.plan && planOf(g.plan) && rec.map(function (r) { return r.id; }).indexOf(g.plan) < 0) rec.push({ id: g.plan, why: "Para tu objetivo: " + g.n.toLowerCase() }); });
    S.test = { a: {}, rec: rec, at: today() }; save(); render();
    var el = $("#full"); if (!el) return;
    var ch = goalChanges(), hasLive = ids.some(function (id) { var g = goalById(id); return g && g.build; });
    var html = '<header><b>Tu plan</b></header><div class="actbar"><i style="width:100%"></i></div><div class="dbody"><h2 style="font-size:26px;margin:0 0 6px">Armamos tu día para lograrlo</h2><p class="muted small" style="margin:0 0 12px">Tu día de hoy es el punto de partida. Los cambios llegan por etapas, de a poco, así se sostienen.</p>';
    ids.forEach(function (id) {
      var g = goalById(id), pl = planOf(g.plan); if (!g) return;
      html += '<div class="card"><div class="row"><span class="shape">' + (SHAPES[g.plan] || SHAPES.vida) + "</span><div><b>" + esc(g.n) + '</b><span class="small muted" style="display:block">' + (g.soon ? "Lo estamos armando. Mientras tanto, tu día ordenado ya es un buen comienzo." : g.go ? "Tenés un plan de entrenamiento para vos." : pl && !pl.live ? "El plan «" + esc(pl.n) + "» viene en camino. Mientras tanto, estos cambios ya van en tu día." : "Plan recomendado: " + esc(pl.n)) + "</span></div></div>";
      if (g.build) {
        [1, 2, 3].forEach(function (st) {
          var L = ch.filter(function (c) { return c.goal === id && c.s === st; }); if (!L.length) return;
          html += '<div class="sec" style="margin:14px 0 4px">' + (st === 1 ? "Esta semana (ya está en tu día)" : "Semana " + st) + "</div>" + L.map(function (c) { return '<div style="padding:6px 0;border-top:1px solid var(--line)"><b class="small">' + esc(c.t) + '</b><span class="small muted" style="display:block">' + esc(c.why) + "</span></div>"; }).join("");
        });
      }
      if (g.plan && planOf(g.plan) && planOf(g.plan).live) html += '<button class="btn ghost block" data-tstplan="' + g.plan + '" style="margin-top:10px">Ver el plan</button>';
      html += "</div>";
    });
    if (hasLive && !isProU()) html += '<div class="card dark"><b>Los cambios de las semanas 2 y 3</b><p class="small" style="margin:6px 0 10px;opacity:.85">Con Vida diaria Pro tu día se va ajustando solo cada semana, y los pasos de cada plan quedan en tu día.</p><button class="btn sage" data-tstplan="vida">Ver Vida diaria Pro</button></div>';
    if (other) html += '<p class="small muted">Anotamos lo que nos contaste: «' + esc(other) + '».</p>';
    el.innerHTML = html + '</div><div class="dfoot"><button class="btn sage block" data-gdone>Ver mi día</button></div>';
  }
  function goalStats() {
    var G = S.goal, n = 0, d = 0; if (!G || !S.arm) return { n: 0, d: 0 };
    for (var i = 0; i < 7; i++) {
      var dt = new Date(); dt.setDate(dt.getDate() - i); var k = today(dt); if (G.rev && k < G.rev) continue;
      armBlocksFor(dt).forEach(function (b) { if (b.goalact) { d++; if (S.ad && S.ad[k] && S.ad[k][armKey(b)]) n++; } });
    }
    return { n: n, d: d };
  }
  function goalDue() { var G = S.goal; return !!(G && !G.fin && G.ids && G.ids.some(function (id) { var g = goalById(id); return g && g.build; }) && daysSince(G.rev || G.start) >= 7); }
  function goalReview() {
    var G = S.goal, st = goalStage(), x = goalStats(), pct = x.d ? x.n / x.d : 1, pro = isProU(), last = st >= 3;
    var msg = !x.d ? "Esta semana no tuviste acciones programadas del objetivo." : "Esta semana hiciste <b>" + x.n + " de " + x.d + "</b> acciones de tu objetivo.";
    var adv = pct >= 0.6 ? "Muy buen ritmo. Estás listo para seguir." : "Está bien: es mejor repetir la semana y que se sostenga, que acelerar y abandonar.";
    return '<div class="card goalcard"><span class="small muted">Revisión de tu objetivo · semana ' + st + " de 3</span><b style=\"display:block;font-size:19px;margin:2px 0 6px\">¿Cómo te fue?</b><p class=\"small\" style=\"margin:0 0 4px\">" + msg + '</p><p class="small muted" style="margin:0 0 12px">' + adv + "</p>" +
      (pro ? '<button class="btn sage block" data-grev="next">' + (last ? "Terminé el plan inicial" : "Pasar a la semana " + (st + 1)) + '</button>' : '<button class="btn block" data-plan="vida">Con Pro seguís con la semana ' + Math.min(3, st + 1) + "</button>") +
      '<button class="btn ghost block" data-grev="hold" style="margin-top:8px">Repetir esta semana</button></div>';
  }
  function goalReviewDo(w) {
    var G = S.goal; if (!G) return; G.rev = today();
    if (w === "next" && isProU()) {
      if (goalStage() >= 3) G.fin = true; else {
        G.st = goalStage() + 1; var a = Object.assign({}, S.arm.ans); G.ap = G.ap || {}; G.apd = G.apd || {};
        goalChanges().forEach(function (c) { if (c.s === G.st) { if (c.patch) c.patch(a); G.ap[c.id] = 1; G.apd[c.id] = today(); } }); S.arm.ans = a;
      }
    }
    save(); render();
  }
  var goalOpen = false;
  function goalCard(compact) {
    if (!S.arm) return "";
    var G = S.goal;
    if (G && G.fin) return '<div class="card goalcard"><div class="row" style="gap:12px;align-items:center">' + stageRing(3) + '<b style="font-size:19px">¡Terminaste tu plan inicial!</b></div><p class="small muted" style="margin:6px 0 10px">Tu día ya incluye todos los cambios. ¿Querés sumar otro objetivo?</p><button class="btn sage sm" data-open="test">Elegir otro objetivo</button></div>';
    if (G && goalDue()) return goalReview();
    if (G && compact && !goalOpen) {
      var d0 = new Date(), nm0 = d0.getHours() * 60 + d0.getMinutes(), nx = null;
      armBlocks().forEach(function (b) { if (b.goalact && b.s >= nm0 && !nx) nx = b; });
      var nms = (G.ids || []).map(function (id) { var g = goalById(id); return g ? g.n : ""; }).filter(Boolean).map(function (n, i) { return i ? n.charAt(0).toLowerCase() + n.slice(1) : n; }).join(" y ");
      return '<div class="card goalcard"><div class="row" style="gap:12px;align-items:center">' + stageRing(goalStage()) + '<div><span class="small muted">Tu objetivo · semana ' + goalStage() + ' de 3</span><b style="display:block;font-size:18px;margin:2px 0 4px">' + esc(nms || "Mi objetivo") + '</b></div></div><p class="small" style="margin:0 0 8px">' + (nx ? "Próxima acción: <b>" + fmtT(nx.s) + " · " + esc(nx.label) + "</b>" : "Hoy no quedan más acciones de tu objetivo.") + '</p><button class="linkbtn small" data-gtoggle>Ver la semana</button></div>';
    }
    if (!G) return '<div class="card testcta" style="margin-top:12px"><b>¿Qué querés lograr?</b><p class="small muted" style="margin:6px 0 10px">Contanos tu objetivo y ajustamos tu día para llegar ahí, de a poco.</p><button class="btn sage sm" data-open="test">Elegir mi objetivo</button></div>';
    var st = goalStage(), ch = goalChanges().filter(function (c) { return c.s <= st; }), names = (G.ids || []).map(function (id) { var g = goalById(id); return g ? g.n : ""; }).filter(Boolean).map(function (n, i) { return i ? n.charAt(0).toLowerCase() + n.slice(1) : n; }).join(" y ");
    var cur = ch.filter(function (c) { return c.s === st; }).sort(function (x, y) { return (x.tip ? 1 : 0) - (y.tip ? 1 : 0); }).slice(0, 4), tbl = armBlocks(), pend = ch.filter(function (c) { return !(G.ap && G.ap[c.id]) && (c.patch || c.act); });
    var pro = isProU();
    var h = '<div class="card goalcard"><div class="row" style="gap:12px;align-items:center;margin-bottom:8px">' + stageRing(st) + '<div><span class="small muted">Tu objetivo · semana ' + st + ' de 3</span><b style="display:block;font-size:19px;margin:2px 0 0">' + esc(names || "Mi objetivo") + "</b></div></div>";
    h += cur.map(function (c) { var ap = G.ap && G.ap[c.id], p = !!(c.patch || c.act), tb = null; tbl.forEach(function (b) { if (b.goalact && b.goalact.split("|")[0] === c.id && !tb) tb = b; }); return '<div class="row" style="align-items:flex-start;gap:10px;padding:7px 0;border-top:1px solid var(--line)"><span style="flex:1"><b class="small">' + (tb ? fmtT(tb.s) + " · " : "") + esc(c.t) + '</b><span class="small muted" style="display:block">' + esc(c.why) + "</span></span>" + (p ? (ap ? '<span class="tag ok">En tu día</span>' : pro ? '<button class="btn sage sm" data-gapply="' + c.id + '">Sumar</button>' : "") : "") + "</div>"; }).join("");
    if (pend.length && !pro) h += '<button class="btn ghost block" data-plan="vida" style="margin-top:10px">Con Pro tu día se ajusta cada semana</button>';
    h += (compact ? '<button class="linkbtn small" data-gtoggle style="margin-top:8px">Ocultar</button> ' : "") + '<button class="linkbtn small" data-open="test" style="margin:8px 0 0 12px">Cambiar mi objetivo</button></div>';
    return h;
  }
  function applyGoalChange(id) {
    if (!isProU()) { return; }
    var c = goalChanges().filter(function (x) { return x.id === id; })[0]; if (!c || !(c.patch || c.act) || !S.arm || !S.arm.ans) return;
    var a = Object.assign({}, S.arm.ans); if (c.patch) c.patch(a); S.arm.ans = a; S.goal.ap = S.goal.ap || {}; S.goal.apd = S.goal.apd || {}; S.goal.ap[id] = 1; S.goal.apd[id] = today(); save(); render();
  }
  function openTest() { return openGoals(); }
  function openTestOld() {
    close(); var old = $("#full"); if (old) old.remove();
    tst = { i: 0, a: {} }; var el = document.createElement("div"); el.className = "full"; el.id = "full"; document.body.appendChild(el); drawTest();
  }
  function drawTest() {
    var el = $("#full"); if (!el || !tst) return;
    var V = testVisible(tst.a);
    if (tst.i >= V.length) return finishTest();
    var q = V[tst.i];
    el.innerHTML = '<header><button class="btn ghost sm" data-tstexit>Salir</button><b>¿Qué plan te conviene?</b></header><div class="actbar"><i style="width:' + Math.round(tst.i * 100 / V.length) + '%"></i></div><div class="dbody"><span class="badge">Pregunta ' + (tst.i + 1) + " de " + V.length + '</span><h2 style="font-size:24px;margin:8px 0 6px">' + esc(q.q) + '</h2><div class="stack" style="margin-top:16px">' +
      q.o.map(function (x, j) { return '<button class="btn ghost block tstopt" data-tstpick="' + j + '">' + esc(x) + "</button>"; }).join("") + '</div></div><div class="dfoot">' + (tst.i ? '<button class="btn ghost" data-tstback>Atrás</button>' : "") + "</div>";
  }
  function finishTest() {
    var rec = testRecs(tst.a); S.test = { a: tst.a, rec: rec, at: today() }; save();
    var el = $("#full"); if (!el) return; tst = null;
    el.innerHTML = '<header><b>Tus planes</b></header><div class="actbar"><i style="width:100%"></i></div><div class="dbody"><h2 style="font-size:26px;margin:0 0 6px">Esto es lo que te conviene</h2><p class="muted small">Según lo que respondiste. Los de vida diaria vienen incluidos en Vida diaria Pro.</p>' +
      rec.map(function (r) { var pl = planOf(r.id); return '<div class="card"><div class="row"><span class="shape">' + SHAPES[r.id] + "</span><div><b>" + esc(pl.n) + '</b><span class="small muted" style="display:block">' + esc(r.why) + '</span></div></div><button class="btn sage block" data-tstplan="' + r.id + '" style="margin-top:10px">' + (pl.live ? "Ver plan" : "Avisarme cuando salga") + "</button></div>"; }).join("") + '</div><div class="dfoot"><button class="btn ghost block" data-tstclose>Cerrar</button></div>';
  }
  function testCard() { return goalCard(); }
  function testCardOld() {
    if (!S.arm) return "";
    if (S.test) return '<div class="card" style="margin-top:12px"><b>Tus planes</b><p class="small muted" style="margin:6px 0 10px">' + recIds().map(function (id) { return planOf(id).n; }).join(", ") + '</p><button class="btn sage sm" data-tab="planes">Ver mis planes</button></div>';
    return '<div class="card testcta" style="margin-top:12px"><b>¿Qué plan te conviene?</b><p class="small muted" style="margin:6px 0 10px">Test de 1 minuto, gratis.</p><button class="btn sage sm" data-open="test">Hacer el test</button></div>';
  }
  function promptTest() { return openGoals(); }
  function promptTestOld() {
    sheet('<h2 style="font-size:24px">¡Tu día está armado!</h2><p class="muted">Lo vas a ver siempre en Hoy. ¿Querés saber qué plan te conviene para sumarle? Es un test de 1 minuto, gratis.</p><button class="btn sage block" data-open="test">Hacer el test</button><button class="btn ghost block" data-close style="margin-top:8px">Ahora no</button>');
  }

  // ---------- armar mañana y prioridad del día ----------
  var showTm = false;
  function tmDate() { var d = new Date(); d.setDate(d.getDate() + 1); return d; }
  function cierreDef() { var a = dayAns(new Date()) || {}, sl = a.sleep || 1380; return Math.max(1080, Math.min(sl - 180, 1260)); }
  function tmThreshold() { return typeof S.cierreAt === "number" ? S.cierreAt : cierreDef(); }
  function mananaCard() {
    if (!isProU() || !S.arm || !S.arm.ans) return "";
    var d = new Date(), now = d.getHours() * 60 + d.getMinutes(); if (now < tmThreshold()) return "";
    if (!(S.cierre && S.cierre[today()]) && !showTm) return "";
    var tm = tmDate(), bl = armBlocksFor(tm), k = today(tm), cur = S.tm && S.tm[k]; if (!bl.length) return "";
    return '<div class="card manana"><b>Mañana, ' + DNL[tm.getDay()].toLowerCase() + '</b><div style="height:10px"></div>' +
      (cur && cur.t ? '<p style="margin:0 0 8px">Tu prioridad: <b>' + esc(cur.t) + '</b> <button class="linkbtn small" data-tmedit>Cambiar</button></p>' :
        '<form id="tmf" class="row"><input id="tmi" maxlength="80" placeholder="¿Qué es lo más importante de mañana?" style="flex:1;min-width:0;' + fieldCss() + '"><button class="btn sage">Dejar</button></form>') +
      '<button class="btn ghost block" data-wkday="' + tm.getDay() + '" data-wkdt="' + k + '" style="margin-top:10px">Ver o cambiar mañana</button></div>';
  }
  function prioCard() {
    var c = isProU() && S.tm && S.tm[today()]; if (!c || !c.t) return "";
    return '<div class="card prio' + (c.d ? " done" : "") + '"><button class="pcheck" data-tmdone aria-pressed="' + !!c.d + '" aria-label="Marcar como hecha"></button><div><span class="small muted">Tu prioridad de hoy · la dejaste anoche</span><b style="display:block;font-size:17px">' + esc(c.t) + "</b></div></div>";
  }

  // ---------- actividades guiadas ----------
  var FAST = false; try { FAST = new URLSearchParams(location.search).get("fast") === "1"; } catch (e) {}
  var ACT_REQ = { movimiento: "energia", foco: "foco", dormir: "dormir", calma: "ansiedad", cierre: "cierre" };
  var ACTS = {
    respirar: { t: "Respiración guiada", note: "Si te mareás, parás y respirás normal.", steps: [
      { t: "Un minuto para bajar un cambio", d: "Inhalá por la nariz mientras la esfera crece y soltá lento por la boca mientras se achica.", s: 60, type: "breath" }] },
    calma: { t: "Respiración para calmar", note: "Es un apoyo de bienestar. No reemplaza a un profesional de la salud.", steps: [
      { t: "Acomodate", d: "Sentate con la espalda apoyada, soltá los hombros y apoyá las manos sin apretar.", s: 20 },
      { t: "Respiración lenta", d: "Inhalá en 4 tiempos y soltá en 6. La exhalación más larga ayuda a bajar el ritmo.", s: 150, type: "breath" },
      { t: "Cerrá con atención", d: "Notá cómo estás ahora. ¿Qué cambió respecto de hace 3 minutos?", s: 20 }] },
    movimiento: { t: "Pausa de movimiento", note: "Hacelo sin dolor. Si algo molesta, salteá ese movimiento con suavidad.", steps: [
      { t: "Cuello", d: "Giros lentos de cabeza a un lado y al otro, sin forzar.", s: 40 },
      { t: "Hombros", d: "Círculos amplios hacia atrás y después hacia adelante.", s: 40 },
      { t: "Columna", d: "Sentado, arqueá la espalda llevando el pecho adelante y redondeala llevando el mentón al pecho, alternando.", s: 45 },
      { t: "Pecho", d: "Manos atrás, entrelazadas, y abrí el pecho. Respirá profundo.", s: 40 },
      { t: "Piernas", d: "De pie, inclinate hacia adelante con las rodillas flojas y dejá caer los brazos.", s: 45 },
      { t: "Cadera", d: "De pie, llevá una rodilla al pecho y cambiá de pierna lentamente.", s: 45 },
      { t: "Cerrá respirando", d: "Parate, inhalá subiendo los brazos y soltá bajándolos. Tres veces.", s: 30 }] },
    foco: { t: "Bloque de foco", note: "Dejá el celular boca abajo y cerrá lo que no necesitás.", steps: [
      { t: "Elegí una sola tarea", d: "¿Qué vas a avanzar en los próximos 25 minutos? Escribila en una frase.", type: "input", ph: "Ej: terminar el informe" },
      { t: "Preparate", d: "Silenciá notificaciones, cerrá pestañas y llená tu vaso de agua.", s: 30 },
      { t: "25 minutos de foco", d: "Trabajá solo en tu tarea. Si te distraés, volvé sin culparte.", s: 1500 },
      { t: "Cerrá el bloque", d: "¿Qué avanzaste? Anotalo en una frase.", type: "input", ph: "Ej: armé el borrador" }] },
    cierre: { t: "Cierre del día", note: "Lo que escribas queda guardado en tu cuenta.", steps: [
      { t: "¿Qué salió bien hoy?", d: "Aunque sea algo chico.", type: "input", ph: "Hoy salió bien..." },
      { t: "¿Qué quedó pendiente?", d: "Anotalo para soltarlo. Mañana se retoma.", type: "input", ph: "Quedó pendiente...", opt: true },
      { t: "Tus 3 prioridades de mañana", d: "Tres cosas, no más.", type: "input", ph: "1) ... 2) ... 3) ..." },
      { t: "Respirá y cerrá", d: "Tres respiraciones lentas. El día terminó.", s: 20, type: "breath" }] },
    dormir: { t: "Rutina para dormir", note: "Si tenés problemas de sueño persistentes, consultá a un profesional.", steps: [
      { t: "Bajá las luces y las pantallas", d: "Dejá el celular fuera de la cama y bajá la luz de la habitación.", s: 60 },
      { t: "Estiramiento suave", d: "Sentado en el borde de la cama, llevá el pecho hacia las rodillas y quedate ahí respirando.", s: 90 },
      { t: "Exhalación larga", d: "Inhalá en 4 y soltá en 6, sin apuro.", s: 180, type: "breath" },
      { t: "Soltá lo pendiente", d: "Si hay algo que no querés olvidar, anotalo. Si no, seguí.", type: "input", ph: "Para mañana...", opt: true },
      { t: "Listo para descansar", d: "Apagá la luz. Mañana arrancamos de nuevo.", s: 15 }] },
    descarga: { t: "Descarga mental", note: "Lo que escribas queda guardado en tu cuenta.", steps: [
      { t: "Sacalo de la cabeza", d: "Escribí lo que te da vueltas, sin ordenar y sin juzgar.", type: "input", ph: "Me da vueltas..." },
      { t: "¿Algo para mañana?", d: "Si hay algo que podés hacer, anotá solo el primer paso. Si no, dejalo ir.", type: "input", ph: "Mañana voy a...", opt: true },
      { t: "Soltá", d: "Respirá lento: inhalá en 4 y soltá en 6. Ya está anotado, no hace falta recordarlo.", s: 45, type: "breath" }] },
    antesabrir: { t: "Antes de abrir el celular", steps: [
      { t: "Pará un momento", d: "Antes de desbloquear, respirá lento. Inhalá y soltá.", s: 20, type: "breath" },
      { t: "¿Para qué lo abrís?", d: "Escribilo en una frase. Si no sabés, ya es una respuesta.", type: "input", ph: "Lo abro para..." },
      { t: "Decidí", d: "Si es algo concreto, hacelo y cerrá. Si no, dejalo y volvé a lo que estabas haciendo.", s: 10 }] },
    pausacel: { t: "Pausa sin celular", steps: [
      { t: "Dejalo lejos", d: "Ponelo en otra habitación o dado vuelta, fuera de tu alcance.", s: 15 },
      { t: "10 minutos sin celular", d: "Caminá, tomá agua, mirá por la ventana o estirá. Lo que quieras, menos el celular.", s: 600 },
      { t: "¿Cómo te sentís?", d: "Anotá en una frase qué hiciste y cómo te sentís.", type: "input", ph: "Hice... y me siento...", opt: true }] },
    dosmin: { t: "Regla de los 2 minutos", steps: [
      { t: "¿Qué vas a empezar?", d: "Elegí algo que venís postergando.", type: "input", ph: "Tengo que..." },
      { t: "El primer paso diminuto", d: "El más chico posible: abrir el archivo, juntar los papeles.", type: "input", ph: "Primer paso..." },
      { t: "2 minutos, solo eso", d: "Hacé ese primer paso. Nada más. Después podés parar.", s: 120 },
      { t: "¿Seguís?", d: "Si querés seguir, seguí. Si no, está bien: ya empezaste.", s: 10 }] },
    grounding: { t: "5-4-3-2-1", note: "Es un apoyo de bienestar. No reemplaza a un profesional de la salud.", steps: [
      { t: "5 cosas que ves", d: "Mirá alrededor y nombrá cinco cosas que ves.", type: "input", ph: "Veo..." },
      { t: "4 que tocás, 3 que escuchás", d: "Nombrá cuatro cosas que tocás y tres que escuchás.", type: "input", ph: "Toco... Escucho..." },
      { t: "Respirá", d: "Dos cosas que olés y una que saboreás. Después, tres respiraciones lentas.", s: 40, type: "breath" }] },
    estudio: { t: "Bloque de estudio", note: "Dejá el celular fuera de tu vista.", steps: [
      { t: "¿Qué vas a estudiar?", d: "Un solo tema, en una frase.", type: "input", ph: "Hoy estudio..." },
      { t: "Preparate", d: "Material a mano, celular lejos y agua cerca.", s: 30 },
      { t: "25 minutos de estudio", d: "Solo ese tema. Si te distraés, volvé sin culparte.", s: 1500 },
      { t: "Recordá sin mirar", d: "Sin mirar el material, escribí todo lo que te acuerdes del tema.", type: "input", ph: "Me acuerdo de..." },
      { t: "Pausa de verdad", d: "Caminá o tomá agua, sin celular.", s: 300 }] },
    repaso: { t: "Repaso activo", steps: [
      { t: "¿Qué vas a repasar?", d: "Un tema que viste hace uno o dos días.", type: "input", ph: "Repaso..." },
      { t: "Escribí lo que recordás", d: "Sin mirar el material, todo lo que te acuerdes.", type: "input", ph: "Me acuerdo de..." },
      { t: "¿Qué no pudiste recordar?", d: "Eso es lo que hay que repasar primero.", type: "input", ph: "No me acuerdo de...", opt: true }] },
    organizar: { t: "Organizá tu día", steps: [] }
  };

  // ---------- herramientas: se usan solas o se agregan a tu día ----------
  var TOOLS = [
    { id: "respirar", n: "Respiración guiada", d: "Un minuto para bajar un cambio.", act: "respirar", plan: "vida", mins: 5, free: true },
    { id: "movimiento", n: "Pausa de movimiento", d: "5 minutos de movimiento guiado, sin equipamiento.", act: "movimiento", plan: "vida", gate: "vida", mins: 10 },
    { id: "cierre", n: "Cierre del día guiado", d: "Repasá tu día, soltá lo pendiente y dejá armado mañana.", act: "cierre", plan: "vida", gate: "vida", mins: 10 },
    { id: "dormir", n: "Rutina para dormir", d: "10 minutos para bajar el ritmo antes de acostarte.", act: "dormir", plan: "dormir", gate: "vida", mins: 15 },
    { id: "descarga", n: "Descarga mental", d: "Sacá de la cabeza lo que te da vueltas antes de dormir.", act: "descarga", plan: "dormir", mins: 10 },
    { id: "antesabrir", n: "Antes de abrir el celular", d: "Un freno de 1 minuto: respirás y decidís para qué lo abrís.", act: "antesabrir", plan: "celular", mins: 5 },
    { id: "pausacel", n: "Pausa sin celular", d: "10 minutos lejos del celular, con un cierre corto.", act: "pausacel", plan: "celular", mins: 15 },
    { id: "foco", n: "Bloque de foco", d: "25 minutos con una sola tarea, con intención y cierre.", act: "foco", plan: "arrancar", gate: "vida", mins: 30 },
    { id: "dosmin", n: "Regla de los 2 minutos", d: "Para arrancar lo que venís postergando: un paso diminuto.", act: "dosmin", plan: "arrancar", mins: 10 },
    { id: "calma", n: "Respiración para calmar", d: "3 minutos de respiración lenta para bajar la tensión.", act: "calma", plan: "calma", gate: "vida", mins: 10 },
    { id: "grounding", n: "5-4-3-2-1", d: "Volvé al presente cuando la cabeza se acelera.", act: "grounding", plan: "calma", mins: 10 },
    { id: "estudio", n: "Bloque de estudio", d: "25 minutos de estudio y recuerdo activo, con pausa.", act: "estudio", plan: "estudio", mins: 35 },
    { id: "repaso", n: "Repaso activo", d: "Repasá recordando sin mirar: lo que te falta es lo que hay que estudiar.", act: "repaso", plan: "estudio", mins: 15 }
  ];
  function toolById(id) { return TOOLS.filter(function (t) { return t.id === id; })[0]; }
  function toolByAct(a) { return TOOLS.filter(function (t) { return t.act === a; })[0]; }
  function planOwned(id) { var p = planOf(id); if (!p) return false; return p.prog ? pgOwns(id) : isPro(id); }
  function toolOk(T) { return !!(T.free || (T.gate === "vida" ? isProU() : planOwned(T.plan))); }
  function toolsOf(pid) { return TOOLS.filter(function (t) { return t.plan === pid; }); }
  function toolRow(T) {
    var ok = toolOk(T), pl = planOf(T.plan);
    return '<button class="prod" data-tl="' + T.id + '"><span class="shape">' + SHAPES[T.plan] + "</span><span style='flex:1;min-width:0'><b>" + esc(T.n) + "</b><small>" + esc(T.d) + '</small></span><span class="tag' + (ok ? " ok" : "") + '">' + (ok ? (T.free ? "Gratis" : "Tuya") : "Con " + esc(T.gate === "vida" ? "Vida diaria Pro" : pl.n)) + "</span></button>";
  }
  function toolsCard() {
    if (!S.arm) return "";
    var n = TOOLS.filter(toolOk).length;
    return '<button class="prod toolscard" data-open="tools"><span class="shape">' + SHAPES.calma + '</span><span style="flex:1;min-width:0"><b>Herramientas</b><small>Para usar cuando las necesites · ' + n + " disponibles</small></span></button>";
  }
  function vTools() {
    var h = '<h1 class="hello">Herramientas</h1><p class="small muted" style="margin:0 0 6px">Usalas cuando las necesites o agregalas a tu día en un horario libre.</p>';
    PLANS.forEach(function (p) { var L = toolsOf(p.id); if (!L.length) return; h += '<div class="sec">' + esc(p.n) + "</div>" + L.map(toolRow).join(""); });
    return h;
  }
  function openTools() {
    var h = '<h2 style="font-size:24px;margin:0 0 4px">Herramientas</h2><p class="small muted" style="margin:0 0 6px">Usalas cuando las necesites o agregalas a tu día en un horario libre.</p>';
    PLANS.forEach(function (p) { var L = toolsOf(p.id); if (!L.length) return; h += '<div class="sec">' + esc(p.n) + "</div>" + L.map(toolRow).join(""); });
    sheet(h + '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function openTool(id) {
    var T = toolById(id); if (!T) return; var ok = toolOk(T), pl = planOf(T.plan), A = ACTS[T.act];
    sheet('<div class="row"><span class="shape">' + SHAPES[T.plan] + '</span><div><span class="badge">Herramienta · ' + esc(pl.n) + '</span><h2 style="font-size:22px;margin-top:4px">' + esc(T.n) + '</h2></div></div><p style="margin:14px 0">' + esc(T.d) + "</p>" +
      '<div class="card"><b>Qué vas a hacer</b><ol class="small" style="margin:8px 0 0;padding-left:18px">' + A.steps.map(function (x) { return "<li>" + esc(x.t) + (x.s ? " <span class='muted'>(" + (x.s >= 60 ? Math.round(x.s / 60) + " min" : x.s + " s") + ")</span>" : "") + "</li>"; }).join("") + "</ol></div>" +
      (ok ? '<button class="btn sage block" data-act="' + T.act + '" style="margin-top:12px">Usar ahora</button>' + (isProU() ? '<button class="btn ghost block" data-xtadd="' + T.id + '" style="margin-top:8px">Agregar a mi día</button>' : '<p class="small muted" style="margin:10px 0 0">Agregarla a tu día es parte de Vida diaria Pro.</p>')
        : '<div class="card dark" style="margin-top:12px"><b>' + (T.gate === "vida" ? "Es parte de Vida diaria Pro" : "Es parte del plan " + esc(pl.n)) + '</b><p class="small" style="margin:6px 0 10px;opacity:.85">Con el plan la usás cuando quieras y la sumás a tu día.</p><button class="btn sage" data-plan="' + (T.gate === "vida" ? "vida" : pl.id) + '">Ver el plan</button></div>') +
      '<button class="btn ghost block" data-close style="margin-top:8px">Cerrar</button>');
  }
  function xtFree(b) { return b.kind === "free" || (b.kind === "rest" && b.label === "Ocio y descanso"); }
  var xtd = { w: "hoy" };
  function xtSlots(T) {
    var out = [], bl = armBlocks(), F = window.FormaDia;
    bl.forEach(function (b) { if (!xtFree(b)) return; for (var t = b.s; t + T.mins <= b.e && out.length < 60; t += 15) out.push(t); });
    return out;
  }
  function openXtAdd(id) {
    var T = toolById(id); if (!T || !isProU()) return; var F = window.FormaDia, sl = xtSlots(T); xtd = { w: "hoy", id: id, n: false };
    if (!sl.length) { sheet('<h2 style="font-size:22px">No hay un hueco libre</h2><p class="muted">Hoy no tenés ' + T.mins + " minutos libres seguidos en tu día. Podés cambiar tu día desde Mi semana y volver a intentarlo.</p>" + '<button class="btn ghost block" data-close>Cerrar</button>'); return; }
    sheet('<h2 style="font-size:22px">Agregar a mi día</h2><p class="muted small">' + esc(T.n) + " · reservamos " + T.mins + ' minutos en un horario libre. No se agrega solo: lo elegís vos.</p><label class="field"><span>¿A qué hora?</span><select id="xts" style="' + fieldCss() + '">' + sl.map(function (t) { return '<option value="' + t + '">' + F.fmt(t) + "</option>"; }).join("") + '</select></label>' +
      '<div class="chips" style="margin:6px 0 14px"><button class="chip" data-xtw="hoy" aria-pressed="true">Solo hoy</button><button class="chip" data-xtw="todos" aria-pressed="false">Todos los días</button></div><p class="small muted" style="margin:0 0 10px">Si elegís todos los días, aparece los días en que ese horario esté libre.</p><button class="chip" data-xtn aria-pressed="false" style="margin-bottom:12px">Avisarme a esa hora</button><button class="btn sage block" data-xtok>Agregar</button><button class="btn ghost block" data-close style="margin-top:8px">Cancelar</button>');
  }
  function goalApply(bl, dt) {
    var G = S.goal; if (!G || !G.ap || !bl.length) return bl;
    var k = today(dt), dow = dt.getDay(), out = bl.slice(), wake = bl[0].s, sleep = bl[bl.length - 1].e;
    goalChanges().forEach(function (c) {
      if (!c.act || !G.ap[c.id]) return; var x = c.act;
      if (x.dow && x.dow.indexOf(dow) < 0) return;
      if (x.once) { var ad = G.apd && G.apd[c.id]; if (!ad) return; var df = Math.round((new Date(k + "T00:00:00") - new Date(ad + "T00:00:00")) / 864e5); if (df < 0 || df > 2) return; }
      if (x.into) {
        var ix = -1; out.forEach(function (b, i) { if (ix < 0 && (x.into === "first" ? i === 0 : b.kind === x.into)) ix = i; }); if (ix < 0) return;
        var b0 = out[ix]; if ((b0.note || "").indexOf(x.note) >= 0) return; out[ix] = Object.assign({}, b0, { note: (b0.note ? b0.note + " " : "") + x.note }); return;
      }
      (x.at || []).forEach(function (at, ai) {
        var t0 = at[0] === "wake" ? wake + at[1] : at[0] === "sleep" ? sleep + at[1] : at[0] === "mid" ? Math.round((wake + sleep) / 10) * 5 + at[1] : at[1];
        var best = -1, bs = 0, bd = 1e9;
        out.forEach(function (b, i) { if (!xtFree(b) || b.e - b.s < x.m) return; var st = Math.max(b.s, Math.min(t0, b.e - x.m)), d = Math.abs(st - t0); if (d < bd) { bd = d; best = i; bs = st; } });
        if (best < 0 || bd > 180) return;
        var f = out[best], parts = [], lb = bs - f.s, la = f.e - bs - x.m; if (lb > 0 && lb < 10) bs = f.s; else if (la > 0 && la < 10) bs = f.e - x.m;
        if (f.s < bs) parts.push(Object.assign({}, f, { e: bs }));
        parts.push({ s: bs, e: bs + x.m, kind: "habit", label: x.l, note: x.note, goalact: c.id + "|" + ai }); if (f.e > bs + x.m) parts.push(Object.assign({}, f, { s: bs + x.m }));
        out.splice.apply(out, [best, 1].concat(parts));
      });
    });
    return out;
  }
  function xtApply(bl, dt) { return goalApply(xtApply0(bl, dt), dt); }
  function xtApply0(bl, dt) {
    var k = today(dt), xs = (S.xt || []).filter(function (x) { return !x.del && (!x.d || x.d === k); }).sort(function (a, b) { return a.s - b.s; });
    if (!xs.length) return bl; var out = bl.slice();
    xs.forEach(function (x) {
      var T = toolById(x.tool); if (!T) return; var s0 = x.s, e0 = x.s + T.mins, ix = -1;
      out.forEach(function (b, i) { if (ix < 0 && xtFree(b) && b.s <= s0 && b.e >= e0) ix = i; }); if (ix < 0) return;
      var f = out[ix], parts = []; if (f.s < s0) parts.push(Object.assign({}, f, { e: s0 }));
      parts.push({ s: s0, e: e0, kind: "habit", label: T.n, note: T.d, tool: T.act, xt: x.id }); if (f.e > e0) parts.push(Object.assign({}, f, { s: e0 }));
      out.splice.apply(out, [ix, 1].concat(parts));
    });
    return out;
  }
  var act = null;
  function stopBreath() { if (act && act.tm) clearInterval(act.tm); act = null; }
  function actKey(tool) { return tool === "respirar" ? "respirar" : tool === "organizar" ? "organizar" : (tool || "").indexOf("act:") === 0 ? tool.slice(4) : ""; }
  function gated(h) { return !!h.tool && !!actKey(h.tool); }
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return pad(Math.floor(s / 60)) + ":" + pad(s % 60); }
  function startAct(key) {
    if (key === "organizar") return openOrganizar();
    var A = ACTS[key]; if (!A) return;
    var TT = toolByAct(key); if (TT ? !toolOk(TT) : (ACT_REQ[key] && !isProU())) return openPlan(TT && TT.gate !== "vida" ? TT.plan : "vida");
    close();
    act = { key: key, i: 0, vals: [], tm: null, end: 0 };
    var el = document.createElement("div"); el.className = "full"; el.id = "full"; document.body.appendChild(el);
    drawStep();
  }
  function drawStep() {
    var el = $("#full"); if (!el || !act) return;
    if (act.tm) clearInterval(act.tm);
    var A = ACTS[act.key], st = A.steps[act.i], last = act.i === A.steps.length - 1;
    var secs = st.s ? (FAST ? Math.min(st.s, 3) : st.s) : 0;
    act.end = secs ? Date.now() + secs * 1000 : 0; act.secs = secs; act.phase = "";
    el.innerHTML = '<header><button class="btn ghost sm" data-actexit>Salir</button><b>' + esc(A.t) + '</b></header>' +
      '<div class="actbar"><i style="width:' + Math.round(act.i * 100 / A.steps.length) + '%"></i></div>' +
      '<div class="actbody"><span class="badge">Paso ' + (act.i + 1) + " de " + A.steps.length + "</span><h2>" + esc(st.t) + '</h2><p class="muted">' + esc(st.d) + "</p>" +
      (st.type === "breath" ? '<div class="breath"><div class="orb" id="orb">Inhalá</div></div>' : "") +
      (secs ? '<div class="count" id="count">' + mmss(secs * 1000) + "</div>" : "") +
      (st.type === "input" ? '<textarea id="act-in" rows="4" maxlength="400" placeholder="' + esc(st.ph || "") + '"></textarea>' : "") +
      (act.i === 0 && A.note ? '<p class="small muted">' + esc(A.note) + "</p>" : "") +
      '<button class="btn block" id="actnext" disabled>' + (last ? "Terminar" : "Siguiente") + "</button></div>";
    if (secs) act.tm = setInterval(tickAct, 250);
    tickAct();
  }
  function tickAct() {
    if (!act) return;
    var A = ACTS[act.key], st = A.steps[act.i], rem = act.end ? act.end - Date.now() : 0;
    var c = $("#count"); if (c) c.textContent = mmss(rem);
    var orb = $("#orb");
    if (orb && rem > 0) {
      var el = (act.secs * 1000 - rem) % 10000, ph = el < 4000 ? "in" : "out";
      if (ph !== act.phase) { act.phase = ph; orb.textContent = ph === "in" ? "Inhalá" : "Soltá"; orb.style.transition = "transform " + (ph === "in" ? 4 : 6) + "s ease-in-out"; orb.style.transform = ph === "in" ? "scale(1.35)" : "scale(1)"; }
    } else if (orb) { orb.textContent = "Bien"; orb.style.transform = "scale(1)"; }
    if (rem <= 0 && act.tm) { clearInterval(act.tm); act.tm = null; }
    updateNext();
  }
  function updateNext() {
    var b = $("#actnext"); if (!b || !act) return;
    var st = ACTS[act.key].steps[act.i], timeOk = !act.end || Date.now() >= act.end;
    var inOk = st.type !== "input" || st.opt || ($("#act-in") && $("#act-in").value.trim().length > 0);
    b.disabled = !(timeOk && inOk);
  }
  function nextStep() {
    if (!act) return;
    var A = ACTS[act.key], st = A.steps[act.i];
    if (st.type === "input") act.vals.push({ q: st.t, a: ($("#act-in").value || "").trim() });
    if (act.i < A.steps.length - 1) { act.i++; drawStep(); } else finishAct();
  }
  function finishAct() {
    var key = act.key, A = ACTS[key], vals = act.vals;
    if (act.tm) clearInterval(act.tm);
    if (vals.length) { S.notes = S.notes || {}; S.notes[today()] = S.notes[today()] || {}; S.notes[today()][key] = vals; }
    var marked = completeAct(key); pgActDone(key); S.actn = (S.actn || 0) + 1; touchBest(); save();
    var n = weekCount(0), el = $("#full"); act = null; if (!el) return;
    el.innerHTML = '<div class="actbody" style="text-align:center;padding-top:80px"><div class="bigflame on" style="margin:0 auto 10px;width:70px;height:70px">' + ICON.flame + '</div><h2>¡Actividad completa!</h2><p class="muted">' + esc(A.t) + " hecha de verdad. " + (marked ? "Quedó tildada en tu día." : "") + '</p><p><b style="font-size:28px">' + n + "</b>/7 días con algo hecho esta semana</p>" + '<button class="btn block" data-actdone>Volver a mi día</button></div>';
  }
  function completeAct(key) {
    var t = today(), hs = activeHabits().filter(function (h) { return gated(h) && actKey(h.tool) === key && !h.days[t]; });
    if (hs.length) { hs[0].days[t] = 1; return true; }
    var ab = armBlocks().filter(function (b) { return armCheckable(b) && armToolOf(b) === key && !armDone(b); })[0];
    if (!ab) return false;
    S.ad = S.ad || {}; S.ad[t] = S.ad[t] || {}; S.ad[t][armKey(ab)] = 1; return true;
  }
  function openRespirar() { startAct("respirar"); }

  // ---------- acciones ----------
  function setMsg(t, ok) { var m = $("#amsg"); if (m) { m.textContent = t; m.style.color = ok ? "var(--sage-d)" : "var(--err)"; } }
  function val(id) { var e = $("#" + id); return e ? e.value : ""; }
  function readAuthDraft() {
    var a = $("#a-name"), u = $("#a-user"), e = $("#a-email"), t = $("#a-terms");
    if (a) draft.name = a.value; if (u) draft.username = u.value; if (e) draft.email = e.value; if (t) draft.terms = t.checked;
  }
  function doRegister() {
    readAuthDraft();
    var name = draft.name.trim(), uname = draft.username.trim().replace(/^@/, "").toLowerCase(), email = draft.email.trim(), pass = val("a-pass");
    if (!name) return setMsg("Escribí tu nombre.");
    if (FLUJO) { S.profile = { name: name, email: "", areas: [], sports: [], created: today(), done: true }; S.guest = true; S.demo = PRUEBA ? !PFREE : new URLSearchParams(location.search).get("pro") === "1"; save(); tab = "hoy"; render(); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(uname)) return setMsg("El usuario tiene que tener de 3 a 20 caracteres: letras sin tilde, números o guion bajo.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg("Revisá el email.");
    if (pass.length < 8) return setMsg("La contraseña tiene que tener al menos 8 caracteres.");
    if (!draft.terms) return setMsg("Tenés que aceptar los términos y la política de privacidad.");
    var btn = $("#a-register"); btn.disabled = true; setMsg("Creando tu cuenta...", true);
    sb.rpc("username_available", { u: uname }).then(function (r) {
      if (r.error) throw r.error;
      if (r.data === false) { btn.disabled = false; return setMsg("Ese nombre de usuario ya está en uso. Elegí otro."); }
      return sb.auth.signUp({ email: email, password: pass, options: { data: { username: uname, name: name } } }).then(function (res) {
        if (res.error) { btn.disabled = false; return setMsg(authMsg(res.error)); }
        acct.username = uname;
        S.profile = { name: name, email: email, username: uname, areas: [], sports: [], created: today(), done: false };
        if (res.data && res.data.session) {
          user = res.data.session.user; S.guest = false; save(); render();
          loadRemote().then(function () { render(); });
        } else {
          btn.disabled = false; setMsg("¡Listo! Te mandamos un mail para confirmar tu cuenta. Después volvé acá e iniciá sesión.", true);
        }
        postLead(email, "app-cuenta");
      });
    }).catch(function (e) { btn.disabled = false; setMsg(authMsg(e)); });
  }
  function doLogin() {
    readAuthDraft();
    var email = draft.email.trim(), pass = val("a-pass");
    if (!/^\S+@\S+\.\S+$/.test(email) || !pass) return setMsg("Completá tu email y tu contraseña.");
    var btn = $("#a-login"); btn.disabled = true; setMsg("Entrando...", true);
    sb.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
      if (res.error) { btn.disabled = false; return setMsg(authMsg(res.error)); }
      user = res.data.user; return loadRemote().then(function () { tab = "hoy"; render(); });
    }).catch(function (e) { btn.disabled = false; setMsg(authMsg(e)); });
  }
  function doForgot() {
    readAuthDraft();
    var email = draft.email.trim(); if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg("Revisá el email.");
    sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(function () {
      setMsg("Si ese email tiene una cuenta, te mandamos un link para elegir una contraseña nueva.", true);
    }, function (e) { setMsg(authMsg(e)); });
  }
  function doRecovery() {
    var p = val("r-pass"); if (p.length < 8) return setMsg("La contraseña tiene que tener al menos 8 caracteres.");
    sb.auth.updateUser({ password: p }).then(function (res) {
      if (res.error) return setMsg(authMsg(res.error));
      setMsg("Contraseña actualizada.", true); mode = "login"; setTimeout(function () { history.replaceState(null, "", location.pathname); render(); }, 900);
    });
  }
  function doLogout() {
    var go = function () {
      user = null; acct = { username: "" }; S = blank(); try { localStorage.removeItem(KEY); } catch (e) {}
      mode = "login"; tab = "hoy"; sync.state = "off"; render();
    };
    if (sb) sb.auth.signOut().then(go, go); else go();
  }
  function addHabit(name, time) {
    name = (name || "").trim(); if (!name) return;
    if (activeHabits().length >= habitLimit()) { render(); return; }
    S.habits.push({ id: "h" + Date.now(), name: name.slice(0, 60), time: /^\d\d:\d\d$/.test(time || "") ? time : "", freq: 7, min: "", days: {} }); save(); render();
  }


  // ---------- armado del día (el mismo de la página) ----------
  var ARMTOOL = { "Pausa y respiración": "respirar", "Desconectar y dormir": "dormir", "Meditar y respirar": "calma", "Moverme y estirar": "movimiento", "Planificar el día siguiente": "cierre", "Escribir un diario": "cierre" };
  function dayAns(dt) { dt = dt || new Date(); var dd = S.dd && S.dd[today(dt)]; if (dd && dd.ans) return dd.ans; var w = S.wk && S.wk[dt.getDay()]; return w && w.ans ? w.ans : (S.arm && S.arm.ans) || null; }
  function armBlocksFor(dt) { try { var a = dayAns(dt); return a && window.FormaDia ? xtApply(window.FormaDia.plan(a).blocks, dt || new Date()) : []; } catch (e) { return []; } }
  function armBlocks() { return armBlocksFor(new Date()); }
  // ---------- mi semana ----------
  var DNL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], DNS = ["D", "L", "M", "M", "J", "V", "S"];
  function weekDates() { var d = new Date(), k = (d.getDay() + 6) % 7, m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - k); return [0, 1, 2, 3, 4, 5, 6].map(function (i) { return new Date(m.getFullYear(), m.getMonth(), m.getDate() + i); }); }
  function ddCustom(dt) { var k = today(dt), x = S.dd && S.dd[k]; return !!(x && x.ans); }
  function wkCustom(dow) { return !!(S.wk && S.wk[dow] && S.wk[dow].ans); }
  function weekSumData() {
    var days = [], wins = [], tot = 0, DN = ["D", "L", "M", "M", "J", "V", "S"];
    for (var i = 6; i >= 0; i--) { var dt = new Date(); dt.setDate(dt.getDate() - i); var k = today(dt), lv = S.cierre && S.cierre[k] ? ((S.cierreL && S.cierreL[k]) || 1) : 0; if (lv) tot++; days.push({ n: DN[dt.getDay()], lv: lv, k: k }); ((S.wins && S.wins[k]) || []).forEach(function (w) { if (wins.length < 3) wins.push(w); }); }
    return { days: days, closed: tot, active: weekCount(0), g: goalStats(), wins: wins, streak: cierreStreak() };
  }
  function openWeekSum() {
    var D = weekSumData(), nm = (S.profile && S.profile.name) || "";
    var shapes = '<div class="row" style="justify-content:space-between;margin:12px 0">' + D.days.map(function (d, i) { return '<div style="text-align:center"><div style="height:34px">' + (d.lv ? shapeSvg(d.lv, SHCOL[i % 6], 34) : '<svg viewBox="0 0 24 24" width="34" height="34"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="3 3"/></svg>') + '</div><small class="muted">' + d.n + "</small></div>"; }).join("") + "</div>";
    var lines = '<div class="card"><div class="row between"><span>Días que cerraste</span><b>' + D.closed + " de 7</b></div>" +
      '<div class="row between" style="margin-top:8px"><span>Días con algo hecho</span><b>' + D.active + " de 7</b></div>" +
      (S.goal && D.g.d ? '<div class="row between" style="margin-top:8px"><span>Acciones de tu objetivo</span><b>' + D.g.n + " de " + D.g.d + "</b></div>" : "") +
      (D.streak > 1 ? '<div class="row between" style="margin-top:8px"><span>Racha de cierres</span><b>' + D.streak + " días</b></div>" : "") + "</div>";
    var wl = D.wins.length ? '<div class="card"><b>Lo que hiciste bien</b>' + D.wins.map(function (w) { return '<p class="small" style="margin:6px 0 0">• ' + esc(w) + "</p>"; }).join("") + "</div>" : "";
    var msg = D.closed >= 5 ? "Semana muy sólida. Eso es constancia." : D.closed >= 3 ? "Buena semana. Tres o más cierres ya arman un hábito." : D.closed >= 1 ? "Algo es más que nada. Sumá un día más la semana que viene." : "Esta semana fue tranquila. Lo importante es volver.";
    sheet('<h2 style="font-size:24px;margin:0 0 4px">Tu semana' + (nm ? ", " + esc(nm) : "") + '</h2><p class="muted small" style="margin:0">' + msg + "</p>" + shapes + lines + wl + '<button class="btn ghost block" data-close style="margin-top:14px">Listo</button>');
  }
  function weekSumCard() {
    if (!isProU() || !S.arm) return "";
    var dw = new Date().getDay(); if (dw !== 0 && dw !== 1) return "";
    return '<div class="card"><div class="row between"><div><b>Tu semana</b><span class="small muted" style="display:block">Mirá cómo te fue y qué cerraste.</span></div><button class="btn sage sm" data-open="wsum">Ver resumen</button></div></div>';
  }
  function weekCard() {
    if (!isProU() || !S.arm || !S.arm.ans) return "";
    var t = today(), n = weekDates().filter(function (d) { return wkCustom(d.getDay()); }).length;
    return '<div class="card weekc"><div class="row between"><b>Mi semana</b><button class="linkbtn small" data-open="wsum">Ver resumen</button></div><div class="wkstrip">' +
      weekDates().map(function (d) { var c = wkCustom(d.getDay()) || ddCustom(d); return '<button class="wkd' + (today(d) === t ? " today" : "") + (c ? " custom" : "") + '" data-wkday="' + d.getDay() + '" data-wkdt="' + today(d) + '" aria-label=""' + DNL[d.getDay()] + ' ' + d.getDate() + '"><small>' + DNS[d.getDay()] + "</small><b>" + d.getDate() + "</b><i></i></button>"; }).join("") +
      '</div></div>';
  }
  function wkDate(dow) { return weekDates().filter(function (d) { return d.getDay() === dow; })[0]; }
  function openWeekDay(dow, dt) {
    var F = window.FormaDia, d = dt || wkDate(dow), k = today(d), bl = armBlocksFor(d), one = ddCustom(d), cu = wkCustom(dow), pl = DNL[dow].toLowerCase() + (/s$/.test(DNL[dow]) ? "" : "s");
    sheet('<span class="badge">' + (one ? "Cambiado solo para este día" : cu ? "Armado para los " + pl : "Tu día base") + '</span><h2 style="font-size:24px;margin:8px 0 2px">' + DNL[dow] + " " + d.getDate() + '</h2><p class="small muted" style="margin:0 0 10px">' + (one ? "El resto de los " + pl + " no cambia." : cu ? "Se repite todos los " + pl + "." : "Es el día que armaste con el test.") + "</p>" +
      '<div class="wklist">' + bl.map(function (b) { var K = F.KIND[b.kind]; return '<div class="wkrow"><span class="wkt">' + F.fmt(b.s) + '</span><i style="background:' + K.dot + '"></i><span>' + esc(b.label) + "</span></div>"; }).join("") + "</div>" +
      '<button class="btn sage block" data-ddedit="' + k + '" style="margin-top:14px">Cambiar solo este día</button>' +
      (one ? '<button class="btn ghost block" data-ddreset="' + k + '" style="margin-top:8px">Volver a mi día base</button>' : "") +
      '<button class="btn ghost block" data-wkedit="' + dow + '" style="margin-top:8px">' + (cu ? "Cambiar todos los " + pl : "Armar todos los " + pl + " distinto") + "</button>" +
      (cu ? '<button class="btn ghost block" data-wkreset="' + dow + '" style="margin-top:8px">Todos los ' + pl + ' vuelven al día base</button>' : "") +
      '<div class="sec" style="margin-top:16px">Copiar este día a</div><div class="wkto">' + [1, 2, 3, 4, 5, 6, 0].filter(function (x) { return x !== dow; }).map(function (x) { return '<button class="chip" data-wkto="' + x + '" aria-pressed="false">' + DNL[x].slice(0, 3) + "</button>"; }).join("") + '</div>' +
      '<button class="btn ghost block" data-wkcopy="' + dow + '" style="margin-top:8px">Copiar</button><button class="btn ghost block" data-close style="margin-top:8px">Cerrar</button>');
  }
  function ddEdit(k) {
    if (!window.FormaDia || !isProU()) return;
    var q = k.split("-"), dt = new Date(+q[0], +q[1] - 1, +q[2]), base = dayAns(dt); close();
    window.FormaDia.open({ title: "Armá " + (k === today() ? "tu día de hoy" : DNL[dt.getDay()].toLowerCase() + " " + dt.getDate()), ans: base, onSave: function (a) { S.dd = S.dd || {}; S.dd[k] = { ans: a, at: today() }; save(); tab = "hoy"; render(); window.scrollTo(0, 0); } });
  }
  function ddReset(k) { S.dd = S.dd || {}; S.dd[k] = { ans: null, at: today() }; save(); close(); render(); }
  function wkEdit(dow) {
    if (!window.FormaDia || !isProU()) return;
    var base = dayAns(wkDate(dow)); close();
    window.FormaDia.open({ title: "Armá tu " + DNL[dow].toLowerCase(), ans: base, onSave: function (a) { S.wk = S.wk || {}; S.wk[dow] = { ans: a, at: today() }; save(); tab = "hoy"; render(); window.scrollTo(0, 0); } });
  }
  function wkReset(dow) { S.wk = S.wk || {}; S.wk[dow] = { ans: null, at: today() }; save(); close(); render(); }
  function wkCopy(src) {
    var to = [].slice.call(document.querySelectorAll("#sheet [data-wkto][aria-pressed=true]")).map(function (b) { return +b.dataset.wkto; }); if (!to.length) return;
    var a = dayAns(wkDate(src)), cu = wkCustom(src); S.wk = S.wk || {};
    to.forEach(function (x) { S.wk[x] = { ans: cu ? JSON.parse(JSON.stringify(a)) : null, at: today() }; });
    save(); close(); render();
  }
  function armKey(b) { return b.kind + "|" + b.label + "|" + b.s; }
  function armCheckable(b) { return b.kind === "train" || b.kind === "focus" || b.kind === "habit" || b.kind === "pause" || (b.kind === "rest" && b.label.indexOf("Desconectar") === 0); }
  function bchips(b) { var d = bdetails(b); if (!d.length) return ""; return '<span class="bchips">' + d.slice(0, 3).map(function (x) { return "<em>" + esc(x) + "</em>"; }).join("") + (d.length > 3 ? "<em>+" + (d.length - 3) + "</em>" : "") + "</span>"; }
  function armToolOf(b) { return b.tool || ARMTOOL[b.label] || (b.kind === "train" ? "movimiento" : b.kind === "focus" ? "foco" : ""); }
  function armDone(b) { return !!(S.ad && S.ad[today()] && S.ad[today()][armKey(b)]); }
  function armOpen(ans) {
    if (!window.FormaDia) { alert("No se pudo cargar el armado. Revisá tu conexión y recargá."); return; }
    if (S.arm && !(S.demo || isPro("vida"))) { sheet('<h2 style="font-size:22px">Cambiar tu día es Pro</h2><p class="muted">Tu día gratis queda fijo como lo armaste. Con Vida diaria Pro lo podés cambiar cuando cambie tu vida, tildarlo y recibir avisos.</p><button class="btn block" data-plan="vida">Ver Vida diaria Pro</button><button class="btn ghost block" data-close style="margin-top:8px">Cerrar</button>'); return; }
    close();
    var pre = ans ? Object.assign({}, ans) : null; if (pre && typeof S.cierreAt === "number") pre.closeAt = S.cierreAt;
    window.FormaDia.open({ ans: pre, onSave: function (a) { var first = !S.arm; if (typeof a.closeAt === "number") { S.cierreAt = a.closeAt; } S.arm = { ans: a, at: today(), ans0: S.arm && S.arm.ans0 }; if (!S.arm.ans0) delete S.arm.ans0; save(); tab = "hoy"; render(); window.scrollTo(0, 0); if (first && !S.goal) setTimeout(openGoals, 350); } });
  }
  function armSection() {
    var bl = armBlocks();
    if (!bl.length) return '<div class="card dark"><b>Armemos tu día</b><p class="small" style="margin:6px 0 12px;opacity:.85">Respondé 12 preguntas rápidas y te armamos el día en bloques con horarios: lo fijo, lo importante, tus hábitos y tus pausas. Queda siempre acá, en Hoy.</p><button class="btn sage" id="armgo">Armar mi día</button></div>';
    var d = new Date(), now = d.getHours() * 60 + d.getMinutes(), wake = bl[0].s; if (now < wake && now + 1440 < bl[bl.length - 1].e) now += 1440;
    var tr = bl.filter(armCheckable), n = tr.filter(armDone).length, pro = S.demo || isPro("vida");
    var html = '<div class="row between" style="margin:22px 0 6px"><span class="sec" style="margin:0">Tu día</span>' + (pro ? '<button class="linkbtn small" id="armedit">Cambiar mis respuestas</button>' : "") + '</div>' +
      (pro && tr.length ? '<p class="small muted" style="margin:0 0 6px">' + n + " de " + tr.length + " momentos hechos hoy</p>" : "") +
      '<div class="legend"><span><i class="lg past"></i>Ya pasó</span><span><i class="lg now"></i>Ahora</span><span><i class="lg next"></i>Lo que sigue</span></div><div class="tl">';
    bl.forEach(function (b) {
      var k = window.FormaDia.KIND[b.kind], ck = armCheckable(b), dn = armDone(b), isNow = now >= b.s && now < b.e, st = isNow ? "now" : now >= b.e ? "past" : "next", pgw = isNow ? Math.round((now - b.s) * 100 / (b.e - b.s)) : 0, tk = armToolOf(b), tbtn = "";
      if (pro && tk && ck && !dn) {
        var TTk = toolByAct(tk), locked = TTk ? !toolOk(TTk) : (ACT_REQ[tk] && !isProU());
        tbtn = '<button class="btn ' + (locked ? "ghost" : "sage") + ' sm" data-armtool="' + tk + '" style="margin-top:8px">' + (locked ? ICON.lock.replace("<svg", '<svg width="14" height="14"') + " Con Pro" : "Hacer ahora") + "</button>";
      }
      html += '<div class="blk ' + st + (dn ? " done" : "") + '"><div class="tm">' + window.FormaDia.fmt(b.s) + "<br>" + window.FormaDia.fmt(b.e) + '</div><div class="bd" role="button" tabindex="0" data-blkopen="' + bl.indexOf(b) + '"><b>' + esc(b.label) + '</b>' + bchips(b) + (isNow ? '<span class="pg"><i style="width:' + pgw + '%"></i></span>' : "") + tbtn + "</div>" +
        (pro && ck ? '<button class="check" role="checkbox" aria-checked="' + dn + '" aria-label="' + esc(b.label) + '" data-ack="' + esc(armKey(b)) + '">' + ICON.ok + "</button>" : "") + "</div>";
    });
    return html + "</div>";
  }




  // ---------- apariencia (oscuro / claro) ----------
  function curTheme() { return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("forma_theme", t); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "dark" ? "#121211" : "#F5F1E8");
    render();
  }
  function themeCard() {
    var t = curTheme();
    return '<div class="card"><b>Apariencia</b><p class="small muted" style="margin:4px 0 0">Elegí cómo querés ver Forma.</p><div class="seg themeseg"><button data-settheme="dark" aria-pressed="' + (t === "dark") + '">Oscuro</button><button data-settheme="light" aria-pressed="' + (t === "light") + '">Claro</button></div></div>';
  }


  // ---------- nivel de constancia (formas) ----------
  var LEVELS = [
    { n: "Círculo", at: 0, svg: '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="#C6F432"/></svg>' },
    { n: "Semicírculo", at: 4, svg: '<svg viewBox="0 0 44 44"><path d="M2 36 A20 20 0 0 1 42 36 Z" fill="#B9A7F0"/></svg>' },
    { n: "Cuadrado", at: 10, svg: '<svg viewBox="0 0 44 44"><rect x="3" y="3" width="38" height="38" fill="#FFC83D"/></svg>' },
    { n: "Triángulo", at: 20, svg: '<svg viewBox="0 0 44 44"><path d="M22 3 L41 41 H3 Z" fill="#FF8A4C"/></svg>' },
    { n: "Cuarto de círculo", at: 35, svg: '<svg viewBox="0 0 44 44"><path d="M2 2 A40 40 0 0 1 42 42 H2 Z" fill="#4C7DFF"/></svg>' },
    { n: "Forma completa", at: 55, svg: '<svg viewBox="0 0 44 44"><path d="M3 22 A19 19 0 0 1 22 3 H41 V22 A19 19 0 0 1 22 41 H3 Z" fill="#86A892"/></svg>' }
  ];
  function goodWeeksTotal() { var n = 0; for (var off = 0; off > -104; off--) { if (weekCount(off) >= 3) n++; } return n; }
  function levelInfo() {
    var gw = goodWeeksTotal(), acts = S.actn || 0, pts = gw * 4 + acts, i = 0;
    LEVELS.forEach(function (l, k) { if (pts >= l.at) i = k; });
    var cur = LEVELS[i], nxt = LEVELS[i + 1] || null;
    return { i: i, cur: cur, nxt: nxt, pts: pts, gw: gw, acts: acts, pct: nxt ? Math.round((pts - cur.at) * 100 / (nxt.at - cur.at)) : 100 };
  }
  function levelCard() {
    var L = levelInfo(), pro = isProU();
    return '<div class="card"><div class="row"><span class="lvshape">' + L.cur.svg + '</span><div style="flex:1;min-width:0"><span class="small muted">Tu nivel de constancia</span><div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:22px;line-height:1.1">' + L.cur.n + '</div></div><span class="tag">Nivel ' + (L.i + 1) + "</span></div>" +
      '<span class="bar" style="--c:var(--sage);margin-top:12px"><i style="width:' + L.pct + '%"></i></span>' +
      '<p class="small muted" style="margin:8px 0 0">' + (L.nxt ? (L.nxt.at - L.pts === 1 ? "Te falta 1 punto" : "Te faltan " + (L.nxt.at - L.pts) + " puntos") + " para ser " + L.nxt.n + "." : "Llegaste a la forma completa.") + "</p>" +
      '<p class="small muted" style="margin:6px 0 0">Suben las semanas con 3 o más días de constancia (' + L.gw + ') y las actividades guiadas que hacés completas (' + L.acts + "). Tildar no suma por sí solo.</p>" +
      (pro ? "" : '<p class="small" style="margin:8px 0 0"><button class="linkbtn" data-plan="vida">Con Vida diaria Pro empezás a subir de nivel</button></p>') + "</div>";
  }
  var CIERRE_MSG = [
    ["Hoy fue un día tranquilo. Lo importante es que volviste.", "Un día suave también cuenta. Mañana seguimos.", "No siempre se puede todo. Hoy sumaste igual."],
    ["Buen día. Hiciste lo que pudiste y eso se nota.", "Avanzaste. Un paso chico por día es como se arma lo grande.", "Día cumplido. Descansá tranquilo."],
    ["¡Qué día! Casi todo en su lugar.", "Hoy le diste forma a tu día de verdad.", "Día redondo. Esto es lo que se repite y cambia la vida."]
  ];
  function cierreStats() {
    var list = compToday(), n = list.filter(compDone).length, bl = armBlocks().filter(armCheckable), nb = bl.filter(armDone).length, tot = list.length + bl.length, done = n + nb, pct = tot ? Math.round(done * 100 / tot) : 0;
    var pr = S.tm && S.tm[today()], pd = !!(pr && pr.t && pr.d);
    return { n: n, nl: list.length, nb: nb, nbl: bl.length, tot: tot, done: done, pct: pct, lvl: pct >= 80 ? 3 : pct >= 40 ? 2 : 1, prio: pr && pr.t ? pr : null, pd: pd };
  }
  function cierreStreak() {
    var c = 0, d = new Date(); if (!(S.cierre && S.cierre[today(d)])) d.setDate(d.getDate() - 1);
    while (S.cierre && S.cierre[today(d)] && c < 400) { c++; d.setDate(d.getDate() - 1); }
    return c;
  }
  function cierreCard() {
    if (!isProU() || !S.arm || !S.arm.ans) return "";
    var d = new Date(), now = d.getHours() * 60 + d.getMinutes(), th = tmThreshold(), t = today(), st = cierreStats();
    if (S.cierre && S.cierre[t]) {
      return '<div class="card sage"><b>Día cerrado</b><p class="small" style="margin:6px 0 0">' + (st.done ? "Hoy cumpliste " + st.done + " de " + st.tot + ". Eso cuenta, y mucho." : "Hoy fue un día más tranquilo. Lo importante es que volviste.") + ' Mañana seguimos.</p>'+((S.wins&&S.wins[t]&&S.wins[t].length)?'<p class="small" style="margin:8px 0 0"><b>Lo que hiciste bien hoy:</b> '+S.wins[t].slice(0,4).map(esc).join(" · ")+"</p>":"")+'<button class="linkbtn small" data-cmes style="margin-top:6px">Ver mi mes</button></div>';
    }
    if (now < th && now >= 360) return '<div class="card"><div class="row between"><span class="small muted">Cierre del día a las ' + window.FormaDia.fmt(th) + '</span><button class="linkbtn small" data-cierreat>Cambiar hora</button></div></div>';
    return '<div class="card dark"><b>Cierre del día</b><p class="small" style="margin:6px 0 10px;opacity:.85">Mirá cómo te fue y llevate tu forma de hoy.</p><button class="btn sage" id="cierre">Cerrar mi día</button> <button class="linkbtn small" data-tmshow style="margin-left:8px">Dejar armado mañana</button><div style="margin-top:8px"><button class="linkbtn small" data-cierreat>Cambiar hora del cierre</button></div></div>';
  }
  function openCierreAt() {
    var th = tmThreshold(), v = ("0" + Math.floor(th / 60)).slice(-2) + ":" + ("0" + (th % 60)).slice(-2);
    sheet('<h2 style="font-size:22px">¿A qué hora querés cerrar tu día?</h2><p class="muted small">A esa hora te aparece el cierre y te llega el aviso. Elegí un momento en que ya estés más tranquilo.</p><input id="cat" type="time" value="' + v + '" style="width:100%;margin:8px 0 14px;' + fieldCss() + '"><button class="btn sage block" data-cierreok>Guardar</button><button class="btn ghost block" data-close style="margin-top:8px">Cancelar</button>');
  }
  function shapeSvg(lvl, c, sz) {
    var b = '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" aria-hidden="true">';
    return b + (lvl >= 3 ? '<circle cx="12" cy="12" r="11" fill="' + c + '"/>' : lvl === 2 ? '<rect x="2" y="2" width="20" height="20" rx="7" fill="' + c + '"/>' : '<path d="M2 12 A10 10 0 0 1 22 12 Z" fill="' + c + '"/>') + "</svg>";
  }
  var SHCOL = ["#86A892", "#C6F432", "#4C7DFF", "#FFC83D", "#FF8A4C", "#B9A7F0"];
  function monthGrid(hl) {
    var n = new Date(), y = n.getFullYear(), m = n.getMonth(), first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate(), cnt = 0, h = "";
    for (var i = 0; i < off; i++) h += "<span></span>";
    for (var dd = 1; dd <= dim; dd++) {
      var k = today(new Date(y, m, dd)), v = S.cierre && S.cierre[k], fut = dd > n.getDate();
      if (v) cnt++;
      h += '<span class="mcell' + (hl && dd === n.getDate() ? " pop" : "") + '">' + (v ? shapeSvg(v === 1 && !(S.cierreL && S.cierreL[k]) ? 1 : (S.cierreL && S.cierreL[k]) || 1, SHCOL[dd % 6], 26) : '<i class="' + (fut ? "fut" : "") + '"></i>') + "</span>";
    }
    return { html: '<div class="mgrid">' + ["L", "M", "M", "J", "V", "S", "D"].map(function (x) { return "<small>" + x + "</small>"; }).join("") + h + "</div>", n: cnt };
  }
  function openCierre(ph) {
    var old = $("#full"); if (old) old.remove();
    var el = document.createElement("div"); el.className = "full"; el.id = "full"; document.body.appendChild(el);
    var st = cierreStats(), msgs = CIERRE_MSG[st.lvl - 1], msg = msgs[new Date().getDate() % msgs.length], C = 2 * Math.PI * 52;
    if (ph === "reward") {
      var g = monthGrid(true), sk = cierreStreak();
      el.innerHTML = '<header><b>Tu forma de hoy</b></header><div class="dbody" style="text-align:center"><div class="rwd">' + shapeSvg(st.lvl, SHCOL[new Date().getDate() % 6], 110) + '</div><h2 style="font-size:26px;margin:14px 0 6px">' + (sk > 1 ? sk + " días cerrados seguidos" : "Día cerrado") + '</h2><p class="muted">' + esc(msg) + '</p><div class="card" style="text-align:left;margin-top:16px"><b>Tu mes en formas</b><span class="small muted" style="display:block;margin:2px 0 10px">' + g.n + (g.n === 1 ? " día cerrado" : " días cerrados") + ' este mes</span>' + g.html + '</div></div><div class="dfoot"><button class="btn sage block" data-cierrefin>Listo</button><button class="btn ghost block" data-cierrefin="tm" style="margin-top:8px">Dejar armado mañana</button></div>';
      return;
    }
    el.innerHTML = '<header><button class="btn ghost sm" data-cierrefin="x">Volver</button><b>Cierre del día</b></header><div class="dbody" style="text-align:center"><div class="cring"><svg viewBox="0 0 120 120" width="150" height="150"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(128,128,128,.25)" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="var(--sage)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - st.pct / 100)).toFixed(1) + '" transform="rotate(-90 60 60)" class="ringfill"/></svg><b>' + st.pct + '%</b></div>' +
      '<h2 style="font-size:24px;margin:12px 0 4px">' + esc(msg) + '</h2><div class="chips" style="justify-content:center;margin:12px 0">' + (st.nbl ? '<span class="chip on">Tu día: ' + st.nb + "/" + st.nbl + "</span>" : "") + (st.nl ? '<span class="chip on">Compromisos: ' + st.n + "/" + st.nl + "</span>" : "") + (st.prio ? '<span class="chip on">Prioridad: ' + (st.pd ? "hecha" : "pendiente") + "</span>" : "") + '</div>' +
      '<label class="field" style="text-align:left"><span>Una cosa que salió bien hoy <small class="muted" style="font-weight:400">(opcional)</small></span><input id="cwin" maxlength="80" placeholder="Aunque sea algo chiquito" style="' + fieldCss() + '"></label></div><div class="dfoot"><button class="btn sage block" data-cierreok2>Cerrar mi día</button></div>';
  }
  function doCierre() {
    var tdz = today(), st = cierreStats(); S.wins = S.wins || {}; var wl = S.wins[tdz] = S.wins[tdz] || [];
    compToday().filter(compDone).forEach(function (x) { if (wl.indexOf(x) < 0 && wl.length < 8) wl.push(x); });
    var w = $("#cwin"); if (w && w.value.trim() && wl.length < 8) wl.push(w.value.trim());
    S.cierre = S.cierre || {}; S.cierre[tdz] = 1; S.cierreL = S.cierreL || {}; S.cierreL[tdz] = st.lvl; save(); render(); openCierre("reward");
  }

  // ---------- vista "Ahora" (bloque actual en grande) ----------
  var moreOpen = false;
  function viewMode() { try { return localStorage.getItem("forma_view") === "day" ? "day" : "now"; } catch (e) { return "now"; } }
  function viewToggle() {
    var v = viewMode();
    return '<div class="seg themeseg" style="margin:10px 0 14px"><button data-setview="now" aria-pressed="' + (v === "now") + '">Ahora</button><button data-setview="day" aria-pressed="' + (v === "day") + '">Día completo</button></div>';
  }
  function nowSection() {
    var bl = armBlocks(); if (!bl.length) return armSection();
    var d = new Date(), now = d.getHours() * 60 + d.getMinutes(); if (now < bl[0].s && now + 1440 < bl[bl.length - 1].e) now += 1440;
    var i = -1, state = "now"; bl.forEach(function (b, k) { if (now >= b.s && now < b.e) i = k; });
    if (i < 0) { bl.forEach(function (b, k) { if (i < 0 && b.s > now) i = k; }); if (i >= 0) state = "soon"; else { i = bl.length - 1; state = "end"; } }
    var b = bl[i], K = window.FormaDia.KIND[b.kind], pro = isProU(), ck = armCheckable(b), dn = armDone(b), tk = armToolOf(b), det = bdetails(b), F = window.FormaDia;
    var when = state === "now" ? "Ahora · faltan " + F.durText(Math.max(1, b.e - now)) : state === "soon" ? "Empieza a las " + F.fmt(b.s) + " · en " + F.durText(Math.max(1, b.s - now)) : "Último momento de tu día";
    var html = '<div class="bignow ' + state + (dn ? " done" : "") + '">' + (dn ? '<span class="kd">Hecho ✓</span>' : "") +
      '<div class="bwhen">' + F.fmt(b.s) + " – " + F.fmt(b.e) + '</div><h2>' + esc(b.label) + '</h2>' +
      (state === "now" ? '<span class="pg big"><i style="width:' + Math.round((now - b.s) * 100 / (b.e - b.s)) + '%"></i></span>' : "") +
      (det.length ? '<div class="bchips big">' + det.map(function (x) { return "<em>" + esc(x) + "</em>"; }).join("") + "</div>" : "") +
      '<div class="bbtns">' +
      (pro && ck && tk && !dn ? '<button class="btn block" data-armtool="' + tk + '">Hacer ahora</button>' : "") +
      (pro && ck ? '<button class="btn ' + (dn ? "ghost" : "") + ' block" data-ackb="' + i + '">' + (dn ? "Marcar como no hecho" : "Marcar como hecho") + "</button>" : "") +
      '<button class="linkbtn bdet" data-blkopen="' + i + '">' + (pro ? "Detalles" : "Ver detalle") + "</button></div></div>";
    var nb = bl[i + 1];
    if (nb) html += '<button class="nextprev" data-blkopen="' + (i + 1) + '"><span class="small muted">Sigue</span><b>' + F.fmt(nb.s) + " · " + esc(nb.label) + "</b></button>";
    return html;
  }

  // ---------- compromisos de hoy y detalles por bloque ----------
  function isProU() { return !!(S.demo || isPro("vida")); }
  function compPool() {
    var a = (S.arm && S.arm.ans) || {}, doy = dayOfYear(), W = [], P = [], H = [], G = [];
    if (a.waste === "phone") W = ["Celular lejos durante las comidas", "No mirar redes la primera hora del día", "Dejar el celular cargando fuera del cuarto"];
    else if (a.waste === "procrastinate") W = ["Empezar lo más difícil con solo 10 minutos", "Hacer primero lo que más me cuesta"];
    else if (a.waste === "buffer") W = ["Dejar un margen sin planear para los imprevistos"];
    var HM = { read: "Leer 10 páginas", breathe: "Respirar 5 minutos con calma", move: "Moverme 10 minutos", write: "Escribir 3 líneas antes de dormir", learn: "Aprender una cosa nueva", walk: "Caminar 15 minutos", plan: "Dejar listo el día de mañana" };
    (a.habits || []).forEach(function (k) { if (HM[k]) H.push(HM[k]); });
    var PM = { health: "Tomar agua en cada comida", family: "Escribirle o llamar a alguien que quiero", care: "Pedir ayuda con una tarea", projects: "Dar un paso chico a mi proyecto", sport: "Practicar 15 minutos de mi deporte", study: "Estudiar 25 minutos sin interrupciones", income: "Hacer una acción que mueva mi trabajo", home: "Ordenar una sola cosa de casa", rest: "Hacer algo que me guste, sin culpa" };
    (a.prios || []).forEach(function (k) { if (PM[k]) P.push(PM[k]); });
    G = ["Tomar un vaso de agua al despertar", "Salir a tomar aire 10 minutos", "Acostarme a la hora que planeé", "Comer una vez sin pantallas", "Agradecer una cosa antes de dormir"];
    var groups = [W, P, H, G].map(function (g) { var r = doy % (g.length || 1); return g.slice(r).concat(g.slice(0, r)); }), out = [], i = 0, more = true;
    while (more) { more = false; groups.forEach(function (g) { if (g[i] !== undefined) { more = true; if (out.indexOf(g[i]) < 0) out.push(g[i]); } }); i++; }
    return out;
  }
  function compToday() { return [];
  }
  function compToday_old() {
    var c = S.comp && S.comp[today()]; if (c && c.length) return c.slice(0, 3);
    return compPool().slice(0, 3);
  }
  function compDone(txt) { return !!(S.ad && S.ad[today()] && S.ad[today()]["c|" + txt]); }
  function compCard() {
    var list = compToday(), pro = isProU(); if (!list.length) return "";
    var n = list.filter(compDone).length;
    return '<div class="card comp"><div class="row between"><b>Tus compromisos de hoy</b>' + (pro ? '<span class="small muted">' + n + "/" + list.length + ' <button class="linkbtn small" id="compedit" style="margin-left:6px">Cambiar</button></span>' : "") + "</div>" +
      
      list.map(function (t, i) {
        return pro ? '<div class="habit" style="padding:8px 0"><button class="check" role="checkbox" aria-checked="' + compDone(t) + '" aria-label="' + esc(t) + '" data-cack="' + i + '">' + ICON.ok + '</button><span style="flex:1;min-width:0' + (compDone(t) ? ";text-decoration:line-through;opacity:.6" : "") + '">' + esc(t) + "</span></div>"
          : '<div class="cfree"><i></i><span>' + esc(t) + "</span></div>";
      }).join("") + "</div>";
  }
  var compDraft = null;
  function openComp() {
    var pool = compPool(); compDraft = { sel: compToday().slice(), pool: pool.slice(0, 10) };
    drawComp();
  }
  function drawComp() {
    var cd = compDraft; if (!cd) return;
    var all = cd.pool.concat(cd.sel.filter(function (x) { return cd.pool.indexOf(x) < 0; }));
    sheet('<h2 style="font-size:22px">Tus compromisos de hoy</h2><p class="small muted">Elegí hasta 3. Menos es más: si te propones mucho, el día se vuelve una carga.</p><div class="chips" style="margin:10px 0">' +
      all.map(function (t, i) { return '<button class="chip" data-compsel="' + i + '" aria-pressed="' + (cd.sel.indexOf(t) >= 0) + '">' + esc(t) + "</button>"; }).join("") + "</div>" +
      '<form id="compf" class="row"><input id="compown" maxlength="80" placeholder="O escribí el tuyo" style="flex:1;min-width:0;' + fieldCss() + '"><button class="btn sage">Sumar</button></form><div class="msg" id="compmsg"></div>' +
      '<button class="btn block" id="compsave">Guardar (' + cd.sel.length + " de 3)</button><button class=\"btn ghost block\" data-close style=\"margin-top:8px\">Cancelar</button>");
    cd.all = all;
  }
  function bkey(b) { return b.kind + "|" + b.label; }
  function bdetails(b) { return (S.bn && S.bn[bkey(b)]) || []; }
  function openBlock(i) {
    var bl = armBlocks(), b = bl[i]; if (!b) return;
    var k = window.FormaDia.KIND[b.kind], pro = isProU(), det = bdetails(b), tk = armToolOf(b), ck = armCheckable(b);
    sheet('<span class="badge">' + k.tag + " · " + window.FormaDia.fmt(b.s) + " a " + window.FormaDia.fmt(b.e) + '</span><h2 style="font-size:24px;margin:8px 0 4px">' + esc(b.label) + "</h2>" + (b.note ? '<p class="muted">' + esc(b.note) + "</p>" : "") +
      '<div class="sec" style="margin-top:14px">Tus detalles para este momento</div>' +
      (det.length ? det.map(function (x, j) { return '<div class="row between" style="padding:7px 0;border-top:1px solid var(--line)"><span>' + esc(x) + "</span>" + (pro ? '<button class="linkbtn small" data-bndel="' + i + ":" + j + '">Quitar</button>' : "") + "</div>"; }).join("") : '<p class="small muted" style="margin:0 0 6px">' + (pro ? "Anotá lo que querés incluir: por ejemplo, tomar creatina, un jugo de naranja o ver a alguien." : "Todavía no hay detalles.") + "</p>") +
      (pro ? (det.length < 8 ? '<form id="bnf" data-i="' + i + '" class="row" style="margin-top:8px"><input id="bn" maxlength="80" placeholder="Agregar un detalle" style="flex:1;min-width:0;' + fieldCss() + '"><button class="btn sage">Sumar</button></form>' : "") +
        '<p class="small muted" style="margin:8px 0 0">Se repite todos los días en este momento.</p>' +
        (b.xt ? '<button class="btn ghost block" data-xtdel="' + b.xt + '" style="margin-top:8px">Sacar de mi día</button>' : "") +
        (ck && tk && !armDone(b) ? '<button class="btn sage block" data-armtool="' + tk + '" style="margin-top:12px">Hacer ahora (actividad guiada)</button>' : "") +
        (ck ? '<button class="btn block" data-ackb="' + i + '" style="margin-top:8px">' + (armDone(b) ? "Marcar como no hecho" : "Marcar como hecho") + "</button>" : "")
        : '<div class="card dark" style="margin-top:12px"><b>Poné tus propios detalles con Pro</b><p class="small" style="margin:6px 0 10px;opacity:.85">Agregá a cada momento lo que querés que no se te olvide.</p><button class="btn sage" data-plan="vida">Ver Vida diaria Pro</button></div>') +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }

  // ---------- Pro: lo que hice bien y pendientes ----------
  function winsCard() {
    var w = (S.wins && S.wins[today()]) || [];
    return '<div class="card"><b>Lo que hice bien hoy</b><p class="small muted" style="margin:4px 0 8px">Anotá cosas chicas o grandes. Mirarlas de noche cambia cómo cerrás el día.</p>' +
      w.map(function (x, i) { return '<div class="row between" style="padding:6px 0;border-top:1px solid var(--line)"><span>' + esc(x) + '</span><button class="linkbtn small" data-delwin="' + i + '" aria-label="Quitar">Quitar</button></div>'; }).join("") +
      (w.length < 8 ? '<form id="winf" class="row" style="margin-top:8px"><input id="win" maxlength="120" placeholder="Hoy me salió bien..." style="flex:1;min-width:0;' + fieldCss() + '"><button class="btn sage">Sumar</button></form>' : "") + "</div>";
  }
  function todoCard() {
    var t = today(), list = (S.todo || []).filter(function (x) { return !x.done || x.doneAt === t; });
    return '<div class="card"><b>Cosas que tengo que hacer</b><p class="small muted" style="margin:4px 0 8px">Tus pendientes. Se quedan hasta que los tildes.</p>' +
      list.map(function (x) { return '<div class="habit" style="padding:8px 0"><button class="check" role="checkbox" aria-checked="' + !!x.done + '" aria-label="' + esc(x.t) + '" data-todock="' + x.id + '">' + ICON.ok + '</button><span style="flex:1;min-width:0' + (x.done ? ";text-decoration:line-through;opacity:.6" : "") + '">' + esc(x.t) + '</span><button class="linkbtn small" data-tododel="' + x.id + '">Quitar</button></div>'; }).join("") +
      '<form id="todof" class="row" style="margin-top:8px"><input id="todo" maxlength="120" placeholder="Algo que tengo que hacer" style="flex:1;min-width:0;' + fieldCss() + '"><button class="btn sage">Sumar</button></form></div>';
  }

  // ---------- tu día (línea de tiempo) ----------
  var PARTS = [["Mañana", "00:00", "12:00"], ["Tarde", "12:00", "19:00"], ["Noche", "19:00", "99:99"]];
  function habitRow(h, t, isNext, light) {
    var tool = h.tool ? toolLabel(h.tool, light) : "", f = h.freq || 7, wk = habWeek(h, 0), met = f < 7 && wk >= f && !h.days[t];
    var prog = f < 7 ? " · " + wk + "/" + f + " esta semana" : "";
    var sub = h.min && !h.days[t] ? (light ? '<div class="hsub">Hoy alcanza con: <b>' + esc(h.min) + "</b></div>" : '<div class="hsub"><button class="linkbtn small" data-min="' + h.id + '">Hacer la versión mínima</button></div>') : "";
    return '<div class="habit' + (isNext ? " next" : "") + (met ? " met" : "") + '"><button class="check" role="checkbox" aria-checked="' + !!h.days[t] + '" aria-label="' + esc(h.name) + '" data-check="' + h.id + '">' + ICON.ok + '</button>' +
      '<button class="hinfo" data-edithabit="' + h.id + '" aria-label="Editar ' + esc(h.name) + '"><b>' + esc(h.name) + (h.days[t] === "m" ? " <span class='small muted'>(versión mínima)</span>" : "") + '</b><span class="htime' + (h.time ? (h.time <= nowHM() && !h.days[t] && !met ? " late" : "") : " none") + '">' + (h.time ? "⏰ " + esc(h.time) : "+ Poner horario") + esc(prog) + (met ? " · meta cumplida" : "") + (isNext ? " · Lo que sigue" : "") + "</span></button>" +
      (tool && !h.days[t] ? '<button class="btn sage sm" data-tool="' + esc(h.tool) + '">' + esc(tool) + "</button>" : "") + sub + "</div>";
  }
  function toolLabel(tl, light) { return actKey(tl) ? (light ? "Hacer completa" : "Hacer") : "Ver"; }
  function dayList(hs, t, light) {
    var hm = nowHM(), nextId = null;
    hs.forEach(function (h) { if (!nextId && h.time && h.time >= hm && !h.days[t] && !(h.freq < 7 && habWeek(h, 0) >= h.freq)) nextId = h.id; });
    var html = "";
    PARTS.forEach(function (pt) {
      var items = hs.filter(function (h) { return h.time && h.time >= pt[1] && h.time < pt[2]; });
      if (!items.length) return;
      html += '<div class="daypart">' + pt[0] + '</div><div class="card" style="padding:4px 14px">' + items.map(function (h) { return habitRow(h, t, h.id === nextId, light); }).join("") + "</div>";
    });
    var none = hs.filter(function (h) { return !h.time; });
    if (none.length) html += '<div class="daypart">Sin horario</div><div class="card" style="padding:4px 14px">' + none.map(function (h) { return habitRow(h, t, false, light); }).join("") + "</div>";
    return html;
  }
  function dayCta() {
    if (!S.mapa) return '<div class="card sage"><b>Empecemos por vos</b><p class="small" style="margin:6px 0 12px">Un mapa de tu vida hoy: cómo estás en cada área y qué querés cambiar. Con eso armamos un ritmo a tu medida. Lleva 3 minutos.</p><button class="btn" id="mapa">Armar mi mapa</button></div>';
    if (S.demo || isPro("vida")) {
      if (!S.day) return '<div class="card"><b>Armemos tu ritmo</b><p class="small muted" style="margin:6px 0 12px">Contanos tus horarios y armamos una propuesta con lo que elegiste trabajar. Después la ajustás a tu manera.</p><button class="btn" id="dayquiz">Armar mi ritmo</button></div>';
      return '<div class="row between small" style="margin:0 0 10px"><span class="muted">Ritmo armado a tu medida</span><button class="linkbtn" id="dayquiz">Rehacer</button></div>';
    }
    return '<div class="card dark"><b>Tu ritmo, armado a tu medida</b><p class="small" style="margin:6px 0 12px;opacity:.85">Con Vida diaria Pro armamos tu ritmo con tus horarios, las actividades guiadas y una revisión semanal para ajustarlo.</p><button class="btn sage" data-plan="vida">Ver Vida diaria Pro</button></div>';
  }
  function mm(t) { var a = t.split(":"); return (+a[0]) * 60 + (+a[1]); }
  function hmFrom(m) { m = Math.max(0, Math.min(1439, Math.round(m / 5) * 5)); return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function ownTool(id) { var p = prodOf(id); if (!p || !owns(p)) return ""; return p.act ? "act:" + p.act : "prod:" + id; }
  function anchors(q) {
    q = q || { wake: "07:00", sleep: "23:00", workStart: "09:00", workEnd: "18:00", lunch: "13:00" };
    var wake = mm(q.wake), sleep = mm(q.sleep); if (sleep <= wake) sleep += 1440; sleep = Math.min(sleep, 1439);
    var lunch = mm(q.lunch);
    return { wake: wake, sleep: sleep, lunch: lunch, ws: q.workStart ? mm(q.workStart) : wake + 120, we: q.workEnd ? mm(q.workEnd) : lunch + 240 };
  }
  function tplTime(tp, q) { var a = anchors(q); return hmFrom(a[tp.slot[0]] + tp.slot[1]); }
  function tplHabit(tp, q, gen) {
    var tool = tp.tool || (tp.pr ? (ownTool(tp.pr) || tp.fb || "") : "");
    return { id: "h" + Date.now() + "_" + Math.floor(Math.random() * 1e4), name: tp.n, time: tplTime(tp, q), tool: tool, freq: tp.f, min: tp.m, tpl: tp.id, gen: !!gen, days: {} };
  }
  function tplVisible(aid) { return TPL.filter(function (tp) { return tp.a === aid && (!tp.need || owns(prodOf(tp.need))); }); }
  function sportCta() {
    var html = "";
    PLANS.forEach(function (pl) {
      if (pl.id === "vida") return;
      var vis = tplVisible("plan-" + pl.id), miss = vis.filter(function (tp) { return !hasTpl(tp.id); });
      if (vis.length && miss.length) html += '<div class="card" style="border-left:6px solid ' + pl.c + '"><b>Tu plan ' + esc(pl.n) + ' está activo</b><p class="small muted" style="margin:6px 0 10px">Sumá sus productos a tu día: ' + esc(miss.map(function (x) { return x.n.toLowerCase(); }).join(", ")) + '.</p><button class="btn" data-sportmenu="plan-' + pl.id + '">Agregar a mi día</button></div>';
    });
    return html;
  }
  function hasTpl(id) { return S.habits.some(function (h) { return !h.del && h.tpl === id; }); }
  function addTpl(id) {
    var tp = TPL.filter(function (x) { return x.id === id; })[0]; if (!tp || hasTpl(id)) return;
    if (activeHabits().length >= habitLimit()) { var m = $("#mmsg"); if (m) m.innerHTML = 'Los hábitos propios son parte de Vida diaria Pro. <button class="linkbtn" data-plan="vida">Ver Vida diaria Pro</button>'; return; }
    S.habits.push(tplHabit(tp, S.day && S.day.quiz)); save(); openMenu(menuAreas); render();
  }
  var menuAreas = null;
  function openMenu(areas) {
    menuAreas = areas && areas.length ? areas : null;
    var list = (menuAreas || AREAS.map(function (a) { return a[0]; })).filter(function (a) { return a.indexOf("plan-") !== 0 || tplVisible(a).length; });
    PLANS.forEach(function (pl) { var k = "plan-" + pl.id; if (pl.id !== "vida" && tplVisible(k).length && list.indexOf(k) < 0) list.unshift(k); });
    var q = S.day && S.day.quiz;
    sheet('<h2 style="font-size:22px">Elegí tus hábitos</h2><p class="small muted">Empezá con pocos: uno o dos por área alcanzan. Cada uno trae un horario sugerido, una frecuencia flexible y una versión mínima para los días difíciles. Todo se puede cambiar.</p><div class="msg" id="mmsg" style="margin:6px 0"></div>' +
      list.map(function (aid) {
        return '<div class="subsec">' + esc(areaName(aid)) + "</div>" + tplVisible(aid).map(function (tp) {
          var has = hasTpl(tp.id);
          return '<button class="prod" ' + (has ? "disabled" : 'data-tpl="' + tp.id + '"') + '><span style="flex:1;min-width:0"><b>' + esc(tp.n) + "</b><small>" + (tp.f === 7 ? "Todos los días" : tp.f + (tp.f === 1 ? " vez" : " veces") + " por semana") + " · ⏰ " + tplTime(tp, q) + '</small></span><span class="tag' + (has ? " ok" : "") + '">' + (has ? "Agregado" : "+ Agregar") + "</span></button>";
        }).join("");
      }).join("") + (menuAreas ? '<button class="btn ghost block" data-menuall style="margin-top:8px">Ver todas las áreas</button>' : "") +
      '<button class="btn block" data-close style="margin-top:10px">Listo</button>');
  }
  function buildDay(q) {
    var foc = S.focos.length ? S.focos : (S.mapa ? AREAS.map(function (a) { return a[0]; }).sort(function (a, b) { return (S.mapa.scores[a] || 3) - (S.mapa.scores[b] || 3); }).slice(0, 3) : ["cuerpo", "mente", "trabajo"]);
    var out = [];
    foc.forEach(function (aid) { TPL.filter(function (tp) { return tp.a === aid; }).slice(0, 2).forEach(function (tp) { if (out.length < 8 && !hasTpl(tp.id)) out.push(tplHabit(tp, q, true)); }); });
    return out;
  }
  function openQuiz() {
    var q = (S.day && S.day.quiz) || { wake: "07:00", sleep: "23:00", workStart: "09:00", workEnd: "18:00", lunch: "13:00" };
    function tin(id, label, v) { return '<label class="field"><span>' + label + '</span><input id="' + id + '" type="time" value="' + esc(v || "") + '"></label>'; }
    sheet('<h2 style="font-size:22px">Armemos tu ritmo</h2><p class="small muted">Con tus horarios ubicamos los hábitos de tus prioridades (' + esc((S.focos || []).map(areaName).join(", ") || "tu mapa") + '). Después podés mover, cambiar o borrar lo que quieras.</p>' +
      '<div class="grid2" style="margin-top:12px">' + tin("q-wake", "Me despierto", q.wake) + tin("q-sleep", "Me acuesto", q.sleep) + "</div>" +
      '<label class="row small" style="margin:12px 0 4px"><input id="q-nowork" type="checkbox" ' + (q.workStart ? "" : "checked") + '> <span>No tengo horario fijo de trabajo o estudio</span></label>' +
      '<div class="grid2">' + tin("q-ws", "Empiezo a trabajar/estudiar", q.workStart) + tin("q-we", "Termino", q.workEnd) + "</div>" +
      '<div style="margin:10px 0">' + tin("q-lunch", "Almuerzo", q.lunch) + "</div>" +
      '<div class="msg" id="qmsg"></div><button class="btn block" id="qgo">Armar mi ritmo</button><button class="btn ghost block" data-close style="margin-top:8px">Cancelar</button>');
  }
  function submitQuiz() {
    var nowork = $("#q-nowork").checked;
    var q = { wake: val("q-wake"), sleep: val("q-sleep"), workStart: nowork ? "" : val("q-ws"), workEnd: nowork ? "" : val("q-we"), lunch: val("q-lunch") };
    if (!q.wake || !q.sleep || !q.lunch) { $("#qmsg").textContent = "Completá a qué hora te despertás, almorzás y te acostás."; return; }
    if (!nowork && (!q.workStart || !q.workEnd || mm(q.workEnd) <= mm(q.workStart))) { $("#qmsg").textContent = "Revisá el horario de trabajo o estudio, o marcá que no tenés horario fijo."; return; }
    S.habits.forEach(function (h) { if (h.gen) h.del = true; });
    S.day = { quiz: q, at: today() };
    buildDay(q).forEach(function (h) { S.habits.push(h); });
    save(); close(); tab = "hoy"; render(); window.scrollTo(0, 0);
  }

  // ---------- mapa de vida ----------
  var md = null;
  function ranges(scores) {
    return AREAS.map(function (a) { var v = scores[a[0]] || 3; return '<div class="rng"><div class="row between"><b>' + esc(a[1]) + '</b><span class="rv small">' + v + " · " + ["", "Mal", "Flojo", "Más o menos", "Bien", "Muy bien"][v] + '</span></div><div class="small muted">' + esc(a[2]) + '</div><input type="range" min="1" max="5" step="1" id="sc-' + a[0] + '" value="' + v + '"></div>'; }).join("");
  }
  function readScores() { var o = {}; AREAS.forEach(function (a) { var e = $("#sc-" + a[0]); o[a[0]] = e ? +e.value : 3; }); return o; }
  function openMapa() {
    close();
    var prev = S.mapa;
    md = { step: 0, scores: prev ? Object.assign({}, prev.scores) : {}, vida: prev ? prev.vida : "", pesa: prev ? prev.pesa : "", prios: prev ? (S.focos || []).slice() : null };
    var el = document.createElement("div"); el.className = "full"; el.id = "full"; document.body.appendChild(el); drawMapa();
  }
  function drawMapa() {
    var el = $("#full"); if (!el || !md) return;
    var body = "", btn = "Siguiente";
    if (md.step === 0) body = '<h2>¿Cómo estás hoy en cada área?</h2><p class="muted">Sin respuestas correctas. Es una foto de este momento para que sepamos desde dónde partís.</p>' + ranges(md.scores);
    else if (md.step === 1) body = '<h2>En tus palabras</h2><label class="field"><span>¿Qué vida querés vivir? ¿Cómo te imaginás tus días?</span><textarea id="m-vida" rows="4" maxlength="400" placeholder="Ej: días tranquilos, con tiempo para mí y para mi familia...">' + esc(md.vida) + '</textarea></label><label class="field"><span>¿Qué es lo que más te pesa hoy? (opcional)</span><textarea id="m-pesa" rows="3" maxlength="400" placeholder="Ej: siento que no llego a todo...">' + esc(md.pesa) + "</textarea></label>";
    else {
      if (!md.prios) md.prios = AREAS.map(function (a) { return a[0]; }).sort(function (a, b) { return (md.scores[a] || 3) - (md.scores[b] || 3); }).slice(0, 3);
      body = '<h2>¿Qué querés priorizar ahora?</h2><p class="muted">Elegí hasta 3 áreas. Mejor pocas y que se sostengan. Te sugerimos las que marcaste más bajas, pero decidís vos.</p><div class="chips" style="margin:6px 0">' + AREAS.map(function (a) { return '<button class="chip" data-mprio="' + a[0] + '" aria-pressed="' + (md.prios.indexOf(a[0]) >= 0) + '">' + esc(a[1]) + "</button>"; }).join("") + '</div><div class="msg" id="mmsg2"></div>';
      btn = "Listo, elegir mis hábitos";
    }
    el.innerHTML = '<header><button class="btn ghost sm" data-mexit>Salir</button><b>Mi mapa</b></header><div class="actbar"><i style="width:' + Math.round(md.step * 100 / 3) + '%"></i></div><div class="actbody"><span class="badge">Paso ' + (md.step + 1) + " de 3</span>" + body + '<button class="btn block" id="mnext">' + btn + "</button></div>";
  }
  function mapaNext() {
    if (!md) return;
    if (md.step === 0) md.scores = readScores();
    if (md.step === 1) { md.vida = ($("#m-vida").value || "").trim(); md.pesa = ($("#m-pesa").value || "").trim(); }
    if (md.step < 2) { md.step++; drawMapa(); window.scrollTo(0, 0); return; }
    if (!md.prios.length) { $("#mmsg2").textContent = "Elegí al menos un área."; return; }
    var hist = (S.mapa && S.mapa.h) || [];
    hist = hist.concat([{ at: today(), scores: md.scores }]);
    S.mapa = { scores: md.scores, vida: md.vida, pesa: md.pesa, at: today(), h: hist }; S.focos = md.prios.slice();
    var pr = S.focos.slice(); md = null; save(); close(); tab = "hoy"; render(); openMenu(pr);
  }

  // ---------- revisión semanal ----------
  var rv = null;
  function openReview() {
    close();
    rv = { step: 0, worked: "", drop: "", scores: Object.assign({}, S.mapa.scores), intencion: "" };
    var el = document.createElement("div"); el.className = "full"; el.id = "full"; document.body.appendChild(el); drawReview();
  }
  function weekSummary() {
    var cs = weekDates(0).map(function (d) { return S.checks[d]; }).filter(Boolean);
    var avg = function (k) { return cs.length ? (cs.reduce(function (a, c) { return a + c[k]; }, 0) / cs.length).toFixed(1) : null; };
    var top = activeHabits().map(function (h) { return { n: h.name, c: habWeek(h, 0) }; }).filter(function (x) { return x.c > 0; }).sort(function (a, b) { return b.c - a.c; }).slice(0, 3);
    return '<div class="card"><b>Tu semana en números</b><p class="small" style="margin:6px 0 0">Días con algo hecho: <b>' + weekCount(0) + "/7</b>" + (avg("mood") ? " · ánimo <b>" + avg("mood") + "/5</b> · energía <b>" + avg("energy") + "/3</b>" : "") + (top.length ? "<br>Lo más constante: " + top.map(function (x) { return esc(x.n) + " (" + x.c + ")"; }).join(", ") : "") + "</p></div>";
  }
  function drawReview() {
    var el = $("#full"); if (!el || !rv) return;
    var body = "", btn = "Siguiente";
    if (rv.step === 0) body = "<h2>¿Qué funcionó esta semana?</h2>" + weekSummary() + '<textarea id="rv-in" rows="4" maxlength="400" placeholder="Lo que me ayudó, lo que me gustó...">' + esc(rv.worked) + "</textarea>";
    else if (rv.step === 1) body = '<h2>¿Qué suelto o ajusto?</h2><p class="muted">Un hábito que pesa, un horario que no va, algo que te estresó. Soltar también es avanzar.</p><textarea id="rv-in" rows="4" maxlength="400" placeholder="Voy a soltar / cambiar...">' + esc(rv.drop) + "</textarea>";
    else if (rv.step === 2) body = "<h2>¿Cómo estás ahora en cada área?</h2>" + ranges(rv.scores);
    else { body = '<h2>Tu intención para la semana</h2><p class="muted">Una frase que te guíe. Va a aparecer arriba en Hoy.</p><textarea id="rv-in" rows="3" maxlength="200" placeholder="Esta semana quiero...">' + esc(rv.intencion) + "</textarea>"; btn = "Terminar revisión"; }
    el.innerHTML = '<header><button class="btn ghost sm" data-rvexit>Salir</button><b>Revisión semanal</b></header><div class="actbar"><i style="width:' + Math.round(rv.step * 100 / 4) + '%"></i></div><div class="actbody"><span class="badge">Paso ' + (rv.step + 1) + " de 4</span>" + body + '<button class="btn block" id="rvnext">' + btn + "</button></div>";
  }
  function reviewNext() {
    if (!rv) return;
    var inp = $("#rv-in"), v = inp ? inp.value.trim() : "";
    if (rv.step === 0) rv.worked = v; if (rv.step === 1) rv.drop = v; if (rv.step === 2) rv.scores = readScores();
    if (rv.step === 3) {
      if (!v) { inp.focus(); return; }
      rv.intencion = v;
      S.reviews.push({ at: today(), worked: rv.worked, drop: rv.drop, scores: rv.scores, intencion: v, days: weekCount(0) });
      S.mapa.scores = rv.scores; S.mapa.h = (S.mapa.h || []).concat([{ at: today(), scores: rv.scores }]); S.intencion = v;
      rv = null; save(); close(); tab = "hoy"; render(); window.scrollTo(0, 0); return;
    }
    rv.step++; drawReview(); window.scrollTo(0, 0);
  }

  // ---------- horarios y recordatorios ----------
  function openHabit(id) {
    var h = S.habits.filter(function (x) { return x.id === id; })[0]; if (!h) return;
    var f = h.freq || 7, opts = ""; for (var i = 1; i <= 7; i++) opts += '<option value="' + i + '"' + (f === i ? " selected" : "") + ">" + (i === 7 ? "Todos los días" : i + (i === 1 ? " vez" : " veces") + " por semana") + "</option>";
    sheet('<h2 style="font-size:22px">Tu hábito</h2><p class="small muted">Es tuyo: ponele el horario y la frecuencia que te sirvan. Es una guía, no una obligación.</p>' +
      '<label class="field" style="margin-top:12px"><span>Nombre</span><input id="e-name" maxlength="60" value="' + esc(h.name) + '"></label>' +
      '<div class="grid2" style="margin-top:12px"><label class="field"><span>Horario (opcional)</span><input id="e-time" type="time" value="' + esc(h.time || "") + '"></label><label class="field"><span>Frecuencia</span><select id="e-freq">' + opts + "</select></label></div>" +
      '<button class="linkbtn small" id="hclear" style="margin:8px 0 4px">Quitar horario</button>' +
      '<label class="field" style="margin-top:8px"><span>Versión mínima (para días difíciles)</span><input id="e-min" maxlength="80" placeholder="Ej: 2 minutos" value="' + esc(h.min || "") + '"></label>' +
      '<label class="row small" style="margin:12px 0"><input id="e-pause" type="checkbox" ' + (h.paused ? "checked" : "") + '> <span>Pausar este hábito (sin culpa, lo retomás cuando quieras)</span></label>' +
      '<button class="btn block" id="hsave" data-id="' + h.id + '">Guardar</button>' +
      '<div class="grid2" style="margin-top:10px"><button class="btn ghost" id="hdel" data-id="' + h.id + '">Borrar hábito</button><button class="btn ghost" data-close>Cerrar</button></div>');
  }
  // ---------- recordatorios: pocos y con sentido ----------
  // Por defecto, como máximo 3 por día: arranque, paso del programa (si hay) y cierre.
  function remSet() { var r = S.rem || {}; return { a: r.a !== 0, p: r.p !== 0, c: r.c !== 0, b: r.b === 1 }; }
  function remList() {
    var R = remSet(), F = window.FormaDia, bl = armBlocks(), out = [], pid = pgCur(), pit = pid && pgItem(pid);
    if (!bl.length || !F) return out;
    if (R.a) out.push({ k: "a", t: bl[0].s + 30, n: "Tu día está armado", body: "" });
    if (R.p && pit && pit.at && pgCount(pid) < 14) out.push({ k: "p", t: (function (q) { return +q[0] * 60 + +q[1]; })(pit.at.split(":")), n: "Tu paso de «" + pgOf(pid).n + "»", body: "Tu paso de hoy de «" + pgOf(pid).n + "» te espera. Son unos minutos." });
    if (R.c) out.push({ k: "c", t: tmThreshold(), n: "Cerrar tu día", body: "Es hora de cerrar tu día: mirá cómo te fue y dejá armado mañana." });
    return out;
  }
  function remSummary() {
    var L = remList().map(function (x) { return window.FormaDia.fmt(x.t % 1440) + " " + x.n.toLowerCase(); }), R = remSet(), extra = R.b ? " + un aviso por cada momento" : "";
    return L.length ? L.join(" · ") + extra : (R.b ? "Un aviso por cada momento de tu día" : "Sin avisos");
  }
  function reminderCard() {
    if (!armBlocks().length && !S.habits.some(function (h) { return !h.del && h.time; })) return "";
    if (!(S.demo || isPro("vida"))) return "";
    var perm = NATIVE ? (nativeOn() ? "granted" : "default") : window.Notification ? Notification.permission : "unsupported", n = remList().length + (remSet().b ? armBlocks().filter(armCheckable).length : 0);
    return '<div class="card" style="margin-top:12px"><div class="row between"><b>Recordatorios</b><button class="linkbtn small" data-remopen>Cambiar</button></div><p class="small muted" style="margin:6px 0 10px">' + (n <= 3 ? "Pocos, a propósito: " : "") + esc(remSummary()) + ".</p>" +
      (NATIVE ? "" : '<button class="btn sage block" id="ics">Agregar a mi calendario</button>') +
      (perm === "default" ? '<button class="btn sage block" id="notif" style="margin-top:8px">' + (NATIVE ? "Activar avisos en este celular" : "Avisarme con la app abierta") + "</button>" : perm === "granted" ? '<p class="small muted" style="margin:8px 0 0">' + (NATIVE ? "Avisos del celular: activados." : "Avisos con la app abierta: activados.") + "</p>" : "") + "</div>";
  }
  function openRem() {
    var R = remSet(), F = window.FormaDia, pid = pgCur(), nb = armBlocks().filter(armCheckable).length;
    function row(k, on, t, d) { return '<button class="remrow" data-remt="' + k + '" aria-pressed="' + on + '"><span style="flex:1;text-align:left"><b>' + esc(t) + '</b><small class="muted" style="display:block">' + esc(d) + '</small></span><span class="remsw"><i></i></span></button>'; }
    sheet('<h2 style="font-size:22px">Tus recordatorios</h2><p class="muted small">Pocos, para que los mires. Si te avisan por todo, terminás ignorándolos.</p>' +
      row("a", R.a, "Arranque del día", "Un aviso a la mañana, 30 minutos después de despertarte.") +
      row("p", R.p, "Paso de tu programa", pid ? "Un aviso por día a la hora que elegiste, mientras dure." : "Se activa cuando empezás un programa de 14 días.") +
      row("c", R.c, "Cierre del día", "A las " + F.fmt(tmThreshold()) + ", la hora que elegiste. También para dejar armado mañana.") +
      row("b", R.b, "Un aviso por cada momento", nb + " avisos por día. Puede ser mucho: activalo solo si lo necesitás.") +
      '<p class="small muted" style="margin:10px 0 0">Después de cambiar algo, volvé a tocar "Agregar a mi calendario": el calendario no se actualiza solo, y conviene borrar el evento anterior.</p><button class="btn ghost block" data-close style="margin-top:12px">Listo</button>');
  }
  function nativeLN() { return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; }
  function nativeOn() { try { return localStorage.getItem("forma_nat_notif") === "1"; } catch (e) { return false; } }
  var natSig = "";
  function nativeRemSync() {
    var LN = nativeLN(); if (!LN || !nativeOn() || !S.profile || !(S.demo || isPro("vida"))) return;
    var F = window.FormaDia; if (!F) return; var L = remList(); if (remSet().b) { /* por momento: no se programan nativamente para no saturar */ }
    var sig = JSON.stringify(L.map(function (x) { return [x.k, x.t, x.body]; })); if (sig === natSig) return; natSig = sig;
    LN.getPending().then(function (r) { return (r.notifications && r.notifications.length) ? LN.cancel({ notifications: r.notifications }) : null; }).then(function () {
      var ns = L.map(function (x, i) { var m = x.t % 1440; return { id: 100 + i, title: "Forma", body: x.k === "a" ? "Tu día está armado. Mirá qué viene primero." : x.body, schedule: { on: { hour: Math.floor(m / 60), minute: m % 60 }, allowWhileIdle: true } }; });
      if (ns.length) LN.schedule({ notifications: ns });
    }).catch(function () {});
  }
  function enableNotif() {
    if (NATIVE) { var LN = nativeLN(); if (!LN) { alert("No se pudieron activar los avisos."); return; } LN.requestPermissions().then(function (r) { if (r.display === "granted") { try { localStorage.setItem("forma_nat_notif", "1"); } catch (e) {} natSig = ""; nativeRemSync(); } render(); }); return; }
    if (!window.Notification) { alert("Tu navegador no permite avisos. Usá el calendario."); return; }
    Notification.requestPermission().then(function () { render(); });
  }
  var notified = {}, notifN = {};
  function pushNote(k, body) {
    var t = today(); if (notified[k]) return; notified[k] = 1; notifN[t] = (notifN[t] || 0) + 1; if (notifN[t] > 4) return;
    var o = { body: body, icon: "icon-192.png", tag: k };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (r) { r.showNotification("Forma", o); }, function () { new Notification("Forma", o); });
    else new Notification("Forma", o);
  }
  function checkReminders() {
    if (NATIVE) { nativeRemSync(); return; }
    if (!window.Notification || Notification.permission !== "granted" || !S.profile || !(S.demo || isPro("vida"))) return;
    var hm = nowHM(), t = today(), F = window.FormaDia; if (!F) return;
    remList().forEach(function (x) {
      var tm = F.fmt(x.t % 1440), k = "r" + x.k + t; if (!(tm <= hm && tm >= minusMin(10))) return;
      if (x.k === "a") { var pr = S.tm && S.tm[t]; pushNote(k, pr && pr.t ? "Tu día está armado. Tu prioridad de hoy: " + pr.t : "Tu día está armado. Mirá qué viene primero."); }
      else if (x.k === "p") { if (!pgToday(pgCur())) pushNote(k, x.body); }
      else if (x.k === "c") { if (!(S.cierre && S.cierre[t])) pushNote(k, x.body); }
    });
    if (remSet().b) armBlocks().filter(armCheckable).forEach(function (b) {
      var k = "arm" + armKey(b) + t, bt = F.fmt(b.s);
      if (bt <= hm && !armDone(b) && bt >= minusMin(10)) pushNote(k, "Es tu momento: " + b.label + " (" + bt + "). Sin apuro, cuando puedas.");
    });
    (S.xt || []).filter(function (x) { return x.n && !x.del && (!x.d || x.d === t); }).forEach(function (x) {
      var T = toolById(x.tool), tm = F.fmt(x.s % 1440), k = "xt" + x.id + t; if (T && tm <= hm && tm >= minusMin(10)) pushNote(k, "Es tu momento: " + T.n + " (" + tm + ").");
    });
    activeHabits().forEach(function (h) {
      var k = h.id + t; if (!h.paused && h.time && h.time <= hm && !h.days[t] && h.time >= minusMin(10)) pushNote(k, "Es tu momento: " + h.name + " (" + h.time + "). Sin apuro, cuando puedas.");
    });
  }
  function minusMin(m) { var d = new Date(Date.now() - m * 60000); return d.getDate() === new Date().getDate() ? pad(d.getHours()) + ":" + pad(d.getMinutes()) : "00:00"; }
  function downloadIcs() {
    var F = window.FormaDia, R = remSet(), rl = remList(), hs = activeHabits().filter(function (h) { return h.time; }), ab = R.b ? armBlocks().filter(armCheckable) : [], xs = (S.xt || []).filter(function (x) { return x.n && !x.del; });
    if (!rl.length && !hs.length && !ab.length && !xs.length) { alert("No hay recordatorios activados."); return; }
    var d = new Date(), day = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    function ev(uid, dd, hhmm, dur, rule, name, desc) {
      return ["BEGIN:VEVENT", "UID:" + uid + "@formargentina.com", "DTSTAMP:" + dd + "T000000Z", "DTSTART:" + dd + "T" + hhmm, "DURATION:PT" + dur + "M"].concat(rule ? ["RRULE:" + rule] : [], ["SUMMARY:" + name, "DESCRIPTION:" + desc, "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:" + name, "END:VALARM", "END:VEVENT"]);
    }
    function cl(x) { return x.replace(/[,;\\\n]/g, " "); }
    function hh(m) { m = m % 1440; return pad(Math.floor(m / 60)) + pad(m % 60) + "00"; }
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Forma//ES", "CALSCALE:GREGORIAN"];
    rl.forEach(function (x) { L = L.concat(ev("rem" + x.k, day, hh(x.t), 5, "FREQ=DAILY", cl(x.k === "a" ? "Tu día en Forma" : x.n), x.k === "c" ? "Cerrá tu día y dejá armado mañana." : "Recordatorio de Forma.")); });
    hs.forEach(function (h) { L = L.concat(ev(h.id, day, h.time.replace(":", "") + "00", 15, "FREQ=DAILY", cl(h.name), "Recordatorio de Forma. Sin apuro, cuando puedas.")); });
    xs.forEach(function (x) { var T = toolById(x.tool); if (!T) return; L = L.concat(ev(x.id, x.d ? x.d.replace(/-/g, "") : day, hh(x.s), T.mins, x.d ? "" : "FREQ=DAILY", cl(T.n), "Tu herramienta en Forma.")); });
    if (ab.length) {
      var CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], grp = [], hasWk = Object.keys(S.wk || {}).some(function (k) { return S.wk[k] && S.wk[k].ans; });
      if (!hasWk) grp.push({ bl: ab, day: day, rule: "FREQ=DAILY", id: "x" });
      else for (var w = 0; w < 7; w++) { var dd = new Date(); dd.setDate(dd.getDate() + ((w - dd.getDay() + 7) % 7)); grp.push({ bl: armBlocksFor(dd).filter(armCheckable), day: dd.getFullYear() + pad(dd.getMonth() + 1) + pad(dd.getDate()), rule: "FREQ=WEEKLY;BYDAY=" + CODES[dd.getDay()], id: "w" + w }); }
      grp.forEach(function (g) { g.bl.forEach(function (b, i) { if (b.xt) return; L = L.concat(ev("arm" + g.id + i + "-" + b.s, g.day, hh(b.s), Math.max(5, b.e - b.s), g.rule, cl(b.label), "Tu día en Forma. Sin apuro, cuando puedas.")); }); });
    }
    L.push("END:VCALENDAR");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([L.join("\r\n")], { type: "text/calendar" })); a.download = "forma-recordatorios.ics"; a.click();
  }
  setInterval(checkReminders, 30000);
  setInterval(function () {
    var ae = document.activeElement;
    if (tab !== "hoy" || $("#sheet") || $("#full") || !S.profile || (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName))) return;
    if ($(".tl") || $(".bignow")) render();
  }, 60000);

  // ---------- eventos ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button,a,[data-prod],[data-blkopen]"); if (!t) return;
    var d = t.dataset;
    if (d.mode) { readAuthDraft(); mode = d.mode; render(); return; }
    if (t.id === "a-register") return doRegister();
    if (t.id === "a-login") return doLogin();
    if (t.id === "a-forgot") return doForgot();
    if (t.id === "r-save") return doRecovery();
    if (t.id === "a-guest") { S.guest = true; save(); render(); return; }
    if (t.id === "mkacct") { close(); S.guest = false; mode = "register"; draft.name = (S.profile && S.profile.name) || draft.name; render(); return; }
    if (t.id === "logout") return doLogout();
    if (d.tab) { close(); tab = d.tab; render(); window.scrollTo(0, 0); return; }
    if (d.close !== undefined) { close(); return; }
    if (d.plan) return openPlan(d.plan);
    if (d.cat) { catFilter = d.cat; render(); return; }
    if (d.prod) return openProduct(d.prod);
    if (d.fbopen !== undefined) return openFeedback();
    if (d.fbc) { fbCat = d.fbc; [].slice.call(document.querySelectorAll("#sheet [data-fbc]")).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.fbc === fbCat ? "true" : "false"); }); return; }
    if (d.fbsend !== undefined) return sendFeedback();
    if (d.fbreset !== undefined) { if (confirm("Se borra todo lo que cargaste y empezás de cero. ¿Seguro?")) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } return; }
    if (d.remopen !== undefined) return openRem();
    if (d.remt) { var rr = remSet(), kk = d.remt; rr[kk] = !rr[kk]; S.rem = { a: rr.a ? 1 : 0, p: rr.p ? 1 : 0, c: rr.c ? 1 : 0, b: rr.b ? 1 : 0 }; save(); openRem(); render(); return; }
    if (d.open === "tools") return openTools();
    if (d.tl) return openTool(d.tl);
    if (d.xtadd) return openXtAdd(d.xtadd);
    if (d.xtn !== undefined) { xtd.n = !xtd.n; t.setAttribute("aria-pressed", xtd.n ? "true" : "false"); return; }
    if (d.xtw) { xtd.w = d.xtw; [].slice.call(document.querySelectorAll("#sheet [data-xtw]")).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.xtw === d.xtw ? "true" : "false"); }); return; }
    if (d.xtok !== undefined) { var sel = $("#xts"); if (!sel || !xtd.id || !isProU()) return; S.xt = S.xt || []; S.xt.push({ id: "x" + Date.now(), tool: xtd.id, s: +sel.value, d: xtd.w === "hoy" ? today() : "", n: xtd.n ? 1 : 0, at: today() }); save(); close(); render(); return; }
    if (d.xtdel) { var xi = (S.xt || []).filter(function (x) { return x.id === d.xtdel; })[0]; if (xi) { xi.del = true; xi.at = today(); save(); } close(); render(); return; }
    if (d.open === "test") return openTest();
    if (d.gexit !== undefined) { gs = null; var gf = $("#full"); if (gf) gf.remove(); return; }
    if (d.gpick) { if (!gs) return; var go0 = $("#gother"); if (go0) gs.other = go0.value; var gix = gs.sel.indexOf(d.gpick); if (gix >= 0) gs.sel.splice(gix, 1); else { if (gs.sel.length >= 2) gs.sel.shift(); gs.sel.push(d.gpick); } var gfe = $("#full"), gsc = gfe ? gfe.scrollTop : 0, gbd = $("#full .dbody"), gsb = gbd ? gbd.scrollTop : 0; drawGoals(); gfe = $("#full"); if (gfe) gfe.scrollTop = gsc; gbd = $("#full .dbody"); if (gbd) gbd.scrollTop = gsb; return; }
    if (d.gnext !== undefined) { if (!gs || !gs.sel.length) return; var go1 = $("#gother"); if (go1) gs.other = go1.value; if (gLive().length) { gs.st = "q"; gs.gi = 0; gs.qi = 0; drawGoals(); } else gFinish(); return; }
    if (d.gopt !== undefined) { if (gs) gAnswer(+d.gopt); return; }
    if (d.gback !== undefined) { if (gs) gBack(); return; }
    if (d.gdone !== undefined) { var gf2 = $("#full"); if (gf2) gf2.remove(); tab = "hoy"; render(); window.scrollTo(0, 0); return; }
    if (d.gapply) { applyGoalChange(d.gapply); return; }
    if (d.grev) { goalReviewDo(d.grev); return; }
    if (d.gtoggle !== undefined) { goalOpen = !goalOpen; render(); return; }
    if (d.open === "wsum") return openWeekSum();
    if (d.tstexit !== undefined) { tst = null; var tf = $("#full"); if (tf) tf.remove(); return; }
    if (d.tstpick !== undefined) { if (tst) { tst.a[testVisible(tst.a)[tst.i].k] = +d.tstpick; tst.i++; drawTest(); } return; }
    if (d.tstback !== undefined) { if (tst && tst.i) { tst.i--; drawTest(); } return; }
    if (d.tstclose !== undefined) { var tf2 = $("#full"); if (tf2) tf2.remove(); render(); return; }
    if (d.tstplan) { var tf3 = $("#full"); if (tf3) tf3.remove(); tab = "planes"; render(); return openPlan(d.tstplan); }
    if (d.open === "organizar") return openOrganizar();
    if (d.open === "respirar") return openRespirar();
    if (t.id === "orgdone") { completeAct("organizar"); touchBest(); save(); close(); render(); return; }
    if (d.actexit !== undefined) { if (confirm("¿Salir? Si salís, la actividad no se tilda.")) { close(); } return; }
    if (d.actdone !== undefined) { close(); render(); return; }
    if (t.id === "actnext") return nextStep();
    if (d.act) return startAct(d.act);
    if (d.area) { toggleIn(draft.areas, d.area); var nm = $("#f-name"); if (nm) draft.name = nm.value; renderOnboard(); return; }
    if (d.sport) { toggleIn(draft.sports, d.sport); var nm2 = $("#f-name"); if (nm2) draft.name = nm2.value; renderOnboard(); return; }
    if (t.id === "create") {
      var nmEl = $("#f-name"); if (nmEl) draft.name = nmEl.value;
      var nameV = user ? ((S.profile && S.profile.name) || "") : draft.name.trim();
      if (!nameV && !user) { $("#wmsg").textContent = "Escribí tu nombre para continuar."; return; }
      S.profile = Object.assign({ name: nameV, email: (user && user.email) || "", created: today() }, S.profile || {}, { areas: draft.areas.slice(), sports: draft.sports.slice(), done: true });
      if (!S.profile.name) S.profile.name = nameV;
      save(); tab = "hoy"; render(); return;
    }
    if (d.check) {
      var h = S.habits.filter(function (x) { return x.id === d.check; })[0];
      if (h) { if (h.days[today()]) { delete h.days[today()]; save(); render(); } else if (lightToday() && h.min) { h.days[today()] = "m"; save(); render(); } else if (gated(h)) { startAct(actKey(h.tool)); } else { h.days[today()] = 1; save(); render(); } }
      return;
    }
    if (d.delhabit) { if (confirm("¿Borrar este hábito? Tu racha no se pierde.")) { var hh = S.habits.filter(function (x) { return x.id === d.delhabit; })[0]; if (hh) hh.del = true; save(); render(); } return; }
    if (d.addhabit) { addHabit(d.addhabit, d.time); return; }
    if (d.edithabit) return openHabit(d.edithabit);
    if (t.id === "hsave") { var eh = S.habits.filter(function (x) { return x.id === t.dataset.id; })[0], nn = $("#e-name").value.trim(); if (eh && nn) { eh.name = nn.slice(0, 60); eh.time = $("#e-time").value || ""; eh.freq = +$("#e-freq").value || 7; eh.min = $("#e-min").value.trim().slice(0, 80); eh.paused = $("#e-pause").checked; save(); close(); render(); } return; }
    if (t.id === "hclear") { $("#e-time").value = ""; return; }
    if (t.id === "hdel") { if (confirm("¿Borrar este hábito? Tu racha no se pierde.")) { var hx = S.habits.filter(function (x) { return x.id === t.dataset.id; })[0]; if (hx) hx.del = true; save(); close(); render(); } return; }
    if (d.wkday !== undefined) { var wdt = null; if (d.wkdt) { var q = d.wkdt.split("-"); wdt = new Date(+q[0], +q[1] - 1, +q[2]); } return openWeekDay(+d.wkday, wdt); }
    if (d.pgtry) return openPgTry(d.pgtry);
    if (d.pgall !== undefined) return openPrograms();
    if (d.pgopen) return openProgram(d.pgopen);
    if (d.pgm !== undefined) { var par = t.parentNode; [].slice.call(par.querySelectorAll("[data-pgm]")).forEach(function (b) { b.setAttribute("aria-pressed", b === t ? "true" : "false"); }); return; }
    if (d.pgstart) { if (!pgOwns(d.pgstart)) return; var sb = document.querySelector('#sheet .pgm[data-key=before] [aria-pressed=true]'), pm = $("#pgmsg"), why = ($("#pgwhy").value || "").trim(); if (!sb) { if (pm) pm.textContent = "Elegí un número para empezar."; return; } if (why.length < 8) { if (pm) pm.textContent = "Escribí tu razón (una frase corta alcanza)."; return; } S.prog = S.prog || { cur: null, items: {} }; S.prog.items[d.pgstart] = { start: today(), before: +sb.dataset.pgm, after: null, why: why.slice(0, 200), at: ($("#pgat").value || "").slice(0, 5), done: {}, last: null, lg: {}, fl: {}, dr: {}, st: null }; S.prog.cur = d.pgstart; save(); close(); render(); return openProgram(d.pgstart); }
    if (d.pgdone) return pgSubmit(d.pgdone);
    if (d.pgc) { var pc = d.pgc.split("|"), cit = pgItem(S.prog && S.prog.cur); if (cit) { cit.dr = cit.dr || {}; cit.dr[pc[0]] = +pc[1]; [].slice.call(t.parentNode.querySelectorAll("[data-pgc]")).forEach(function (b) { b.setAttribute("aria-pressed", b === t ? "true" : "false"); }); save(); } return; }
    if (d.pgk) { var kit = pgItem(S.prog && S.prog.cur); if (kit) { kit.dr = kit.dr || {}; kit.dr[d.pgk] = kit.dr[d.pgk] === 1 ? 0 : 1; t.setAttribute("aria-pressed", kit.dr[d.pgk] === 1 ? "true" : "false"); save(); } return; }
    if (d.pgtm) { var tid = S.prog && S.prog.cur, tit = pgItem(tid); if (tit) { tit.st = tit.st || {}; tit.st.tm = { end: Date.now() + (+d.pgtm) * 1000 }; save(); openProgram(tid); } return; }
    if (d.pgact) return startAct(d.pgact);
    if (d.pgquit2) { S.prog.cur = null; save(); close(); render(); return; }
    if (d.pgafter) { var sa = document.querySelector('#sheet .pgm[data-key=after] [aria-pressed=true]'); if (!sa) return; pgItem(d.pgafter).after = +sa.dataset.pgm; save(); render(); return openProgram(d.pgafter); }
    if (d.pgquit) return openPgQuit(d.pgquit);
    if (d.pgresume) { if (pgOwns(d.pgresume)) { S.prog.cur = d.pgresume; save(); close(); render(); openProgram(d.pgresume); } return; }
    if (d.pgagain) { delete S.prog.items[d.pgagain]; save(); render(); return openProgram(d.pgagain); }
    if (d.tmshow !== undefined) { showTm = true; render(); return; }
    if (d.tmedit !== undefined) { if (S.tm) delete S.tm[today(tmDate())]; save(); render(); return; }
    if (d.tmdone !== undefined) { var c0 = S.tm && S.tm[today()]; if (c0 && isProU()) { c0.d = c0.d ? 0 : 1; S.ad = S.ad || {}; S.ad[today()] = S.ad[today()] || {}; if (c0.d) S.ad[today()]["tm|prio"] = 1; else delete S.ad[today()]["tm|prio"]; touchBest(); save(); render(); } return; }
    if (d.ddedit) return ddEdit(d.ddedit);
    if (d.ddreset) { if (isProU()) ddReset(d.ddreset); return; }
    if (d.wkday !== undefined && d.wkday !== "") { var wd2 = null; if (d.wkdt) { var q2 = d.wkdt.split("-"); wd2 = new Date(+q2[0], +q2[1] - 1, +q2[2]); } return openWeekDay(+d.wkday, wd2); }
    if (d.wkedit !== undefined) return wkEdit(+d.wkedit);
    if (d.wkreset !== undefined) { if (isProU()) wkReset(+d.wkreset); return; }
    if (d.wkto !== undefined) { t.setAttribute("aria-pressed", t.getAttribute("aria-pressed") === "true" ? "false" : "true"); return; }
    if (d.wkcopy !== undefined) { if (isProU()) wkCopy(+d.wkcopy); return; }
    if (d.blkopen !== undefined) return openBlock(+d.blkopen);
    if (t.id === "compedit") return openComp();
    if (d.compsel !== undefined && compDraft) { var ct = compDraft.all[+d.compsel], ci2 = compDraft.sel.indexOf(ct); if (ci2 >= 0) compDraft.sel.splice(ci2, 1); else if (compDraft.sel.length < 3) compDraft.sel.push(ct); else { var cm = $("#compmsg"); if (cm) cm.textContent = "Hasta 3. Sacá uno para elegir otro."; return; } drawComp(); return; }
    if (t.id === "compsave" && compDraft) { S.comp = S.comp || {}; S.comp[today()] = compDraft.sel.slice(0, 3); compDraft = null; save(); close(); render(); return; }
    if (d.cack !== undefined) { if (!isProU()) return; var ctx = compToday()[+d.cack]; if (ctx !== undefined) { S.ad = S.ad || {}; var tdc = today(); S.ad[tdc] = S.ad[tdc] || {}; if (S.ad[tdc]["c|" + ctx]) delete S.ad[tdc]["c|" + ctx]; else S.ad[tdc]["c|" + ctx] = 1; touchBest(); save(); render(); } return; }
    if (d.ackb !== undefined) { if (!isProU()) return; var bb = armBlocks()[+d.ackb]; if (bb) { S.ad = S.ad || {}; var tdb = today(); S.ad[tdb] = S.ad[tdb] || {}; if (S.ad[tdb][armKey(bb)]) delete S.ad[tdb][armKey(bb)]; else S.ad[tdb][armKey(bb)] = 1; touchBest(); save(); close(); render(); } return; }
    if (d.bndel) { var pr = d.bndel.split(":"), bd2 = armBlocks()[+pr[0]]; if (bd2 && isProU()) { S.bn[bkey(bd2)].splice(+pr[1], 1); save(); render(); openBlock(+pr[0]); } return; }
    if (d.settheme) return setTheme(d.settheme);
    if (d.setview) { try { localStorage.setItem("forma_view", d.setview); } catch (e) {} render(); window.scrollTo(0, 0); return; }
    if (t.id === "more") { moreOpen = !moreOpen; render(); return; }
    if (t.id === "cierre") return openCierre();
    if (d.cierreat !== undefined) return openCierreAt();
    if (d.cierreok !== undefined) { var cv = ($("#cat") || {}).value || ""; var mm = cv.match(/^(\d{1,2}):(\d{2})$/); if (mm) { S.cierreAt = Math.max(0, Math.min(1439, +mm[1] * 60 + +mm[2])); save(); } close(); render(); return; }
    if (d.cierreok2 !== undefined) return doCierre();
    if (d.cmes !== undefined) { S.cierreL = S.cierreL || {}; return openCierre("reward"); }
    if (d.cierrefin !== undefined) { var fe = $("#full"); if (fe) fe.remove(); if (d.cierrefin === "tm") { showTm = true; } render(); window.scrollTo(0, 0); return; }
    if (t.id === "armgo") return armOpen();
    if (t.id === "armedit") return armOpen(S.arm && S.arm.ans);
    if (d.ack) { if (!(S.demo || isPro("vida"))) return; S.ad = S.ad || {}; var td = today(); S.ad[td] = S.ad[td] || {}; if (S.ad[td][d.ack]) delete S.ad[td][d.ack]; else S.ad[td][d.ack] = 1; touchBest(); save(); render(); return; }
    if (d.delwin !== undefined) { var wl = S.wins && S.wins[today()]; if (wl) { wl.splice(+d.delwin, 1); save(); render(); } return; }
    if (d.todock) { var ti = (S.todo || []).filter(function (x) { return x.id === d.todock; })[0]; if (ti) { ti.done = !ti.done; ti.doneAt = ti.done ? today() : ""; save(); render(); } return; }
    if (d.tododel) { S.todo = (S.todo || []).filter(function (x) { return x.id !== d.tododel; }); save(); render(); return; }
    if (d.armtool) { if (!(S.demo || isPro("vida"))) return; return startAct(d.armtool); }
    if (t.id === "notif") return enableNotif();
    if (t.id === "dayquiz") return openQuiz();
    if (t.id === "menu") return openMenu(S.focos);
    if (d.sportmenu) return openMenu([d.sportmenu]);
    if (t.id === "qimg") return quoteImage();
    if (d.menuall !== undefined) return openMenu(null);
    if (d.tpl) return addTpl(d.tpl);
    if (d.min) { var hm1 = S.habits.filter(function (x) { return x.id === d.min; })[0]; if (hm1) { hm1.days[today()] = "m"; save(); render(); } return; }
    if (d.mood) { ci.mood = +d.mood; if (ci.energy) { S.checks[today()] = { mood: ci.mood, energy: ci.energy }; ci = { mood: 0, energy: 0 }; save(); } render(); return; }
    if (d.energy) { ci.energy = +d.energy; if (ci.mood) { S.checks[today()] = { mood: ci.mood, energy: ci.energy }; ci = { mood: 0, energy: 0 }; save(); } render(); return; }
    if (t.id === "recheck") { delete S.checks[today()]; save(); render(); return; }
    if (t.id === "mapa") return openMapa();
    if (d.mexit !== undefined) { md = null; close(); return; }
    if (t.id === "mnext") return mapaNext();
    if (d.mprio) { if (!md) return; var ix = md.prios.indexOf(d.mprio); if (ix >= 0) md.prios.splice(ix, 1); else if (md.prios.length < 3) md.prios.push(d.mprio); else { $("#mmsg2").textContent = "Hasta 3 áreas. Sacá una para elegir otra."; return; } drawMapa(); return; }
    if (t.id === "review") return openReview();
    if (d.rvexit !== undefined) { rv = null; close(); return; }
    if (t.id === "rvnext") return reviewNext();
    if (t.id === "qgo") return submitQuiz();
    if (d.qarea) { t.setAttribute("aria-pressed", t.getAttribute("aria-pressed") === "true" ? "false" : "true"); return; }
    if (d.tool) { var tl = d.tool; if (actKey(tl)) return startAct(actKey(tl)); if (tl.indexOf("prod:") === 0) return openProduct(tl.slice(5)); return; }
    if (t.id === "ics") return downloadIcs();
    if (d.parea) { toggleIn(S.profile.areas, d.parea); save(); render(); return; }
    if (d.psport) { toggleIn(S.profile.sports, d.psport); save(); render(); return; }
    if (t.id === "psave") {
      var n = $("#p-name").value.trim(); if (!n) { $("#pmsg").textContent = "El nombre no puede estar vacío."; return; }
      S.profile.name = n; save(); $("#pmsg").textContent = "Guardado."; return;
    }
    if (t.id === "export") {
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify({ perfil: S.profile, habitos: S.habits, mejorRacha: S.best, usuario: acct.username }, null, 2)], { type: "application/json" })); a.download = "forma-mis-datos.json"; a.click(); return;
    }
    if (t.id === "wipe") {
      if (user) {
        if (!confirm("Se borra tu cuenta y todos tus datos (hábitos, racha, perfil). Las compras quedan registradas para poder atender reclamos. No se puede deshacer. ¿Seguir?")) return;
        sb.rpc("delete_my_account").then(function (r) {
          if (r.error) { alert("No pudimos borrar la cuenta ahora. Escribinos por Instagram @formargentina."); return; }
          doLogout();
        });
      } else if (confirm("Se borran tu perfil y tus hábitos de este dispositivo. ¿Seguir?")) {
        try { localStorage.removeItem(KEY); } catch (e) {} S = blank(); draft = { name: "", username: "", email: "", areas: [], sports: [], news: true, terms: false }; render();
      }
      return;
    }
  });
  document.addEventListener("change", function (e) { if (e.target.getAttribute && e.target.getAttribute("data-fk")) save(); });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "compf") { e.preventDefault(); var cv = $("#compown").value.trim(); if (cv && compDraft) { if (compDraft.sel.length >= 3) { $("#compmsg").textContent = "Hasta 3. Sacá uno para sumar otro."; return; } if (compDraft.sel.indexOf(cv) < 0) compDraft.sel.push(cv.slice(0, 80)); drawComp(); } return; }
    if (e.target.id === "bnf") { e.preventDefault(); if (!isProU()) return; var bi = +e.target.dataset.i, bx = armBlocks()[bi], bv = $("#bn").value.trim(); if (bx && bv) { S.bn = S.bn || {}; (S.bn[bkey(bx)] = S.bn[bkey(bx)] || []).push(bv.slice(0, 80)); save(); render(); openBlock(bi); } return; }
    if (e.target.id === "tmf") { e.preventDefault(); if (!isProU()) return; var tv = $("#tmi").value.trim(); if (tv) { S.tm = S.tm || {}; S.tm[today(tmDate())] = { t: tv.slice(0, 80), d: 0 }; save(); render(); } return; }
    if (e.target.id === "winf") { e.preventDefault(); var wv = $("#win").value.trim(); if (wv) { S.wins = S.wins || {}; (S.wins[today()] = S.wins[today()] || []).push(wv.slice(0, 120)); save(); render(); } return; }
    if (e.target.id === "todof") { e.preventDefault(); var tv = $("#todo").value.trim(); if (tv && (S.todo || []).length < 60) { S.todo = S.todo || []; S.todo.push({ id: "t" + Date.now(), t: tv.slice(0, 120), done: false, doneAt: "" }); save(); render(); } return; }
    if (e.target.id === "addh") { e.preventDefault(); addHabit($("#hname").value, $("#htime").value); }
    if (e.target.id === "notify") {
      e.preventDefault(); var em = $("#n-email").value.trim(); $("#nmsg").textContent = "Enviando...";
      postLead(em, "app-compra").then(function (ok) { $("#nmsg").textContent = ok ? "Listo, te avisamos." : "Ahora no se pudo enviar. Probá más tarde."; });
    }
  });
  document.addEventListener("input", function (e) {
    var fk = e.target.getAttribute && e.target.getAttribute("data-fk");
    if (fk) { var fit = pgItem(S.prog && S.prog.cur); if (fit) { fit.dr = fit.dr || {}; fit.dr[fk] = e.target.value; } return; }
    if (!e.target) return;
    if (e.target.id === "act-in") updateNext();
    if (e.target.id === "a-user") draft.userTouched = true;
    if (e.target.id === "a-name") {
      var uEl = $("#a-user");
      if (uEl && !draft.userTouched) {
        var slug = e.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
        draft.sfx = draft.sfx || String(100 + Math.floor(Math.random() * 900));
        uEl.value = slug.length >= 2 ? slug + "_" + draft.sfx : "";
      }
    }
    if (/^sc-/.test(e.target.id || "")) { var v = +e.target.value, o = e.target.parentNode.querySelector(".rv"); if (o) o.textContent = v + " · " + ["", "Mal", "Flojo", "Más o menos", "Bien", "Muy bien"][v]; }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var id = e.target && e.target.id;
    if (id === "a-pass") { if (mode === "login") doLogin(); else if (mode === "register") doRegister(); }
    if (id === "r-pass") doRecovery();
  });

  // ---------- inicio ----------
  initSb();
  render();
  (function () { var sp = document.getElementById("splash"); if (!sp) return; setTimeout(function () { sp.classList.add("out"); setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 500); }, Math.max(0, 2500 - (window.performance ? performance.now() : 0))); })();
  if (sb) {
    sb.auth.onAuthStateChange(function (ev) { if (ev === "PASSWORD_RECOVERY") { mode = "recovery"; render(); } });
    sb.auth.getSession().then(function (r) { if (r && r.data && r.data.session && mode !== "recovery") return onSession(r.data.session); }).catch(function () {});
  }
  if (!NATIVE && "serviceWorker" in navigator && location.protocol.indexOf("http") === 0) { navigator.serviceWorker.register("sw.js").catch(function () {}); }
})();
