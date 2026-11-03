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
      free: ["Organizá tu día", "Respirar 1 minuto", "Hasta " + FREE_HABITS + " hábitos con racha"],
      pros: ["Hábitos sin límite", "Los 10 productos de Vida diaria", "Programas nuevos cuando salgan"] },
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
    { id: "dormir", g: "Cuerpo", s: "vida", n: "Dormir mejor", d: "Rutina de noche y horarios para descansar mejor.", area: "sueno" },
    { id: "energia", g: "Cuerpo", s: "vida", n: "Energía y movimiento", d: "Movimiento corto durante el día, sin gimnasio.", area: "energia" },
    { id: "comidas", g: "Cuerpo", s: "vida", n: "Comidas ordenadas", d: "Organizar horarios y compras. No es una dieta.", area: "comidas" },
    { id: "ansiedad", g: "Mente", s: "vida", n: "Bajar la ansiedad", d: "Respiración y pausas para el día a día. No reemplaza a un profesional.", area: "ansiedad" },
    { id: "foco", g: "Mente", s: "vida", n: "Foco y tiempo", d: "Ordená tu semana, bloques de foco y un cierre del día.", area: "foco" },
    { id: "tiempo", g: "Mente", s: "vida", n: "Tiempo para vos", d: "Espacios para descansar y hacer lo que te gusta.", area: "foco" },
    { id: "habitos-pro", g: "Orden", s: "vida", n: "Hábitos que se quedan", d: "Método para sostener hábitos en 21 días.", area: "habitos" },
    { id: "casa", g: "Orden", s: "vida", n: "Casa en orden", d: "Rutinas simples para tener la casa al día.", area: "orden" },
    { id: "plata", g: "Orden", s: "vida", n: "Plata en orden", d: "Organización de gastos. No es asesoramiento financiero.", area: "orden" },
    { id: "familia", g: "Orden", s: "vida", n: "Tiempo con los tuyos", d: "Planear momentos con familia y amigos.", area: "familia" },
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
    var out = { profile: remote.profile || local.profile || null, habits: [], best: Math.max(local.best || 0, remote.best || 0) };
    var map = {};
    (remote.habits || []).forEach(function (h) { map[h.id] = { id: h.id, name: h.name, time: h.time || "", days: Object.assign({}, h.days || {}), del: !!h.del }; });
    (local.habits || []).forEach(function (h) {
      var m = map[h.id];
      if (!m) map[h.id] = { id: h.id, name: h.name, time: h.time || "", days: Object.assign({}, h.days || {}), del: !!h.del };
      else { m.name = h.name || m.name; m.time = h.time !== undefined ? h.time : m.time; Object.keys(h.days || {}).forEach(function (d) { m.days[d] = 1; }); m.del = m.del || !!h.del; }
    });
    Object.keys(map).forEach(function (k) { out.habits.push(map[k]); });
    return out;
  }
  function pushableState() { return { profile: S.profile, habits: S.habits, best: S.best }; }
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
      var local = { profile: S.profile, habits: S.habits, best: S.best };
      var m = remote ? mergeStates(local, remote) : local;
      S.profile = m.profile; S.habits = m.habits; S.best = m.best; S.guest = false;
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
    html += '<div class="sec">Tus hábitos de hoy</div>';
    if (!hs.length) {
      var s = ["Tomar agua al despertar", "Caminar 20 minutos", "Leer 10 páginas", "Respirar 1 minuto", "Acostarme a horario"], tm = ["07:30", "18:00", "21:30", "12:00", "23:00"];
      html += '<div class="card empty"><b>Empezá con uno solo</b><p class="muted small">Elegí una sugerencia o escribí la tuya.</p><div class="chips" style="justify-content:center">' +
        s.map(function (x, i) { return '<button class="chip" data-addhabit="' + esc(x) + '" data-time="' + tm[i] + '">' + esc(x) + " · " + tm[i] + "</button>"; }).join("") + "</div></div>";
    } else {
      html += '<div class="card">' + hs.map(function (h) {
        var dots = "";
        for (var i = 6; i >= 0; i--) dots += '<i class="' + (h.days[daysBack(i)] ? "on" : "") + '"></i>';
        return '<div class="habit"><button class="check" role="checkbox" aria-checked="' + !!h.days[t] + '" aria-label="' + esc(h.name) + '" data-check="' + h.id + '">' + ICON.ok + '</button><button class="hinfo" data-edithabit="' + h.id + '" aria-label="Editar ' + esc(h.name) + '"><b>' + esc(h.name) + '</b><span class="htime' + (h.time ? (h.time <= nowHM() && !h.days[t] ? " late" : "") : " none") + '">' + (h.time ? "⏰ " + esc(h.time) : "+ Poner horario") + '</span><span class="dots">' + dots + '</span></button><span class="streak">' + habitStreak(h) + ' 🔥</span></div>';
      }).join("") + "</div>";
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
    var tag = ok ? (viaPro ? "Incluido en Pro" : "Tuyo") : (p.price || "Pronto");
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
      (ok ? '<div class="card"><b>' + (viaPro ? "Lo tenés incluido en tu plan Pro." : "Ya es tuyo.") + '</b><p class="small muted" style="margin:6px 0 0">Estamos terminando el contenido de este producto. Apenas esté listo lo vas a ver acá, sin que tengas que hacer nada.</p></div>'
        : payButtons(p.id, p.n) + (pl && pl.live ? '<div class="card" style="margin-top:12px"><b>¿Querés todo el plan?</b><p class="small muted" style="margin:6px 0 10px">Forma ' + esc(pl.n) + " Pro incluye este y los demás productos de la sección.</p><button class='btn ghost block' data-plan='" + pl.id + "'>Ver plan " + esc(pl.n) + "</button></div>" : "")) +
      (p.id === "ansiedad" || p.id === "dormir" || p.id === "comidas" || p.id === "plata" ? '<p class="small muted">Es un apoyo de bienestar y organización. No reemplaza la consulta con un profesional de la salud' + (p.id === "plata" ? " ni el asesoramiento financiero" : "") + ".</p>" : "") +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function openOrganizar() {
    close();
    var el = document.createElement("div"); el.className = "full"; el.id = "full";
    el.innerHTML = '<header><button class="btn ghost sm" data-close>← Volver</button><b>Organizá tu día</b></header><iframe src="organiza?app=1" title="Organizá tu día"></iframe>';
    document.body.appendChild(el);
  }
  var bt = null;
  function stopBreath() { if (bt) { clearTimeout(bt); bt = null; } }
  function openRespirar() {
    sheet('<h2 style="font-size:22px">Respirar 1 minuto</h2><p class="small muted">Inhalá por la nariz, retené un momento y soltá lento por la boca. Si te mareás, parás y respirás normal.</p><div class="breath"><div class="orb" id="orb">Listo</div></div><div class="row"><button class="btn block" id="bstart">Empezar</button><button class="btn ghost" data-close>Cerrar</button></div>');
  }
  function runBreath() {
    var orb = $("#orb"), btn = $("#bstart"); if (!orb) return;
    var steps = [["Inhalá", 1.35, 4000], ["Retené", 1.35, 3000], ["Soltá", 1, 6000]], total = 60000, t0 = Date.now(), i = 0;
    btn.disabled = true;
    (function next() {
      var o = $("#orb"); if (!o) return;
      if (Date.now() - t0 > total) { o.textContent = "Listo"; o.style.transform = "scale(1)"; btn.disabled = false; btn.textContent = "Otra vez"; return; }
      var s = steps[i % 3]; i++;
      o.textContent = s[0]; o.style.transition = "transform " + (s[2] / 1000) + "s ease-in-out"; o.style.transform = "scale(" + s[1] + ")";
      bt = setTimeout(next, s[2]);
    })();
  }

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
    if (t.id === "bstart") return runBreath();
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
      if (h) { if (h.days[today()]) delete h.days[today()]; else h.days[today()] = 1; touchBest(); save(); render(); }
      return;
    }
    if (d.delhabit) { if (confirm("¿Borrar este hábito? Tu racha no se pierde.")) { var hh = S.habits.filter(function (x) { return x.id === d.delhabit; })[0]; if (hh) hh.del = true; save(); render(); } return; }
    if (d.addhabit) { addHabit(d.addhabit, d.time); return; }
    if (d.edithabit) return openHabit(d.edithabit);
    if (t.id === "hsave") { var eh = S.habits.filter(function (x) { return x.id === t.dataset.id; })[0], nn = $("#e-name").value.trim(); if (eh && nn) { eh.name = nn.slice(0, 60); eh.time = $("#e-time").value || ""; save(); close(); render(); } return; }
    if (t.id === "hclear") { $("#e-time").value = ""; return; }
    if (t.id === "hdel") { if (confirm("¿Borrar este hábito? Tu racha no se pierde.")) { var hx = S.habits.filter(function (x) { return x.id === t.dataset.id; })[0]; if (hx) hx.del = true; save(); close(); render(); } return; }
    if (t.id === "notif") return enableNotif();
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
