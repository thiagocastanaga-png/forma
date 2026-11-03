(function () {
  "use strict";
  var CFG = window.FORMA || {};
  var KEY = "forma_app_v1";
  var FREE_HABITS = 5;
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
    ["sueno", "Dormir mejor"], ["ansiedad", "Bajar la ansiedad"], ["habitos", "Armar hábitos"], ["foco", "Foco"],
    ["energia", "Más energía"], ["comidas", "Comer ordenado"], ["orden", "Orden en casa y plata"], ["familia", "Tiempo con los tuyos"]
  ];
  var SPORTS = [["tenis", "Tenis"], ["futbol", "Fútbol"], ["voley", "Vóley"], ["basquet", "Básquet"], ["handball", "Handball"]];

  // Planes: cada uno es como un "curso". Gratis para empezar, Pro para todo el plan.
  var PLANS = [
    { id: "vida", n: "Vida diaria", c: "#86A892", pro: "plan-vida", live: true, price: "",
      d: "Organizá tu día, sumá hábitos y encontrá calma y energía. Para gente común, a tu ritmo.",
      free: ["Organizá tu día", "Respiración guiada de 1 minuto", "Hasta " + FREE_HABITS + " hábitos con horario y racha"],
      pros: ["Tu día armado a tu medida con un cuestionario", "Actividades guiadas: respiración, movimiento, foco, cierre del día y sueño", "Hábitos sin límite", "Recordatorios en tu calendario"] },
    { id: "tenis", n: "Tenis", c: "#C6F432", pro: "t-full", live: true, price: "USD 20", was: "USD 29", promo: "Precio de preventa para las primeras 10 compras",
      d: "Rutinas de preparación para jugadores que compiten.",
      free: ["Respirar 1 minuto", "Aviso cuando abra la preventa"],
      pros: ["Pre y post partido", "Respiración y enfoque", "Movilidad", "Rutina física", "Revisión de tu rutina por WhatsApp"] },
    { id: "futbol", n: "Fútbol", c: "#4C7DFF", pro: "plan-futbol", live: false, d: "Rutinas para futbolistas: antes y después del partido, movilidad y fuerza." },
    { id: "voley", n: "Vóley", c: "#FFC83D", pro: "plan-voley", live: false, d: "Rutinas para vóley: saltos, hombros y recuperación." },
    { id: "basquet", n: "Básquet", c: "#FF8A4C", pro: "plan-basquet", live: false, d: "Rutinas para básquet: explosividad, tobillos y recuperación." },
    { id: "handball", n: "Handball", c: "#B9A7F0", pro: "plan-handball", live: false, d: "Rutinas para handball: lanzamiento, hombros y recuperación." }
  ];
  function planOf(id) { return PLANS.filter(function (p) { return p.id === id; })[0]; }

  // Productos sueltos (no son el plan completo)
  var PRODUCTS = [
    { id: "dormir", g: "Cuerpo", s: "vida", n: "Dormir mejor", d: "Rutina guiada de 10 minutos para bajar el ritmo antes de dormir.", area: "sueno", act: "dormir" },
    { id: "energia", g: "Cuerpo", s: "vida", n: "Energía y movimiento", d: "Pausa de movimiento guiada de 5 minutos, sin gimnasio ni equipamiento.", area: "energia", act: "movimiento" },
    { id: "comidas", g: "Cuerpo", s: "vida", n: "Comidas ordenadas", d: "Organizar horarios y compras. No es una dieta.", area: "comidas", soon: true },
    { id: "ansiedad", g: "Mente", s: "vida", n: "Bajar la ansiedad", d: "Respiración guiada de 3 minutos para bajar la ansiedad del día. No reemplaza a un profesional.", area: "ansiedad", act: "calma" },
    { id: "foco", g: "Mente", s: "vida", n: "Foco y tiempo", d: "Bloque de foco de 25 minutos con intención y cierre.", area: "foco", act: "foco" },
    { id: "tiempo", g: "Mente", s: "vida", n: "Tiempo para vos", d: "Espacios para descansar y hacer lo que te gusta.", area: "foco", soon: true },
    { id: "cierre", g: "Mente", s: "vida", n: "Cierre del día", d: "Repasá tu día, soltá lo pendiente y dejá armado mañana. 5 minutos guiados.", area: "orden", act: "cierre" },
    { id: "habitos-pro", g: "Orden", s: "vida", n: "Hábitos que se quedan", d: "Método para sostener hábitos en 21 días.", area: "habitos", soon: true },
    { id: "casa", g: "Orden", s: "vida", n: "Casa en orden", d: "Rutinas simples para tener la casa al día.", area: "orden", soon: true },
    { id: "plata", g: "Orden", s: "vida", n: "Plata en orden", d: "Organización de gastos. No es asesoramiento financiero.", area: "orden", soon: true },
    { id: "familia", g: "Orden", s: "vida", n: "Tiempo con los tuyos", d: "Planear momentos con familia y amigos.", area: "familia", soon: true },
    { id: "t-pre", g: "Tenis", s: "tenis", n: "Pre y post partido", d: "Rutina antes y después de jugar.", price: "USD 5", was: "USD 7" },
    { id: "t-resp", g: "Tenis", s: "tenis", n: "Respiración y enfoque", d: "Para manejar los nervios antes, durante y después del partido.", price: "USD 4", was: "USD 6" },
    { id: "t-mov", g: "Tenis", s: "tenis", n: "Movilidad", d: "Sesiones cortas para días de descanso o antes de entrenar.", price: "USD 6", was: "USD 8" },
    { id: "t-rut", g: "Tenis", s: "tenis", n: "Rutina física", d: "Plan físico semanal para jugadores.", price: "USD 10", was: "USD 15" }
  ];
  function prodOf(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function inPlan(pid) { return PRODUCTS.filter(function (p) { return p.s === pid; }); }

  // ---------- estado ----------
  var S = load();
  function blank() { return { profile: null, owned: {}, habits: [], demo: false, guest: false, best: 0 }; }
  function load() {
    var r = null;
    try { r = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!r) r = blank();
    if (!r.owned) r.owned = {};
    if (!r.habits) r.habits = [];
    if (!r.best) r.best = 0;
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
  function anyDone(day) { return S.habits.some(function (h) { return h.days && h.days[day]; }); }
  function streakNow() { var n = 0, i = anyDone(today()) ? 0 : 1; while (i < 4000 && anyDone(daysBack(i))) { n++; i++; } return n; }
  function habitStreak(h) { var n = 0, i = h.days[today()] ? 0 : 1; while (i < 4000 && h.days[daysBack(i)]) { n++; i++; } return n; }
  function totalDone() { var n = 0; S.habits.forEach(function (h) { n += Object.keys(h.days || {}).length; }); return n; }
  function activeHabits() { return S.habits.filter(function (h) { return !h.del; }).sort(function (a, b) { var x = a.time || "99:99", y = b.time || "99:99"; return x < y ? -1 : x > y ? 1 : 0; }); }
  function pad(n) { return ("0" + n).slice(-2); }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function touchBest() { var n = streakNow(); if (n > S.best) S.best = n; }

  // permisos
  function hasProduct(id) { return S.demo || !!S.owned[id] || !!S.owned.todo; }
  function isPro(planId) { var p = planOf(planId); return !!p && hasProduct(p.pro); }
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
  function fieldCss() { return "width:100%;padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:#fff"; }

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
  function mergeStates(local, remote) {
    var out = { profile: remote.profile || local.profile || null, habits: [], day: local.day || remote.day || null, notes: Object.assign({}, remote.notes || {}, local.notes || {}), best: Math.max(local.best || 0, remote.best || 0) };
    var map = {};
    (remote.habits || []).forEach(function (h) { map[h.id] = { id: h.id, name: h.name, time: h.time || "", tool: h.tool || "", gen: !!h.gen, days: Object.assign({}, h.days || {}), del: !!h.del }; });
    (local.habits || []).forEach(function (h) {
      var m = map[h.id];
      if (!m) map[h.id] = { id: h.id, name: h.name, time: h.time || "", tool: h.tool || "", gen: !!h.gen, days: Object.assign({}, h.days || {}), del: !!h.del };
      else { m.name = h.name || m.name; m.time = h.time !== undefined ? h.time : m.time; Object.keys(h.days || {}).forEach(function (d) { m.days[d] = 1; }); m.del = m.del || !!h.del; }
    });
    Object.keys(map).forEach(function (k) { out.habits.push(map[k]); });
    return out;
  }
  function pushableState() { return { profile: S.profile, habits: S.habits, best: S.best, day: S.day || null, notes: S.notes || {} }; }
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
      var local = { profile: S.profile, habits: S.habits, best: S.best, day: S.day, notes: S.notes };
      var m = remote ? mergeStates(local, remote) : local;
      S.profile = m.profile; S.habits = m.habits; S.best = m.best; S.day = m.day; S.notes = m.notes; S.guest = false;
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
    var n = streakNow(), topPro = isPro("vida") || PLANS.some(function (p) { return isPro(p.id); });
    $app.innerHTML =
      '<div class="top"><div class="logo">forma<i></i></div><div class="row" style="gap:8px">' +
      (S.demo ? '<span class="tag">modo prueba</span>' : "") +
      '<span class="plan-chip' + (topPro ? " pro" : "") + '">' + (topPro ? "Pro" : "Gratis") + "</span>" +
      '<span class="flame-chip' + (n ? " on" : "") + '" title="Tu racha">' + ICON.flame + "<b>" + n + "</b></span></div></div>" +
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
          '<label class="field"><span>Nombre de usuario</span><input id="a-user" autocomplete="username" autocapitalize="none" maxlength="21" placeholder="ej: thiago_10" value="' + esc(draft.username) + '"></label>' +
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
      '<h1 class="hello" style="font-size:30px">Un último paso</h1><p class="muted">Contanos qué querés mejorar y te sugerimos por dónde empezar. Podés cambiarlo cuando quieras.</p>' +
      (user ? "" : '<label class="field"><span>¿Cómo te llamás?</span><input id="f-name" autocomplete="given-name" maxlength="40" value="' + esc(draft.name) + '"></label>') +
      '<div><span class="small" style="font-weight:600">¿Qué querés mejorar? (elegí las que quieras)</span><div class="chips" style="margin-top:8px">' +
      AREAS.map(function (a) { return '<button class="chip" data-area="' + a[0] + '" aria-pressed="' + (draft.areas.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
      '<div><span class="small" style="font-weight:600">¿Hacés algún deporte?</span><div class="chips" style="margin-top:8px">' +
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
  function vHoy() {
    var t = today(), hs = activeHabits(), done = hs.filter(function (h) { return h.days[t]; }).length;
    var pct = hs.length ? Math.round(done * 100 / hs.length) : 0, n = streakNow();
    var d = new Date(), hr = d.getHours();
    var greet = hr < 6 ? "Buenas noches" : hr < 13 ? "Buen día" : hr < 20 ? "Buenas tardes" : "Buenas noches";
    var dateStr = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }); dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    var sug = PRODUCTS.filter(function (p) { return p.s === "vida" && S.profile.areas.indexOf(p.area) >= 0 && !owns(p); }).slice(0, 2);
    var head = anyDone(t) ? "¡Hoy ya sumaste a tu racha!" : (n ? "Marcá un hábito hoy para no perder tu racha" : "Marcá un hábito para empezar tu racha");
    var html = '<p class="muted small" style="margin:0">' + esc(dateStr) + "</p>" +
      '<h1 class="hello">' + greet + ", " + esc(S.profile.name) + "</h1>" +
      '<div class="card dark streakcard"><div class="row between"><div class="row"><span class="bigflame' + (n ? " on" : "") + '">' + ICON.flame + "</span><div><b style='font-size:30px;line-height:1'>" + n + "</b><div class='small' style='opacity:.85'>" + (n === 1 ? "día de racha" : "días de racha") + "</div></div></div>" +
      '<div class="ring" style="--p:' + pct + '"><b>' + pct + "%</b></div></div>" + weekStrip() + '<div class="small" style="opacity:.85;margin-top:6px">' + head + "</div></div>";
    html += dayCta() + '<div class="sec">Tu día</div>';
    if (!hs.length) {
      var s = ["Tomar agua al despertar", "Caminar 20 minutos", "Leer 10 páginas", "Respirar 1 minuto", "Acostarme a horario"], tm = ["07:30", "18:00", "21:30", "12:00", "23:00"];
      html += '<div class="card empty"><b>Empezá con uno solo</b><p class="muted small">Elegí una sugerencia o escribí la tuya.</p><div class="chips" style="justify-content:center">' +
        s.map(function (x, i) { return '<button class="chip" data-addhabit="' + esc(x) + '" data-time="' + tm[i] + '">' + esc(x) + " · " + tm[i] + "</button>"; }).join("") + "</div></div>";
    } else {
      html += dayList(hs, t);
    }
    if (hs.length >= habitLimit()) {
      html += '<div class="card sage"><b>Llegaste al límite del plan gratis (' + FREE_HABITS + " hábitos)</b><p class='small' style='margin:6px 0 12px'>Con Vida diaria Pro tenés hábitos sin límite y todos los productos del plan.</p><button class='btn' data-plan='vida'>Ver Vida diaria Pro</button></div>";
    } else {
      html += '<form id="addh" class="row" style="margin-top:8px"><input id="hname" placeholder="Nuevo hábito" maxlength="60" style="flex:1;min-width:0;padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:#fff"><input id="htime" type="time" aria-label="Horario (opcional)" style="width:110px;padding:13px 8px;border:1px solid var(--line);border-radius:12px;background:#fff"><button class="btn sage">Agregar</button></form><p class="small muted" style="margin:6px 0 0">El horario es opcional y flexible: es solo un recordatorio, no una obligación.</p>' + reminderCard();
    }
    if (hs.length >= habitLimit()) html += reminderCard();
    html += '<div class="sec">Herramientas gratis</div>' +
      '<button class="prod" data-open="organizar"><span class="shape">' + SHAPES.vida + '</span><span><b>Organizá tu día</b><small>Armá tu día en bloques con horarios</small></span><span class="tag ok">Gratis</span></button>' +
      '<button class="prod" data-open="respirar"><span class="shape">' + SHAPES.tenis + '</span><span><b>Respirar 1 minuto</b><small>Pausa guiada para bajar un cambio</small></span><span class="tag ok">Gratis</span></button>';
    if (sug.length) html += '<div class="sec">Para vos</div>' + sug.map(prodRow).join("");
    return html;
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
      "<p class='muted small'>Cada plan es como un curso. Empezás gratis y pasás a <b>Pro</b> cuando quieras para desbloquear todo el plan. Los productos sueltos están aparte, en el Catálogo.</p>" +
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
  function vPerfil() {
    var p = S.profile, n = streakNow(), initial = (p.name || "?").charAt(0).toUpperCase();
    var syncTxt = user ? (sync.state === "ok" ? "Sincronizado" : sync.state === "pending" ? "Sincronizando..." : sync.state === "error" ? "Sin sincronizar (se reintenta al cambiar algo)" : "Conectado") : "";
    var html = "<h1 class='hello'>Tu perfil</h1>" +
      '<div class="card row"><span class="avatar">' + esc(initial) + '</span><div style="min-width:0"><b style="font-size:20px">' + esc(p.name) + "</b><div class='small muted'>" + (acct.username ? "@" + esc(acct.username) : "Sin cuenta") + (p.created ? " · desde " + esc(p.created) : "") + "</div></div></div>" +
      '<div class="grid3"><div class="card stat"><b>' + n + '</b><span>racha</span></div><div class="card stat"><b>' + S.best + '</b><span>mejor racha</span></div><div class="card stat"><b>' + totalDone() + '</b><span>hábitos hechos</span></div></div>' +
      '<div class="card"><b>Tus planes</b><div style="margin-top:8px">' + PLANS.filter(function (x) { return x.live; }).map(function (x) {
        return '<div class="row between" style="padding:6px 0"><span class="row"><span class="shape" style="width:26px;height:26px">' + SHAPES[x.id] + "</span>" + esc(x.n) + '</span><span class="tag' + (isPro(x.id) ? " ok" : "") + '">' + (isPro(x.id) ? "Pro" : "Gratis") + "</span></div>";
      }).join("") + "</div></div>";
    html += '<div class="card stack"><b>Tu cuenta</b>' +
      (user ? '<div class="small muted">' + esc(user.email || "") + " · " + esc(syncTxt) + "</div>" : '<p class="small muted" style="margin:0">Estás usando la app sin cuenta: tus datos están solo en este dispositivo y no podés guardar compras.</p><button class="btn sage block" id="mkacct">Crear cuenta o iniciar sesión</button>') +
      '<label class="field"><span>Nombre</span><input id="p-name" value="' + esc(p.name) + '" maxlength="40"></label>' +
      '<div><span class="small" style="font-weight:600">Quiero mejorar</span><div class="chips" style="margin-top:8px">' +
      AREAS.map(function (a) { return '<button class="chip" data-parea="' + a[0] + '" aria-pressed="' + (p.areas.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
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
    sheet('<div class="row"><span class="shape">' + SHAPES[p.s] + '</span><div><span class="badge">Producto suelto</span><h2 style="font-size:22px;margin-top:4px">' + esc(p.n) + '</h2><span class="small muted">' + esc(pl ? pl.n : "") + " · " + esc(p.g) + (p.price ? " · " + esc(p.price) : "") + "</span></div></div>" +
      '<p style="margin:14px 0">' + esc(p.d) + "</p>" +
      (ok ? '<div class="card"><b>' + (viaPro ? "Lo tenés incluido en tu plan Pro." : "Ya es tuyo.") + "</b>" + (p.act ? '<p class="small muted" style="margin:6px 0 12px">Es una actividad guiada: se tilda en tu día solo cuando la hacés completa.</p><button class="btn block" data-act="' + p.act + '">Hacer ahora</button>' : '<p class="small muted" style="margin:6px 0 0">Estamos terminando el contenido de este producto. Apenas esté listo lo vas a ver acá, sin que tengas que hacer nada.</p>') + "</div>"
        : actPreview(p) + (p.soon ? '<div class="card"><b>Todavía no está disponible</b><p class="small muted" style="margin:6px 0 0">Lo estamos armando. Va a estar incluido en Vida diaria Pro.</p></div>' : payButtons(p.id, p.n)) + (pl && pl.live ? '<div class="card" style="margin-top:12px"><b>¿Querés todo el plan?</b><p class="small muted" style="margin:6px 0 10px">Forma ' + esc(pl.n) + " Pro incluye este y los demás productos de la sección.</p><button class='btn ghost block' data-plan='" + pl.id + "'>Ver plan " + esc(pl.n) + "</button></div>" : "")) +
      (p.id === "ansiedad" || p.id === "dormir" || p.id === "comidas" || p.id === "plata" ? '<p class="small muted">Es un apoyo de bienestar y organización. No reemplaza la consulta con un profesional de la salud' + (p.id === "plata" ? " ni el asesoramiento financiero" : "") + ".</p>" : "") +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function actPreview(p) {
    var A = p.act && ACTS[p.act]; if (!A) return "";
    return '<div class="card"><b>Qué vas a hacer</b><ol class="small" style="margin:8px 0 0;padding-left:18px">' + A.steps.map(function (x) { return "<li>" + esc(x.t) + (x.s ? " <span class='muted'>(" + (x.s >= 60 ? Math.round(x.s / 60) + " min" : x.s + " s") + ")</span>" : "") + "</li>"; }).join("") + "</ol></div>";
  }
  function openOrganizar() {
    close();
    var el = document.createElement("div"); el.className = "full"; el.id = "full";
    el.innerHTML = '<header><button class="btn ghost sm" data-close>← Volver</button><b>Organizá tu día</b></header><iframe src="organiza?app=1" title="Organizá tu día"></iframe><div style="padding:10px 14px;border-top:1px solid var(--line)"><button class="btn block" id="orgdone">Ya organicé mi día</button></div>';
    document.body.appendChild(el);
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
    var marked = completeAct(key); touchBest(); save();
    var n = streakNow(), el = $("#full"); act = null; if (!el) return;
    el.innerHTML = '<div class="actbody" style="text-align:center;padding-top:80px"><div class="bigflame on" style="margin:0 auto 10px;width:70px;height:70px">' + ICON.flame + '</div><h2>¡Actividad completa!</h2><p class="muted">' + esc(A.t) + " hecha de verdad. " + (marked ? "Quedó tildada en tu día." : "") + '</p><p><b style="font-size:28px">' + n + "</b> " + (n === 1 ? "día" : "días") + ' de racha</p><button class="btn block" data-actdone>Volver a mi día</button></div>';
  }
  function completeAct(key) {
    var t = today(), hs = activeHabits().filter(function (h) { return gated(h) && actKey(h.tool) === key && !h.days[t]; });
    if (!hs.length) return false;
    hs[0].days[t] = 1; return true;
  }
  function openRespirar() { startAct("respirar"); }

  // ---------- acciones ----------
  function setMsg(t, ok) { var m = $("#amsg"); if (m) { m.textContent = t; m.style.color = ok ? "var(--sage-d)" : "#b3261e"; } }
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
    S.habits.push({ id: "h" + Date.now(), name: name.slice(0, 60), time: /^\d\d:\d\d$/.test(time || "") ? time : "", days: {} }); save(); render();
  }

  // ---------- tu día (línea de tiempo) ----------
  var PARTS = [["Mañana", "00:00", "12:00"], ["Tarde", "12:00", "19:00"], ["Noche", "19:00", "99:99"]];
  function habitRow(h, t, isNext) {
    var dots = "";
    for (var i = 6; i >= 0; i--) dots += '<i class="' + (h.days[daysBack(i)] ? "on" : "") + '"></i>';
    var tool = h.tool ? toolLabel(h.tool) : "";
    return '<div class="habit' + (isNext ? " next" : "") + '"><button class="check" role="checkbox" aria-checked="' + !!h.days[t] + '" aria-label="' + esc(h.name) + '" data-check="' + h.id + '">' + ICON.ok + '</button>' +
      '<button class="hinfo" data-edithabit="' + h.id + '" aria-label="Editar ' + esc(h.name) + '"><b>' + esc(h.name) + '</b><span class="htime' + (h.time ? (h.time <= nowHM() && !h.days[t] ? " late" : "") : " none") + '">' + (h.time ? "⏰ " + esc(h.time) : "+ Poner horario") + (isNext ? " · Lo que sigue" : "") + '</span><span class="dots">' + dots + '</span></button>' +
      (tool && !h.days[t] ? '<button class="btn sage sm" data-tool="' + esc(h.tool) + '">' + esc(tool) + "</button>" : '<span class="streak">' + habitStreak(h) + " 🔥</span>") + "</div>";
  }
  function toolLabel(tl) { return actKey(tl) ? "Hacer" : "Ver"; }
  function dayList(hs, t) {
    var hm = nowHM(), nextId = null;
    hs.forEach(function (h) { if (!nextId && h.time && h.time >= hm && !h.days[t]) nextId = h.id; });
    var html = "";
    PARTS.forEach(function (pt) {
      var items = hs.filter(function (h) { return h.time && h.time >= pt[1] && h.time < pt[2]; });
      if (!items.length) return;
      html += '<div class="daypart">' + pt[0] + '</div><div class="card" style="padding:4px 14px">' + items.map(function (h) { return habitRow(h, t, h.id === nextId); }).join("") + "</div>";
    });
    var none = hs.filter(function (h) { return !h.time; });
    if (none.length) html += '<div class="daypart">Sin horario</div><div class="card" style="padding:4px 14px">' + none.map(function (h) { return habitRow(h, t, false); }).join("") + "</div>";
    return html;
  }
  function dayCta() {
    if (S.demo || isPro("vida")) {
      if (!S.day) return '<div class="card sage"><b>Armemos tu día</b><p class="small" style="margin:6px 0 12px">Contestá un cuestionario corto y te armamos el día completo, con tus horarios, tus herramientas y tus recordatorios.</p><button class="btn" id="dayquiz">Armar mi día</button></div>';
      return '<div class="row between small" style="margin:0 0 10px"><span class="muted">Día armado a tu medida</span><button class="linkbtn" id="dayquiz">Rehacer con el cuestionario</button></div>';
    }
    return '<div class="card dark"><b>Tu día, armado a tu medida</b><p class="small" style="margin:6px 0 12px;opacity:.85">Con Vida diaria Pro contestás un cuestionario y te armamos el día completo: hábitos en tus horarios, respiración, foco, comidas y cierre del día, con recordatorios.</p><button class="btn sage" data-plan="vida">Ver Vida diaria Pro</button></div>';
  }
  function mm(t) { var a = t.split(":"); return (+a[0]) * 60 + (+a[1]); }
  function hmFrom(m) { m = Math.max(0, Math.min(1439, Math.round(m / 5) * 5)); return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function ownTool(id) { var p = prodOf(id); if (!p || !owns(p)) return ""; return p.act ? "act:" + p.act : "prod:" + id; }
  function buildDay(q) {
    var wake = mm(q.wake), sleep = mm(q.sleep); if (sleep <= wake) sleep += 1440; sleep = Math.min(sleep, 1439);
    var ws = q.workStart ? mm(q.workStart) : null, we = q.workEnd ? mm(q.workEnd) : null, lunch = mm(q.lunch);
    var A = q.areas || [], has = function (a) { return A.indexOf(a) >= 0; }, soft = q.pace === "suave", strong = q.pace === "intenso";
    var out = [], n = 0;
    function add(m, name, tool) { out.push({ id: "g" + Date.now() + "_" + (n++), name: name, time: hmFrom(m), tool: tool || "", gen: true, days: {} }); }
    add(wake, "Tomar agua al despertar");
    add(wake + 10, "Respirar 1 minuto", "respirar");
    add(wake + 25, "Organizar mi día", "organizar");
    if (has("comidas")) add(wake + 45, "Desayuno tranquilo", ownTool("comidas"));
    if (ws !== null && we !== null && we > ws) {
      add(ws, "Bloque de foco (45 min)", ownTool("foco"));
      if (!soft && we - ws >= 300) add(ws + (we - ws) / 2 + 30, "Segundo bloque de foco", ownTool("foco"));
    }
    add(lunch, "Almuerzo", has("comidas") ? ownTool("comidas") : "");
    if (has("ansiedad") || strong) add(lunch + 180, "Pausa de respiración", ownTool("ansiedad") || "respirar");
    if (q.move && q.move !== "no") add(q.move === "manana" ? wake + 60 : (we !== null ? we + 45 : lunch + 300), "Movimiento (20 min)", ownTool("energia"));
    if (has("orden")) add((we !== null ? we : lunch + 240) + 90, "Casa y plata en orden (15 min)", ownTool("casa"));
    if (has("comidas")) add(sleep - 150, "Cena tranquila", ownTool("comidas"));
    if (has("familia")) add(sleep - 180, "Tiempo con los tuyos", ownTool("familia"));
    if (has("habitos")) add(sleep - 100, "Repasar mis hábitos", ownTool("habitos-pro"));
    add(sleep - 60, "Cierre del día y preparar mañana", ownTool("cierre") || "organizar");
    add(sleep - 30, "Rutina para dormir", ownTool("dormir"));
    return out;
  }
  function openQuiz() {
    var q = (S.day && S.day.quiz) || { wake: "07:00", sleep: "23:00", workStart: "09:00", workEnd: "18:00", lunch: "13:00", pace: "normal", move: "tarde", areas: (S.profile && S.profile.areas) || [] };
    function tin(id, label, v) { return '<label class="field"><span>' + label + '</span><input id="' + id + '" type="time" value="' + esc(v || "") + '"></label>'; }
    sheet('<h2 style="font-size:22px">Armemos tu día</h2><p class="small muted">Contanos cómo es tu día y te armamos una propuesta. Después podés mover, cambiar o borrar lo que quieras.</p>' +
      '<div class="grid2" style="margin-top:12px">' + tin("q-wake", "Me despierto", q.wake) + tin("q-sleep", "Me acuesto", q.sleep) + "</div>" +
      '<label class="row small" style="margin:12px 0 4px"><input id="q-nowork" type="checkbox" ' + (q.workStart ? "" : "checked") + '> <span>No tengo horario fijo de trabajo o estudio</span></label>' +
      '<div class="grid2">' + tin("q-ws", "Empiezo a trabajar/estudiar", q.workStart) + tin("q-we", "Termino", q.workEnd) + "</div>" +
      '<div style="margin-top:10px">' + tin("q-lunch", "Almuerzo", q.lunch) + "</div>" +
      '<div style="margin-top:12px"><span class="small" style="font-weight:600">¿Qué querés trabajar?</span><div class="chips" style="margin-top:8px">' +
      AREAS.map(function (a) { return '<button class="chip" data-qarea="' + a[0] + '" aria-pressed="' + (q.areas.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
      '<div class="grid2" style="margin-top:12px"><label class="field"><span>Movimiento</span><select id="q-move"><option value="no"' + (q.move === "no" ? " selected" : "") + '>No por ahora</option><option value="manana"' + (q.move === "manana" ? " selected" : "") + '>A la mañana</option><option value="tarde"' + (q.move === "tarde" ? " selected" : "") + '>A la tarde</option></select></label>' +
      '<label class="field"><span>Ritmo</span><select id="q-pace"><option value="suave"' + (q.pace === "suave" ? " selected" : "") + '>Suave</option><option value="normal"' + (q.pace === "normal" ? " selected" : "") + '>Normal</option><option value="intenso"' + (q.pace === "intenso" ? " selected" : "") + '>Intenso</option></select></label></div>' +
      '<div class="msg" id="qmsg"></div><button class="btn block" id="qgo">Armar mi día</button><button class="btn ghost block" data-close style="margin-top:8px">Cancelar</button>');
  }
  function submitQuiz() {
    var nowork = $("#q-nowork").checked, areas = [].slice.call(document.querySelectorAll("[data-qarea][aria-pressed=true]")).map(function (b) { return b.dataset.qarea; });
    var q = { wake: val("q-wake"), sleep: val("q-sleep"), workStart: nowork ? "" : val("q-ws"), workEnd: nowork ? "" : val("q-we"), lunch: val("q-lunch"), areas: areas, move: val("q-move"), pace: val("q-pace") };
    if (!q.wake || !q.sleep || !q.lunch) { $("#qmsg").textContent = "Completá a qué hora te despertás, almorzás y te acostás."; return; }
    if (!nowork && (!q.workStart || !q.workEnd || mm(q.workEnd) <= mm(q.workStart))) { $("#qmsg").textContent = "Revisá el horario de trabajo o estudio, o marcá que no tenés horario fijo."; return; }
    S.habits.forEach(function (h) { if (h.gen) h.del = true; });
    buildDay(q).forEach(function (h) { S.habits.push(h); });
    S.day = { quiz: q, at: today() };
    save(); close(); tab = "hoy"; render(); window.scrollTo(0, 0);
  }

  // ---------- horarios y recordatorios ----------
  function openHabit(id) {
    var h = S.habits.filter(function (x) { return x.id === id; })[0]; if (!h) return;
    sheet('<h2 style="font-size:22px">Tu hábito</h2><p class="small muted">Elegí un horario de referencia: te sirve de recordatorio, no hace falta cumplirlo al minuto.</p>' +
      '<label class="field" style="margin-top:12px"><span>Nombre</span><input id="e-name" maxlength="60" value="' + esc(h.name) + '"></label>' +
      '<label class="field" style="margin-top:12px"><span>Horario (opcional)</span><input id="e-time" type="time" value="' + esc(h.time || "") + '"></label>' +
      '<button class="linkbtn small" id="hclear" style="margin:8px 0 14px">Quitar horario</button>' +
      '<button class="btn block" id="hsave" data-id="' + h.id + '">Guardar</button>' +
      '<div class="grid2" style="margin-top:10px"><button class="btn ghost" id="hdel" data-id="' + h.id + '">Borrar hábito</button><button class="btn ghost" data-close>Cerrar</button></div>');
  }
  function reminderCard() {
    if (!S.habits.some(function (h) { return !h.del && h.time; })) return "";
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
    if (!window.Notification || Notification.permission !== "granted" || !S.profile) return;
    var hm = nowHM(), t = today();
    activeHabits().forEach(function (h) {
      var k = h.id + t;
      if (h.time && h.time <= hm && !h.days[t] && !notified[k] && h.time >= minusMin(10)) {
        notified[k] = 1;
        var opts = { body: "Es tu momento: " + h.name + " (" + h.time + "). Sin apuro, cuando puedas.", icon: "icon-192.png", tag: k };
        if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (r) { r.showNotification("Forma", opts); }, function () { new Notification("Forma", opts); });
        else new Notification("Forma", opts);
      }
    });
  }
  function minusMin(m) { var d = new Date(Date.now() - m * 60000); return d.getDate() === new Date().getDate() ? pad(d.getHours()) + ":" + pad(d.getMinutes()) : "00:00"; }
  function downloadIcs() {
    var hs = activeHabits().filter(function (h) { return h.time; });
    if (!hs.length) return;
    var d = new Date(), day = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Forma//ES", "CALSCALE:GREGORIAN"];
    hs.forEach(function (h) {
      var hh = h.time.replace(":", "") + "00";
      L.push("BEGIN:VEVENT", "UID:" + h.id + "@formargentina.com", "DTSTAMP:" + day + "T000000Z", "DTSTART:" + day + "T" + hh, "DURATION:PT15M", "RRULE:FREQ=DAILY",
        "SUMMARY:" + h.name.replace(/[,;\\\n]/g, " "), "DESCRIPTION:Recordatorio de Forma. Sin apuro, cuando puedas.",
        "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:" + h.name.replace(/[,;\\\n]/g, " "), "END:VALARM", "END:VEVENT");
    });
    L.push("END:VCALENDAR");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([L.join("\r\n")], { type: "text/calendar" })); a.download = "forma-recordatorios.ics"; a.click();
  }
  setInterval(checkReminders, 30000);

  // ---------- eventos ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button,a,[data-prod]"); if (!t) return;
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
      save(); tab = "hoy"; render(); return;
    }
    if (d.check) {
      var h = S.habits.filter(function (x) { return x.id === d.check; })[0];
      if (h) { if (h.days[today()]) { delete h.days[today()]; touchBest(); save(); render(); } else if (gated(h)) { startAct(actKey(h.tool)); } else { h.days[today()] = 1; touchBest(); save(); render(); } }
      return;
    }
    if (d.delhabit) { if (confirm("¿Borrar este hábito? Tu racha no se pierde.")) { var hh = S.habits.filter(function (x) { return x.id === d.delhabit; })[0]; if (hh) hh.del = true; save(); render(); } return; }
    if (d.addhabit) { addHabit(d.addhabit, d.time); return; }
    if (d.edithabit) return openHabit(d.edithabit);
    if (t.id === "hsave") { var eh = S.habits.filter(function (x) { return x.id === t.dataset.id; })[0], nn = $("#e-name").value.trim(); if (eh && nn) { eh.name = nn.slice(0, 60); eh.time = $("#e-time").value || ""; save(); close(); render(); } return; }
    if (t.id === "hclear") { $("#e-time").value = ""; return; }
    if (t.id === "hdel") { if (confirm("¿Borrar este hábito? Tu racha no se pierde.")) { var hx = S.habits.filter(function (x) { return x.id === t.dataset.id; })[0]; if (hx) hx.del = true; save(); close(); render(); } return; }
    if (t.id === "notif") return enableNotif();
    if (t.id === "dayquiz") return openQuiz();
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
    if (e.target.id === "addh") { e.preventDefault(); addHabit($("#hname").value, $("#htime").value); }
    if (e.target.id === "notify") {
      e.preventDefault(); var em = $("#n-email").value.trim(); $("#nmsg").textContent = "Enviando...";
      postLead(em, "app-compra").then(function (ok) { $("#nmsg").textContent = ok ? "Listo, te avisamos." : "Ahora no se pudo enviar. Probá más tarde."; });
    }
  });
  document.addEventListener("input", function (e) { if (e.target && e.target.id === "act-in") updateNext(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var id = e.target && e.target.id;
    if (id === "a-pass") { if (mode === "login") doLogin(); else if (mode === "register") doRegister(); }
    if (id === "r-pass") doRecovery();
  });

  // ---------- inicio ----------
  initSb();
  render();
  if (sb) {
    sb.auth.onAuthStateChange(function (ev) { if (ev === "PASSWORD_RECOVERY") { mode = "recovery"; render(); } });
    sb.auth.getSession().then(function (r) { if (r && r.data && r.data.session && mode !== "recovery") return onSession(r.data.session); }).catch(function () {});
  }
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) { navigator.serviceWorker.register("sw.js").catch(function () {}); }
})();
