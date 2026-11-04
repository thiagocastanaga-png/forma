(function () {
  "use strict";
  var CFG = window.FORMA || {};
  var KEY = "forma_app_v1";
  var FREE_HABITS = 0;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  // ---------- catálogo ----------
  var SHAPES = {
    tenis: '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="#C6F432"/></svg>',
    futbol: '<svg viewBox="0 0 44 44"><path d="M2 2 A40 40 0 0 1 42 42 H2 Z" fill="#4C7DFF"/></svg>',
    voley: '<svg viewBox="0 0 44 44"><rect x="3" y="3" width="38" height="38" fill="#FFC83D"/></svg>',
    basquet: '<svg viewBox="0 0 44 44"><path d="M22 3 L41 41 H3 Z" fill="#FF8A4C"/></svg>',
    handball: '<svg viewBox="0 0 44 44"><path d="M2 36 A20 20 0 0 1 42 36 Z" fill="#B9A7F0"/></svg>',
    vida: '<svg viewBox="0 0 44 44"><path d="M3 22 A19 19 0 0 1 22 3 H41 V22 A19 19 0 0 1 22 41 H3 Z" fill="#86A892"/></svg>'
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
    { id: "vida", n: "Vida diaria", c: "#86A892", pro: "plan-vida", live: true, price: "",
      d: "Un sistema para ordenar tu día y tu vida a tu manera: sin rigidez, con lo que vos elegís. Para gente común, a tu ritmo.",
      free: ["Tu día armado con 12 preguntas, fijo en la pantalla de Hoy", "Tu mapa de vida", "Respiración guiada de 1 minuto"],
      pros: ["Tildar tu día y seguir tu constancia semanal", "Cambiar tu día cuando cambie tu vida", "Avisos en el calendario de tu celular", "Actividades guiadas dentro de tu día: calma, movimiento, foco, cierre y sueño", "Lo que hiciste bien hoy y tus pendientes", "Hábitos propios sin límite y revisión semanal", "Se incluye con cualquier otro plan Pro"] },
    { id: "tenis", n: "Tenis", c: "#C6F432", pro: "t-full", live: true, price: "USD 20", was: "USD 29", promo: "Precio de preventa para las primeras 10 compras",
      d: "Rutinas de preparación para jugadores que compiten.",
      free: ["Respirar 1 minuto", "Aviso cuando abra la preventa"],
      pros: ["Vida diaria Pro incluido", "Pre y post partido", "Respiración y enfoque", "Movilidad", "Rutina física, para sumar a tu día"] },
    { id: "futbol", n: "Fútbol", c: "#4C7DFF", pro: "plan-futbol", live: false, d: "Rutinas para futbolistas: antes y después del partido, movilidad y fuerza." },
    { id: "voley", n: "Vóley", c: "#FFC83D", pro: "plan-voley", live: false, d: "Rutinas para vóley: saltos, hombros y recuperación." },
    { id: "basquet", n: "Básquet", c: "#FF8A4C", pro: "plan-basquet", live: false, d: "Rutinas para básquet: explosividad, tobillos y recuperación." },
    { id: "handball", n: "Handball", c: "#B9A7F0", pro: "plan-handball", live: false, d: "Rutinas para handball: lanzamiento, hombros y recuperación." }
  ];
  function planOf(id) { return PLANS.filter(function (p) { return p.id === id; })[0]; }

  // Productos sueltos (no son el plan completo)
  var PRODUCTS = [
    { id: "dormir", g: "Cuerpo", s: "vida", n: "Dormir de verdad", d: "Programa de 14 días para ordenar tu sueño, con una rutina guiada para bajar el ritmo. Un cambio chico por día.", area: "cuerpo", act: "dormir", prog: "dormir" },
    { id: "energia", g: "Cuerpo", s: "vida", n: "Energía y movimiento", d: "Pausa de movimiento guiada de 5 minutos, sin gimnasio ni equipamiento.", area: "cuerpo", act: "movimiento" },
    { id: "comidas", g: "Cuerpo", s: "vida", n: "Comidas ordenadas", d: "Organizar horarios y compras. No es una dieta.", area: "cuerpo", soon: true },
    { id: "ansiedad", g: "Mente", s: "vida", n: "Calmar la cabeza", d: "Programa de 14 días con herramientas simples para bajar la tensión de todos los días. No reemplaza a un profesional.", area: "mente", act: "calma", prog: "calma" },
    { id: "foco", g: "Mente", s: "vida", n: "Arrancar", d: "Programa de 14 días para dejar de postergar: pasos diminutos, foco de 25 minutos y una prioridad por día.", area: "trabajo", act: "foco", prog: "arrancar" },
    { id: "celular", g: "Mente", s: "vida", n: "Celular bajo control", d: "Programa de 14 días para usar el celular vos y que no te use a vos. Sin prohibirte nada.", area: "mente", prog: "celular" },
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
  var user = null;          // usuario de Supabase (si inició sesión)
  var acct = { username: "" };
  var sync = { state: "off", t: 0 }; // off | ok | pending | error
  var sb = null;
  var pushT = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    if (user && sb) { sync.state = "pending"; clearTimeout(pushT); pushT = setTimeout(push, 900); }
  }
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
  var EXTRA = ["mapa", "focos", "day", "notes", "checks", "reviews", "intencion", "arm", "ad", "wins", "todo", "comp", "bn", "actn", "cierre", "wk", "tm", "prog"];
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
    out.actn = Math.max(local.actn || 0, remote.actn || 0); out.cierre = Object.assign({}, remote.cierre || {}, local.cierre || {});
    out.comp = Object.assign({}, remote.comp || {}, local.comp || {}); out.bn = Object.assign({}, remote.bn || {}, local.bn || {});
    var tmap = {}; (remote.todo || []).concat(local.todo || []).forEach(function (x) { tmap[x.id] = x; }); out.todo = Object.keys(tmap).map(function (k) { return tmap[k]; });
    out.wk = Object.assign({}, remote.wk || {}); Object.keys(local.wk || {}).forEach(function (k) { var r = out.wk[k], l = local.wk[k]; if (!r || (l && (l.at || "") >= (r.at || ""))) out.wk[k] = l; });
    out.tm = Object.assign({}, remote.tm || {}, local.tm || {});
    (function () {
      var r = remote.prog || { items: {} }, l = local.prog || { items: {} }, it = {};
      Object.keys(Object.assign({}, r.items, l.items)).forEach(function (id) {
        var a = (r.items || {})[id] || {}, b = (l.items || {})[id] || {};
        it[id] = { start: [a.start, b.start].filter(Boolean).sort()[0] || null, before: b.before || a.before || null, after: b.after || a.after || null, done: Object.assign({}, a.done || {}, b.done || {}), last: [a.last, b.last].filter(Boolean).sort().pop() || null };
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
  function needAuth() { return !user && !S.guest && !S.demo; }
  function render() {
    if (mode === "recovery") return renderRecovery();
    if (needAuth()) return renderAuth();
    if (!S.profile || S.profile.done === false) return renderOnboard();
    touchBest();
    var body = { hoy: vHoy, planes: vPlanes, catalogo: vCatalogo, perfil: vPerfil }[tab]();
    var n = weekCount(0), topPro = isPro("vida") || PLANS.some(function (p) { return isPro(p.id); });
    $app.innerHTML =
      '<div class="top"><div class="logo">forma<i></i></div><div class="row" style="gap:8px">' +
      (S.demo ? '<span class="tag">modo prueba</span>' : "") +
      '<span class="plan-chip' + (topPro ? " pro" : "") + '">' + (topPro ? "Pro" : "Gratis") + "</span>" +
      (topPro ? '<span class="flame-chip' + (n ? " on" : "") + '" title="Días con algo hecho esta semana">' + ICON.flame + "<b>" + n + "/7</b></span>" : "") + "</div></div>" +
      "<main>" + body + "</main>" +
      '<nav class="tabs" aria-label="Principal"><div>' +
      [["hoy", "Hoy"], ["planes", "Planes"], ["catalogo", "Catálogo"], ["perfil", "Perfil"]].map(function (t) {
        return '<button data-tab="' + t[0] + '"' + (tab === t[0] ? ' aria-current="page"' : "") + ">" + ICON[t[0]] + "<span>" + t[1] + "</span></button>";
      }).join("") + "</div></nav>";
  }

  // --- acceso: crear cuenta / iniciar sesión / probar sin cuenta ---
  function renderAuth() {
    var reg = mode === "register", forgot = mode === "forgot";
    var html = '<div class="top"><div class="logo">forma<i></i></div></div><main class="stack">' +
      '<h1 class="hello" style="font-size:32px">' + (forgot ? "Recuperar tu contraseña" : reg ? "Dale forma a la vida que querés" : "Qué bueno verte de nuevo") + "</h1>";
    if (!sb) html += '<div class="card small">Las cuentas no están disponibles ahora. Podés usar la app en este dispositivo sin cuenta.</div>';
    if (sb && !forgot) {
      html += '<div class="seg" role="tablist"><button data-mode="register" aria-pressed="' + reg + '">Crear cuenta</button><button data-mode="login" aria-pressed="' + !reg + '">Ya tengo cuenta</button></div>';
    }
    if (sb) {
      if (forgot) {
        html += '<p class="muted small">Escribí tu email y te mandamos un link para elegir una contraseña nueva.</p>' +
          '<label class="field"><span>Email</span><input id="a-email" type="email" autocomplete="email" value="' + esc(draft.email) + '"></label>' +
          '<button class="btn block" id="a-forgot">Enviar link</button><button class="btn ghost block" data-mode="login">Volver</button>';
      } else if (reg) {
        html += '<p class="muted small">Creá tu cuenta gratis: tu racha, tus hábitos y lo que compres quedan guardados y los ves desde cualquier dispositivo.</p>' +
          '<label class="field"><span>¿Cómo te llamás?</span><input id="a-name" autocomplete="given-name" maxlength="40" value="' + esc(draft.name) + '"></label>' +
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
    $app.innerHTML = '<div class="top"><div class="logo">forma<i></i></div></div><main class="stack"><h1 class="hello" style="font-size:30px">Elegí una contraseña nueva</h1>' +
      '<label class="field"><span>Contraseña nueva (mínimo 8 caracteres)</span><input id="r-pass" type="password" autocomplete="new-password"></label>' +
      '<button class="btn block" id="r-save">Guardar contraseña</button><div class="msg" id="amsg" role="status"></div></main>';
  }

  // --- personalizar (primer ingreso) ---
  function renderOnboard() {
    $app.innerHTML =
      '<div class="top"><div class="logo">forma<i></i></div></div><main class="stack">' +
      '<h1 class="hello" style="font-size:30px">Un último paso</h1><p class="muted">Después te vamos a hacer unas preguntas para armar tu mapa de vida y encontrar el orden que vos querés. Sin apuro y sin respuestas correctas.</p>' +
      (user ? "" : '<label class="field"><span>¿Cómo te llamás?</span><input id="f-name" autocomplete="given-name" maxlength="40" value="' + esc(draft.name) + '"></label>') +
      '<div><span class="small" style="font-weight:600">¿Hacés algún deporte? (opcional)</span><div class="chips" style="margin-top:8px">' +
      SPORTS.map(function (a) { return '<button class="chip" data-sport="' + a[0] + '" aria-pressed="' + (draft.sports.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
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
  function vHoy() {
    if (S.demo || isPro("vida")) return vHoyPro();
    var d = new Date(), hr = d.getHours(), greet = hr < 6 ? "Buenas noches" : hr < 13 ? "Buen día" : hr < 20 ? "Buenas tardes" : "Buenas noches";
    var dateStr = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }); dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    return '<p class="muted small" style="margin:0">' + esc(dateStr) + "</p><h1 class=\"hello\">" + greet + ", " + esc(S.profile.name) + "</h1>" + (armBlocks().length ? viewToggle() + (viewMode() === "now" ? nowSection() + compCard() : armSection()) : armSection()) +
      (armBlocks().length ? '<div class="card dark" style="margin-top:14px"><b>Hacé tu día tuyo con Pro</b><ul class="ticks" style="margin:8px 0 12px"><li>Tildar lo que vas haciendo y ver tu constancia</li><li>Armar tu semana con días distintos</li><li>Programas de 14 días: dormir, celular, foco y calma</li><li>Cambiar tu día cuando cambie tu vida</li><li>Avisos en el calendario de tu celular</li><li>Actividades guiadas dentro de tu día</li><li>Lo que hiciste bien hoy y tus pendientes</li></ul><button class="btn sage block" data-plan="vida">Ver Vida diaria Pro</button></div>' : "");
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
    html += quoteCard();
    if (S.intencion) html += '<div class="card small"><span class="muted">Tu intención de la semana</span><br><b>' + esc(S.intencion) + "</b></div>";
    html += sportCta() + reviewCard() + "@@ARM@@" + winsCard() + todoCard();
    html += '<div class="sec">Mis hábitos</div>';
    if (!hs.length) {
      html += '<div class="card empty"><b>Todavía no tenés hábitos</b><p class="muted small">Elegí unos pocos del menú o escribí el tuyo. Mejor pocos y que se sostengan.</p><button class="btn" id="menu">Elegir del menú</button></div>';
    } else html += dayList(hs, t, light);
    var paused = activeHabits().filter(function (h) { return h.paused; });
    if (paused.length) html += '<div class="daypart">En pausa</div><div class="card" style="padding:4px 14px">' + paused.map(function (h) { return '<div class="habit"><button class="hinfo" data-edithabit="' + h.id + '"><b>' + esc(h.name) + '</b><span class="htime none">Tocá para reanudar</span></button></div>'; }).join("") + "</div>";
    if (activeHabits().length >= habitLimit()) {
      html += '<div class="card sage"><b>Llegaste al límite del plan gratis (' + FREE_HABITS + " hábitos)</b><p class='small' style='margin:6px 0 12px'>Con Vida diaria Pro tenés hábitos sin límite, tu ritmo armado y la revisión semanal.</p><button class='btn' data-plan='vida'>Ver Vida diaria Pro</button></div>";
    } else {
      html += '<form id="addh" class="row" style="margin-top:8px"><input id="hname" placeholder="Mi propio hábito" maxlength="60" style="flex:1;min-width:0;padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surf)"><input id="htime" type="time" aria-label="Horario (opcional)" style="width:110px;padding:13px 8px;border:1px solid var(--line);border-radius:12px;background:var(--surf)"><button class="btn sage">Agregar</button></form><button class="btn ghost block" id="menu" style="margin-top:8px">Elegir del menú de hábitos</button><p class="small muted" style="margin:6px 0 0">El horario es un recordatorio, no una obligación.</p>';
    }
    html += dayCta() + reminderCard();
    html += '<div class="sec">Herramientas para cuando las necesites</div>' +
      '<button class="prod" data-open="organizar"><span class="shape">' + SHAPES.vida + '</span><span><b>Organizá tu día</b><small>Armá tu día en bloques con horarios</small></span><span class="tag ok">Gratis</span></button>' +
      '<button class="prod" data-open="respirar"><span class="shape">' + SHAPES.tenis + '</span><span><b>Respiración guiada</b><small>Un minuto para bajar un cambio</small></span><span class="tag ok">Gratis</span></button>' +
      PRODUCTS.filter(function (p) { return p.act; }).map(prodRow).join("");
    if (armBlocks().length) {
      if (viewMode() === "now") {
        var rest = html.slice(gr.length).replace("@@ARM@@", "");
        return gr + viewToggle() + prioCard() + cierreCard() + mananaCard() + nowSection() + progCard() + compCard() + weekCard() +
          '<button class="btn ghost block" id="more" style="margin-top:6px">' + (moreOpen ? "Ocultar" : "Más para hoy: constancia, frase, pendientes y hábitos") + "</button>" + (moreOpen ? rest : "");
      }
      return html.replace("@@ARM@@", viewToggle() + prioCard() + progCard() + weekCard() + armSection());
    }
    return html.replace("@@ARM@@", armSection());
  }

  // --- Planes (como los cursos) ---
  function planCard(p) {
    var pro = p.live ? isPro(p.id) : false, items = inPlan(p.id), got = items.filter(owns).length;
    var tag = !p.live ? '<span class="tag">Próximamente</span>' : pro ? '<span class="tag ok">Pro activo</span>' : '<span class="tag">Plan gratis</span>';
    var sub = !p.live ? esc(p.d) : (items.length ? got + " de " + items.length + " productos desbloqueados" : esc(p.d));
    return '<button class="plancard" data-plan="' + p.id + '" style="--c:' + p.c + '"><span class="shape">' + SHAPES[p.id] + "</span><span style='flex:1;min-width:0'><b>" + esc(p.n) + "</b><small>" + sub + "</small>" +
      (p.live && items.length ? '<span class="bar"><i style="width:' + Math.round(got * 100 / items.length) + '%"></i></span>' : "") + "</span>" + tag + "</button>";
  }
  function vPlanes() {
    return "<h1 class='hello'>Tus planes</h1>" +
      "<p class='muted small'>Vida diaria es la base: organiza tu día y tu constancia. Cualquier plan Pro la desbloquea completa, y además te suma sus propios productos para agregar a tu día. Los productos sueltos están aparte, en el Catálogo.</p>" +
      '<div class="sec">Disponibles</div>' + PLANS.filter(function (p) { return p.live; }).map(planCard).join("") +
      '<div class="sec">Próximamente</div>' + PLANS.filter(function (p) { return !p.live; }).map(planCard).join("") +
      '<div class="card small" style="margin-top:14px">¿Querés planes como Estoico, Estudiante o Emprendedor? Estamos armándolos. Los vas a ver acá.</div>';
  }
  function openPlan(id) {
    var p = planOf(id); if (!p) return;
    var pro = isPro(id), h = '<div class="row"><span class="shape">' + SHAPES[p.id] + '</span><div><h2 style="font-size:24px">' + esc(p.n) + '</h2><span class="small muted">' + (!p.live ? "Próximamente" : pro ? "Plan Pro activo" : "Plan completo (Pro)") + "</span></div></div><p style='margin:14px 0'>" + esc(p.d) + "</p>";
    if (!p.live) {
      h += '<div class="card"><b>Todavía no está disponible</b><p class="small muted" style="margin:6px 0 0">Dejá tu email y te avisamos cuando abra.</p></div>' + notifyForm(p.n, S.profile && S.profile.email);
    } else {
      h += '<div class="cols"><div class="card"><b>Gratis</b><ul class="ticks">' + p.free.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="card pro"><b>Pro</b><ul class="ticks">' + p.pros.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></div>";
      var items = inPlan(id);
      if (items.length) h += '<div class="sec" style="margin-top:6px">Productos del plan</div>' + items.map(prodRow).join("");
      if (pro) h += '<div class="card"><b>Tenés este plan Pro.</b><p class="small muted" style="margin:6px 0 0">Todo lo del plan es tuyo, incluidos los productos que se sumen.</p></div>';
      else h += '<div class="card dark" style="margin-top:12px"><div class="row between"><b>Forma ' + esc(p.n) + " Pro</b>" + (p.price ? "<span><b style='font-size:22px'>" + esc(p.price) + "</b>" + (p.was ? " <s class='small' style='opacity:.7'>" + esc(p.was) + "</s>" : "") + "</span>" : "<span class='small'>Precio a definir</span>") + "</div>" +
        (p.promo ? "<p class='small' style='margin:6px 0 0;opacity:.85'>" + esc(p.promo) + ".</p>" : "") + "</div>" + payButtons(p.pro, "Forma " + p.n + " Pro");
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
    if (link) h += '<a class="btn block" target="_blank" rel="noopener" href="' + esc(link) + '" style="margin-top:12px">Pagar con Mercado Pago</a><p class="small muted">Pagá con el mismo email de tu cuenta (' + esc(user && user.email || "") + ") para que se desbloquee solo.</p>";
    if (CFG.paypal) h += '<a class="btn ghost block" target="_blank" rel="noopener" href="' + esc(CFG.paypal) + '" style="margin-top:8px">Pagar con PayPal</a>';
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
  function pgProd(id) { return PRODUCTS.filter(function (p) { return p.prog === id; })[0]; }
  function pgOwns(id) { var p = pgProd(id); return !!(p && owns(p)); }
  function pgItem(id) { return S.prog && S.prog.items && S.prog.items[id]; }
  function pgCount(id) { var it = pgItem(id); return it && it.done ? Object.keys(it.done).length : 0; }
  function pgCur() { var id = S.prog && S.prog.cur; return id && pgOf(id) && pgOwns(id) ? id : null; }
  function pgToday(id) { var it = pgItem(id); return !!(it && it.last === today()); }
  function pgPreview(P) { return '<ol class="small pgprev">' + P.days.map(function (x) { return "<li>" + esc(x.t) + "</li>"; }).join("") + "</ol>"; }
  function progPreview(p) {
    var P = p.prog && pgOf(p.prog); if (!P) return "";
    return '<div class="card"><b>Qué vas a hacer</b><p class="small muted" style="margin:6px 0 4px">Un paso por día, de 2 a 5 minutos, durante 14 días. Medís cómo estás antes y después para ver si funcionó.</p>' + pgPreview(P) + "</div>";
  }
  function scaleChips(P, key, sel) {
    return '<div class="pgm" data-key="' + key + '">' + [1, 2, 3, 4, 5].map(function (n) { return '<button class="chip" data-pgm="' + n + '" aria-pressed="' + (sel === n) + '">' + n + "</button>"; }).join("") + '</div><div class="row between small muted" style="margin-top:4px"><span>1 · ' + esc(P.lo) + "</span><span>5 · " + esc(P.hi) + "</span></div>";
  }
  function openPrograms() {
    sheet('<h2 style="font-size:22px">Programas de 14 días</h2><p class="muted small">Uno por vez, un paso por día. Elegí el que más te haga falta ahora.</p>' +
      PG.list.map(function (P) { var it = pgItem(P.id), n = pgCount(P.id), st = !it ? "Empezar" : n >= 14 ? "Terminado" : (S.prog.cur === P.id ? "Paso " + (n + 1) + " de 14" : "Retomar");
        return '<button class="prod" data-pgopen="' + P.id + '"><span class="shape">' + SHAPES.vida + "</span><span style='flex:1;min-width:0'><b>" + esc(P.n) + "</b><small>" + esc(P.tag) + " · " + esc(P.intro.split(".")[0]) + '.</small></span><span class="tag">' + st + "</span></button>"; }).join("") +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function openProgram(id) {
    var P = pgOf(id); if (!P) return;
    if (!pgOwns(id)) { var pp = pgProd(id); return pp ? openProduct(pp.id) : undefined; }
    var it = pgItem(id), n = pgCount(id), h = '<span class="badge">Programa de 14 días</span><h2 style="font-size:24px;margin:8px 0 4px">' + esc(P.n) + "</h2>";
    if (!it) {
      h += '<p>' + esc(P.intro) + '</p><div class="card"><b>Antes de empezar</b><p class="small" style="margin:6px 0 10px">' + esc(P.q) + "</p>" + scaleChips(P, "before", 0) + '<p class="small" id="pgmsg" style="margin:8px 0 0;color:var(--err)"></p></div>' +
        '<button class="btn sage block" data-pgstart="' + id + '">Empezar programa</button><div class="sec" style="margin-top:16px">Los 14 pasos</div>' + pgPreview(P) + '<p class="small muted">' + esc(P.note) + "</p>";
    } else if (n >= 14) {
      var b = it.before, a = it.after;
      h += '<div class="card' + (a ? " sage" : "") + '"><b>¡Terminaste los 14 pasos!</b>' + (a ? '<p style="margin:8px 0 0">' + esc(P.q) + "<br><b>Antes: " + b + " · Después: " + a + "</b></p><p class=\"small\" style=\"margin:6px 0 0\">" + (P.better === "up" ? (a > b ? "Mejoraste. Mantené tus 3 pasos favoritos." : "Todavía no se nota el cambio. Es normal: probá repetir los pasos que más te sirvieron.") : (a < b ? "Bajó la tensión. Usá tu kit cuando haga falta." : "Todavía no bajó. Repetí lo que más te sirvió y, si sigue, hablalo con un profesional.")) + "</p>" :
        '<p class="small" style="margin:6px 0 10px">Último paso: contanos cómo estás ahora. ' + esc(P.q) + "</p>" + scaleChips(P, "after", 0) + '<button class="btn sage block" data-pgafter="' + id + '" style="margin-top:10px">Ver mi resultado</button>') + "</div>" +
        '<button class="btn ghost block" data-pgagain="' + id + '" style="margin-top:10px">Repetir el programa</button><button class="btn ghost block" data-pgall style="margin-top:8px">Elegir otro programa</button>';
    } else {
      var st = P.days[n], done = pgToday(id);
      h += '<div class="pgbar"><i style="width:' + Math.round(n * 100 / 14) + '%"></i></div><p class="small muted" style="margin:6px 0 12px">Paso ' + (n + 1) + " de 14 · " + n + " hechos</p>" +
        '<div class="card"><b style="font-size:18px">' + esc(st.t) + "</b><p style='margin:8px 0'>" + esc(st.a) + "</p><p class='small muted' style='margin:0'>" + esc(st.w) + "</p>" +
        (st.tool ? '<button class="btn sage block" data-act="' + st.tool + '" style="margin-top:12px">Hacerlo guiado</button>' : "") + "</div>" +
        (done ? '<div class="card sage"><b>Listo por hoy</b><p class="small" style="margin:4px 0 0">Mañana te espera el paso siguiente. Una cosa por día alcanza.</p></div>' : '<button class="btn block" data-pgdone="' + id + '">Hice este paso</button>') +
        '<div class="sec" style="margin-top:16px">Tu camino</div><ol class="small pgprev">' + P.days.map(function (x, i) { return '<li class="' + (i < n ? "ok" : i === n ? "cur" : "") + '">' + (i < n ? "✓ " : "") + esc(x.t) + "</li>"; }).join("") + "</ol>" +
        (S.prog.cur === id ? '<button class="linkbtn small" data-pgquit="' + id + '">Pausar este programa</button>' : '<button class="btn ghost block" data-pgresume="' + id + '">Retomar este programa</button>') + '<p class="small muted" style="margin-top:10px">' + esc(P.note) + "</p>";
    }
    sheet(h + '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function progCard() {
    if (!isProU() || !PG.list.length) return "";
    var id = pgCur();
    if (!id) {
      if (S.prog && S.prog.items && Object.keys(S.prog.items).length) return "";
      return '<div class="card" style="margin-top:12px"><b>Programas de 14 días</b><p class="small muted" style="margin:6px 0 10px">Resolvé algo concreto: dormir mejor, usar menos el celular, dejar de postergar o calmar la cabeza. Un paso por día.</p><button class="btn sage" data-pgall>Elegir un programa</button></div>';
    }
    var P = pgOf(id), n = pgCount(id);
    if (n >= 14) return '<div class="card sage" style="margin-top:12px"><b>Terminaste «' + esc(P.n) + '»</b><p class="small" style="margin:6px 0 10px">' + (pgItem(id).after ? "Mirá tu resultado y elegí qué sigue." : "Falta un último paso: contanos cómo estás ahora.") + '</p><button class="btn" data-pgopen="' + id + '">Ver resultado</button></div>';
    var st = P.days[n];
    return '<div class="card pgcard" style="margin-top:12px"><span class="small muted">' + esc(P.n) + " · paso " + (n + 1) + " de 14</span><b style='display:block;font-size:18px;margin:4px 0'>" + (pgToday(id) ? "Listo por hoy ✓" : esc(st.t)) + "</b>" +
      (pgToday(id) ? '<p class="small muted" style="margin:0 0 10px">Mañana, el paso siguiente.</p>' : "<p class='small' style='margin:0 0 10px'>" + esc(st.a) + "</p>") +
      '<div class="row">' + (pgToday(id) ? "" : '<button class="btn sage sm" data-pgdone="' + id + '">Hecho</button>') + '<button class="btn ghost sm" data-pgopen="' + id + '">Ver paso</button></div></div>';
  }
  function pgDone(id) {
    if (!pgOwns(id)) return; var it = pgItem(id), n = pgCount(id); if (!it || pgToday(id) || n >= 14) return;
    it.done[n] = today(); it.last = today(); S.ad = S.ad || {}; S.ad[today()] = S.ad[today()] || {}; S.ad[today()]["p|" + id] = 1; touchBest(); save(); close(); render();
    if (n + 1 >= 14) openProgram(id);
  }

  // ---------- armar mañana y prioridad del día ----------
  var showTm = false;
  function tmDate() { var d = new Date(); d.setDate(d.getDate() + 1); return d; }
  function tmThreshold() { var a = dayAns(new Date()) || {}, sl = a.sleep || 1380; return Math.max(1080, Math.min(sl - 180, 1260)); }
  function mananaCard() {
    if (!isProU() || !S.arm || !S.arm.ans) return "";
    var d = new Date(), now = d.getHours() * 60 + d.getMinutes(); if (now < tmThreshold()) return "";
    if (!(S.cierre && S.cierre[today()]) && !showTm) return "";
    var tm = tmDate(), bl = armBlocksFor(tm), k = today(tm), cur = S.tm && S.tm[k]; if (!bl.length) return "";
    return '<div class="card manana"><b>Mañana, ' + DNL[tm.getDay()].toLowerCase() + '</b><p class="small muted" style="margin:4px 0 10px">' + bl.length + " momentos · arrancás a las " + window.FormaDia.fmt(bl[0].s) + "</p>" +
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
    organizar: { t: "Organizá tu día", steps: [] }
  };
  var act = null;
  function stopBreath() { if (act && act.tm) clearInterval(act.tm); act = null; }
  function actKey(tool) { return tool === "respirar" ? "respirar" : tool === "organizar" ? "organizar" : (tool || "").indexOf("act:") === 0 ? tool.slice(4) : ""; }
  function gated(h) { return !!h.tool && !!actKey(h.tool); }
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return pad(Math.floor(s / 60)) + ":" + pad(s % 60); }
  function startAct(key) {
    if (key === "organizar") return openOrganizar();
    var A = ACTS[key]; if (!A) return;
    if (ACT_REQ[key] && !owns(prodOf(ACT_REQ[key]))) return openProduct(ACT_REQ[key]);
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
    var marked = completeAct(key); S.actn = (S.actn || 0) + 1; touchBest(); save();
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
  function dayAns(dt) { dt = dt || new Date(); var w = S.wk && S.wk[dt.getDay()]; return w && w.ans ? w.ans : (S.arm && S.arm.ans) || null; }
  function armBlocksFor(dt) { try { var a = dayAns(dt); return a && window.FormaDia ? window.FormaDia.plan(a).blocks : []; } catch (e) { return []; } }
  function armBlocks() { return armBlocksFor(new Date()); }
  // ---------- mi semana ----------
  var DNL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], DNS = ["D", "L", "M", "M", "J", "V", "S"];
  function weekDates() { var d = new Date(), k = (d.getDay() + 6) % 7, m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - k); return [0, 1, 2, 3, 4, 5, 6].map(function (i) { return new Date(m.getFullYear(), m.getMonth(), m.getDate() + i); }); }
  function wkCustom(dow) { return !!(S.wk && S.wk[dow] && S.wk[dow].ans); }
  function weekCard() {
    if (!isProU() || !S.arm || !S.arm.ans) return "";
    var t = today(), n = weekDates().filter(function (d) { return wkCustom(d.getDay()); }).length;
    return '<div class="card weekc"><div class="row between"><b>Mi semana</b><span class="small muted">' + (n ? n + (n === 1 ? " día distinto" : " días distintos") : "Todos los días igual") + '</span></div><div class="wkstrip">' +
      weekDates().map(function (d) { var c = wkCustom(d.getDay()); return '<button class="wkd' + (today(d) === t ? " today" : "") + (c ? " custom" : "") + '" data-wkday="' + d.getDay() + '" aria-label="' + DNL[d.getDay()] + ' ' + d.getDate() + '"><small>' + DNS[d.getDay()] + "</small><b>" + d.getDate() + "</b><i></i></button>"; }).join("") +
      '</div><p class="small muted" style="margin:10px 0 0">Tocá un día para verlo o armarlo distinto: el finde, un día de entrenamiento, un día liviano.</p></div>';
  }
  function wkDate(dow) { return weekDates().filter(function (d) { return d.getDay() === dow; })[0]; }
  function openWeekDay(dow, dt) {
    var F = window.FormaDia, d = dt || wkDate(dow), bl = armBlocksFor(d), cu = wkCustom(dow);
    sheet('<span class="badge">' + (cu ? "Armado para este día" : "Tu día base") + '</span><h2 style="font-size:24px;margin:8px 0 2px">' + DNL[dow] + " " + d.getDate() + '</h2><p class="small muted" style="margin:0 0 10px">Se repite todos los ' + DNL[dow].toLowerCase() + (dow === 3 ? "" : "s") + ".</p>" +
      '<div class="wklist">' + bl.map(function (b) { var K = F.KIND[b.kind]; return '<div class="wkrow"><span class="wkt">' + F.fmt(b.s) + '</span><i style="background:' + K.dot + '"></i><span>' + esc(b.label) + "</span></div>"; }).join("") + "</div>" +
      '<button class="btn sage block" data-wkedit="' + dow + '" style="margin-top:14px">' + (cu ? "Cambiar este día" : "Armar este día distinto") + "</button>" +
      (cu ? '<button class="btn ghost block" data-wkreset="' + dow + '" style="margin-top:8px">Volver a mi día base</button>' : "") +
      '<div class="sec" style="margin-top:16px">Copiar este día a</div><div class="wkto">' + [1, 2, 3, 4, 5, 6, 0].filter(function (x) { return x !== dow; }).map(function (x) { return '<button class="chip" data-wkto="' + x + '" aria-pressed="false">' + DNL[x].slice(0, 3) + "</button>"; }).join("") + '</div>' +
      '<button class="btn ghost block" data-wkcopy="' + dow + '" style="margin-top:8px">Copiar</button><button class="btn ghost block" data-close style="margin-top:8px">Cerrar</button>');
  }
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
  function armToolOf(b) { return ARMTOOL[b.label] || (b.kind === "train" ? "movimiento" : b.kind === "focus" ? "foco" : ""); }
  function armDone(b) { return !!(S.ad && S.ad[today()] && S.ad[today()][armKey(b)]); }
  function armOpen(ans) {
    if (!window.FormaDia) { alert("No se pudo cargar el armado. Revisá tu conexión y recargá."); return; }
    if (S.arm && !(S.demo || isPro("vida"))) { sheet('<h2 style="font-size:22px">Cambiar tu día es Pro</h2><p class="muted">Tu día gratis queda fijo como lo armaste. Con Vida diaria Pro lo podés cambiar cuando cambie tu vida, tildarlo y recibir avisos.</p><button class="btn block" data-plan="vida">Ver Vida diaria Pro</button><button class="btn ghost block" data-close style="margin-top:8px">Cerrar</button>'); return; }
    close();
    window.FormaDia.open({ ans: ans || null, onSave: function (a) { S.arm = { ans: a, at: today() }; save(); tab = "hoy"; render(); window.scrollTo(0, 0); } });
  }
  function armSection() {
    var bl = armBlocks();
    if (!bl.length) return '<div class="card dark"><b>Armemos tu día</b><p class="small" style="margin:6px 0 12px;opacity:.85">Respondé 12 preguntas rápidas y te armamos el día en bloques con horarios: lo fijo, lo importante, tus hábitos y tus pausas. Queda siempre acá, en Hoy.</p><button class="btn sage" id="armgo">Armar mi día</button></div>';
    var d = new Date(), now = d.getHours() * 60 + d.getMinutes(), wake = bl[0].s; if (now < wake && now + 1440 < bl[bl.length - 1].e) now += 1440;
    var tr = bl.filter(armCheckable), n = tr.filter(armDone).length, pro = S.demo || isPro("vida");
    var html = cierreCard() + mananaCard() + compCard() + '<div class="row between" style="margin:22px 0 6px"><span class="sec" style="margin:0">Tu día</span>' + (pro ? '<button class="linkbtn small" id="armedit">Cambiar mis respuestas</button>' : "") + '</div>' +
      '<p class="small muted" style="margin:0 0 6px">' + (pro && tr.length ? n + " de " + tr.length + " momentos hechos hoy. " : "") + "Sin apuro: es una guía, no una obligación.</p>" +
      '<div class="legend"><span><i class="lg past"></i>Ya pasó</span><span><i class="lg now"></i>Ahora</span><span><i class="lg next"></i>Lo que sigue</span></div><div class="tl">';
    bl.forEach(function (b) {
      var k = window.FormaDia.KIND[b.kind], ck = armCheckable(b), dn = armDone(b), isNow = now >= b.s && now < b.e, st = isNow ? "now" : now >= b.e ? "past" : "next", pgw = isNow ? Math.round((now - b.s) * 100 / (b.e - b.s)) : 0, tk = armToolOf(b), tbtn = "";
      if (pro && tk && ck && !dn) {
        var locked = ACT_REQ[tk] && !owns(prodOf(ACT_REQ[tk]));
        tbtn = '<button class="btn ' + (locked ? "ghost" : "sage") + ' sm" data-armtool="' + tk + '" style="margin-top:8px">' + (locked ? ICON.lock.replace("<svg", '<svg width="14" height="14"') + " Con Pro" : "Hacer ahora") + "</button>";
      }
      html += '<div class="blk ' + st + (dn ? " done" : "") + '"><div class="tm">' + window.FormaDia.fmt(b.s) + "<br>" + window.FormaDia.fmt(b.e) + '</div><div class="bd" role="button" tabindex="0" data-blkopen="' + bl.indexOf(b) + '"><span class="kd"><i style="background:' + k.dot + '"></i>' + k.tag + " · " + window.FormaDia.durText(b.e - b.s) + (isNow ? " · Ahora" : st === "past" ? " · Ya pasó" : "") + "</span><b>" + esc(b.label) + "</b>" + (b.note ? '<span class="nt">' + esc(b.note) + "</span>" : "") + bchips(b) + (isNow ? '<span class="pg"><i style="width:' + pgw + '%"></i></span>' : "") + tbtn + "</div>" +
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
  function cierreCard() {
    if (!isProU() || !S.arm || !S.arm.ans) return "";
    var d = new Date(), now = d.getHours() * 60 + d.getMinutes(), sl = S.arm.ans.sleep || 1380, th = Math.max(1080, Math.min(sl - 180, 1260)), t = today();
    var list = compToday(), n = list.filter(compDone).length, bl = armBlocks().filter(armCheckable), nb = bl.filter(armDone).length;
    if (S.cierre && S.cierre[t]) {
      return '<div class="card sage"><b>Día cerrado</b><p class="small" style="margin:6px 0 0">' + (n ? "Hoy cumpliste " + n + " de " + list.length + ". Eso cuenta, y mucho." : "Hoy fue un día más tranquilo. Lo importante es que volviste.") + " Mañana seguimos.</p></div>";
    }
    if (now < th && now >= 360) return "";
    return '<div class="card dark"><b>Cierre del día</b><p class="small" style="margin:6px 0 10px;opacity:.9">' + (n ? "Cumpliste " + n + " de " + list.length + " compromisos" + (nb ? " y " + nb + " momentos de tu día" : "") + ". Pasamos lo cumplido a “Lo que hice bien hoy”." : (nb ? "Hiciste " + nb + " momentos de tu día. Eso también cuenta." : "Hay días así. Cerrá el día sin culpa: mañana es otro.")) + '</p><button class="btn sage" id="cierre">Cerrar mi día</button> <button class="linkbtn small" data-tmshow style="margin-left:8px">Dejar armado mañana</button></div>';
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
    var html = '<div class="bignow ' + state + (dn ? " done" : "") + '"><span class="kd"><i style="background:' + K.dot + '"></i>' + K.tag + " · " + F.durText(b.e - b.s) + (dn ? " · Hecho" : "") + '</span>' +
      '<div class="bwhen">' + F.fmt(b.s) + " – " + F.fmt(b.e) + '</div><h2>' + esc(b.label) + '</h2><p class="bnote">' + esc(b.note || "") + "</p>" +
      '<div class="bmeta">' + when + "</div>" +
      (state === "now" ? '<span class="pg big"><i style="width:' + Math.round((now - b.s) * 100 / (b.e - b.s)) + '%"></i></span>' : "") +
      (det.length ? '<div class="bchips big">' + det.map(function (x) { return "<em>" + esc(x) + "</em>"; }).join("") + "</div>" : "") +
      '<div class="bbtns">' +
      (pro && ck && tk && !dn ? '<button class="btn block" data-armtool="' + tk + '">Hacer ahora (actividad guiada)</button>' : "") +
      (pro && ck ? '<button class="btn ' + (dn ? "ghost" : "") + ' block" data-ackb="' + i + '">' + (dn ? "Marcar como no hecho" : "Marcar como hecho") + "</button>" : "") +
      '<button class="btn ghost block" data-blkopen="' + i + '">' + (pro ? "Mis detalles de este momento" : "Ver detalle") + "</button></div></div>";
    var nb = bl[i + 1];
    if (nb) html += '<button class="nextprev" data-blkopen="' + (i + 1) + '"><span class="small muted">Sigue</span><b>' + F.fmt(nb.s) + " · " + esc(nb.label) + '</b><span class="small muted">' + F.durText(nb.e - nb.s) + "</span></button>";
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
  function compToday() {
    var c = S.comp && S.comp[today()]; if (c && c.length) return c.slice(0, 3);
    return compPool().slice(0, 3);
  }
  function compDone(txt) { return !!(S.ad && S.ad[today()] && S.ad[today()]["c|" + txt]); }
  function compCard() {
    var list = compToday(), pro = isProU(); if (!list.length) return "";
    var n = list.filter(compDone).length;
    return '<div class="card comp"><div class="row between"><b>Tus compromisos de hoy</b>' + (pro ? '<button class="linkbtn small" id="compedit">Cambiar</button>' : "") + "</div>" +
      '<p class="small muted" style="margin:4px 0 6px">' + (pro ? (n === list.length ? "¡Los cumpliste todos! No hace falta sumar más." : n + " de " + list.length + ". Pocos y claros: así se cumplen.") : "Tres cosas simples para hoy. Pocas, para que se puedan cumplir.") + "</p>" +
      list.map(function (t, i) {
        return pro ? '<div class="habit" style="padding:8px 0"><button class="check" role="checkbox" aria-checked="' + compDone(t) + '" aria-label="' + esc(t) + '" data-cack="' + i + '">' + ICON.ok + '</button><span style="flex:1;min-width:0' + (compDone(t) ? ";text-decoration:line-through;opacity:.6" : "") + '">' + esc(t) + "</span></div>"
          : '<div class="cfree"><i></i><span>' + esc(t) + "</span></div>";
      }).join("") + (pro ? "" : '<p class="small muted" style="margin:8px 0 0">Con Pro elegís los tuyos y los tildás.</p>') + "</div>";
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
  function reminderCard() {
    if (!armBlocks().length && !S.habits.some(function (h) { return !h.del && h.time; })) return "";
    if (!(S.demo || isPro("vida"))) return "";
    var perm = window.Notification ? Notification.permission : "unsupported";
    return '<div class="card" style="margin-top:12px"><b>Recordatorios</b><p class="small muted" style="margin:6px 0 10px">Para que te avisen aunque no tengas la app abierta, pasá tus horarios al calendario del celular.</p>' +
      '<button class="btn sage block" id="ics">Agregar a mi calendario</button>' +
      (perm === "default" ? '<button class="btn ghost block" id="notif" style="margin-top:8px">Avisarme con la app abierta</button>' : perm === "granted" ? '<p class="small muted" style="margin:8px 0 0">Avisos con la app abierta: activados.</p>' : "") + "</div>";
  }
  function enableNotif() {
    if (!window.Notification) { alert("Tu navegador no permite avisos. Usá el calendario."); return; }
    Notification.requestPermission().then(function () { render(); });
  }
  var notified = {};
  function checkReminders() {
    if (!window.Notification || Notification.permission !== "granted" || !S.profile || !(S.demo || isPro("vida"))) return;
    var hm = nowHM(), t = today();
    armBlocks().filter(armCheckable).forEach(function (b) {
      var k = "arm" + armKey(b) + t, bt = window.FormaDia.fmt(b.s);
      if (bt <= hm && !armDone(b) && !notified[k] && bt >= minusMin(10)) {
        notified[k] = 1; var o2 = { body: "Es tu momento: " + b.label + " (" + bt + "). Sin apuro, cuando puedas.", icon: "icon-192.png", tag: k };
        if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (r) { r.showNotification("Forma", o2); }, function () { new Notification("Forma", o2); });
        else new Notification("Forma", o2);
      }
    });
    if (S.arm && S.arm.ans) {
      var ttm = window.FormaDia.fmt(tmThreshold()), ktm = "tm" + t;
      if (ttm <= hm && ttm >= minusMin(10) && !notified[ktm] && !(S.tm && S.tm[today(tmDate())])) {
        notified[ktm] = 1; var o3 = { body: "¿Dejamos armado mañana? Son 2 minutos y mañana arrancás tranquilo.", icon: "icon-192.png", tag: ktm };
        if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (r) { r.showNotification("Forma", o3); }, function () { new Notification("Forma", o3); });
        else new Notification("Forma", o3);
      }
    }
    activeHabits().forEach(function (h) {
      var k = h.id + t;
      if (!h.paused && h.time && h.time <= hm && !h.days[t] && !notified[k] && h.time >= minusMin(10)) {
        notified[k] = 1;
        var opts = { body: "Es tu momento: " + h.name + " (" + h.time + "). Sin apuro, cuando puedas.", icon: "icon-192.png", tag: k };
        if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (r) { r.showNotification("Forma", opts); }, function () { new Notification("Forma", opts); });
        else new Notification("Forma", opts);
      }
    });
  }
  function minusMin(m) { var d = new Date(Date.now() - m * 60000); return d.getDate() === new Date().getDate() ? pad(d.getHours()) + ":" + pad(d.getMinutes()) : "00:00"; }
  function downloadIcs() {
    var hs = activeHabits().filter(function (h) { return h.time; }), ab = armBlocks().filter(armCheckable);
    if (!hs.length && !ab.length) return;
    var d = new Date(), day = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Forma//ES", "CALSCALE:GREGORIAN"];
    hs.forEach(function (h) {
      var hh = h.time.replace(":", "") + "00";
      L.push("BEGIN:VEVENT", "UID:" + h.id + "@formargentina.com", "DTSTAMP:" + day + "T000000Z", "DTSTART:" + day + "T" + hh, "DURATION:PT15M", "RRULE:FREQ=DAILY",
        "SUMMARY:" + h.name.replace(/[,;\\\n]/g, " "), "DESCRIPTION:Recordatorio de Forma. Sin apuro, cuando puedas.",
        "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:" + h.name.replace(/[,;\\\n]/g, " "), "END:VALARM", "END:VEVENT");
    });
    var CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], grp = [], hasWk = Object.keys(S.wk || {}).some(function (k) { return S.wk[k] && S.wk[k].ans; });
    if (!hasWk) grp.push({ bl: ab, day: day, rule: "FREQ=DAILY", id: "x" });
    else for (var w = 0; w < 7; w++) { var dd = new Date(); dd.setDate(dd.getDate() + ((w - dd.getDay() + 7) % 7)); grp.push({ bl: armBlocksFor(dd).filter(armCheckable), day: dd.getFullYear() + pad(dd.getMonth() + 1) + pad(dd.getDate()), rule: "FREQ=WEEKLY;BYDAY=" + CODES[dd.getDay()], id: "w" + w }); }
    grp.forEach(function (g) {
      g.bl.forEach(function (b, i) {
        var tm = window.FormaDia.fmt(b.s).replace(":", "") + "00", nm = b.label.replace(/[,;\\\n]/g, " ");
        L.push("BEGIN:VEVENT", "UID:arm" + g.id + i + "-" + b.s + "@formargentina.com", "DTSTAMP:" + g.day + "T000000Z", "DTSTART:" + g.day + "T" + tm, "DURATION:PT" + Math.max(5, b.e - b.s) + "M", "RRULE:" + g.rule,
          "SUMMARY:" + nm, "DESCRIPTION:Tu día en Forma. Sin apuro, cuando puedas.", "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:" + nm, "END:VALARM", "END:VEVENT");
      });
    });
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
      save(); tab = "hoy"; render(); if (!S.arm) armOpen(); return;
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
    if (d.pgall !== undefined) return openPrograms();
    if (d.pgopen) return openProgram(d.pgopen);
    if (d.pgm !== undefined) { var par = t.parentNode; [].slice.call(par.querySelectorAll("[data-pgm]")).forEach(function (b) { b.setAttribute("aria-pressed", b === t ? "true" : "false"); }); return; }
    if (d.pgstart) { if (!pgOwns(d.pgstart)) return; var sb = document.querySelector('#sheet .pgm[data-key=before] [aria-pressed=true]'); if (!sb) { var pm = $("#pgmsg"); if (pm) pm.textContent = "Elegí un número para empezar."; return; } S.prog = S.prog || { cur: null, items: {} }; S.prog.items[d.pgstart] = { start: today(), before: +sb.dataset.pgm, after: null, done: {}, last: null }; S.prog.cur = d.pgstart; save(); close(); render(); return openProgram(d.pgstart); }
    if (d.pgdone) return pgDone(d.pgdone);
    if (d.pgafter) { var sa = document.querySelector('#sheet .pgm[data-key=after] [aria-pressed=true]'); if (!sa) return; pgItem(d.pgafter).after = +sa.dataset.pgm; save(); render(); return openProgram(d.pgafter); }
    if (d.pgquit) { S.prog.cur = null; save(); close(); render(); return; }
    if (d.pgresume) { if (pgOwns(d.pgresume)) { S.prog.cur = d.pgresume; save(); close(); render(); openProgram(d.pgresume); } return; }
    if (d.pgagain) { delete S.prog.items[d.pgagain]; save(); render(); return openProgram(d.pgagain); }
    if (d.tmshow !== undefined) { showTm = true; render(); return; }
    if (d.tmedit !== undefined) { if (S.tm) delete S.tm[today(tmDate())]; save(); render(); return; }
    if (d.tmdone !== undefined) { var c0 = S.tm && S.tm[today()]; if (c0 && isProU()) { c0.d = c0.d ? 0 : 1; S.ad = S.ad || {}; S.ad[today()] = S.ad[today()] || {}; if (c0.d) S.ad[today()]["tm|prio"] = 1; else delete S.ad[today()]["tm|prio"]; touchBest(); save(); render(); } return; }
    if (d.wkday !== undefined) return openWeekDay(+d.wkday);
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
    if (t.id === "cierre") {
      var tdz = today(); S.wins = S.wins || {}; var wl2 = S.wins[tdz] = S.wins[tdz] || [];
      compToday().filter(compDone).forEach(function (x) { if (wl2.indexOf(x) < 0 && wl2.length < 8) wl2.push(x); });
      S.cierre = S.cierre || {}; S.cierre[tdz] = 1; save(); render(); return;
    }
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
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) { navigator.serviceWorker.register("sw.js").catch(function () {}); }
})();
