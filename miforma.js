(function () {
  "use strict";
  var CFG = window.FORMA || {};
  var KEY = "forma_app_v1";
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
  var PRODUCTS = [
    { id: "dormir", g: "Cuerpo", s: "vida", n: "Dormir mejor", d: "Rutina de noche y horarios para descansar mejor.", area: "sueno" },
    { id: "energia", g: "Cuerpo", s: "vida", n: "Energía y movimiento", d: "Movimiento corto durante el día, sin gimnasio.", area: "energia" },
    { id: "comidas", g: "Cuerpo", s: "vida", n: "Comidas ordenadas", d: "Organizar horarios y compras. No es una dieta.", area: "comidas" },
    { id: "ansiedad", g: "Mente", s: "vida", n: "Bajar la ansiedad", d: "Respiración y pausas para el día a día. No reemplaza a un profesional.", area: "ansiedad" },
    { id: "foco", g: "Mente", s: "vida", n: "Foco sin distracciones", d: "Bloques de trabajo profundo y menos celular.", area: "foco" },
    { id: "tiempo", g: "Mente", s: "vida", n: "Tiempo para vos", d: "Espacios para descansar y hacer lo que te gusta.", area: "foco" },
    { id: "habitos-pro", g: "Orden", s: "vida", n: "Hábitos que se quedan", d: "Método para sostener hábitos. El seguimiento básico ya es gratis.", area: "habitos" },
    { id: "casa", g: "Orden", s: "vida", n: "Casa en orden", d: "Rutinas simples para tener la casa al día.", area: "orden" },
    { id: "plata", g: "Orden", s: "vida", n: "Plata en orden", d: "Organización de gastos. No es asesoramiento financiero.", area: "orden" },
    { id: "familia", g: "Orden", s: "vida", n: "Tiempo con los tuyos", d: "Planear momentos con familia y amigos.", area: "familia" },
    { id: "t-pre", g: "Tenis", s: "tenis", n: "Pre y post partido", d: "Rutina antes y después de jugar.", price: "USD 5" },
    { id: "t-resp", g: "Tenis", s: "tenis", n: "Respiración", d: "Respiración para manejar los nervios en cancha.", price: "USD 4" },
    { id: "t-mov", g: "Tenis", s: "tenis", n: "Movilidad", d: "Movilidad para jugadores.", price: "USD 6" },
    { id: "t-rut", g: "Tenis", s: "tenis", n: "Rutina física", d: "Plan físico semanal para jugadores.", price: "USD 10" },
    { id: "t-full", g: "Tenis", s: "tenis", n: "Forma Tenis Completo", d: "Todo Tenis en un solo pack.", price: "USD 20", full: true }
  ];

  // ---------- estado ----------
  var S = load();
  function load() {
    try { var r = JSON.parse(localStorage.getItem(KEY)); if (r) return r; } catch (e) {}
    return { profile: null, owned: {}, habits: [], demo: false };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  try { if (new URLSearchParams(location.search).get("demo") === "1") { S.demo = true; save(); } } catch (e) {}
  function owns(p) { return S.demo || !!S.owned[p.id] || !!S.owned.todo; }
  function today(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function daysBack(n) { var d = new Date(); d.setDate(d.getDate() - n); return today(d); }
  function streak(h) { var n = 0, i = h.days[today()] ? 0 : 1; while (h.days[daysBack(i)]) { n++; i++; } return n; }

  // ---------- helpers ----------
  var tab = "hoy";
  var $app = $("#app");
  var ICON = {
    hoy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    habitos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
    productos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><circle cx="17" cy="6.8" r="3.7"/><path d="M6.7 14l3.7 7H3z"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="3"/></svg>',
    perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>'
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

  // ---------- render ----------
  function render() {
    if (!S.profile) return renderWelcome();
    var body = { hoy: vHoy, habitos: vHabitos, productos: vProductos, perfil: vPerfil }[tab]();
    $app.innerHTML =
      '<div class="top"><div class="logo">forma<i></i></div>' + (S.demo ? '<span class="tag">modo prueba</span>' : "") + "</div>" +
      "<main>" + body + "</main>" +
      '<nav class="tabs" aria-label="Principal"><div>' +
      [["hoy", "Hoy"], ["habitos", "Hábitos"], ["productos", "Productos"], ["perfil", "Perfil"]].map(function (t) {
        return '<button data-tab="' + t[0] + '"' + (tab === t[0] ? ' aria-current="page"' : "") + ">" + ICON[t[0]] + "<span>" + t[1] + "</span></button>";
      }).join("") + "</div></nav>";
  }

  // --- bienvenida / crear perfil ---
  var draft = { name: "", email: "", areas: [], sports: [], news: true };
  function renderWelcome() {
    $app.innerHTML =
      '<div class="top"><div class="logo">forma<i></i></div></div><main class="stack">' +
      '<h1 class="hello" style="font-size:34px">Dale forma a la vida que querés</h1>' +
      '<p class="muted">Creá tu perfil en un minuto. Tus datos quedan guardados en este dispositivo.</p>' +
      '<label class="field"><span>¿Cómo te llamás?</span><input id="f-name" autocomplete="given-name" value="' + esc(draft.name) + '"></label>' +
      '<label class="field"><span>Email (opcional)</span><input id="f-email" type="email" autocomplete="email" value="' + esc(draft.email) + '"></label>' +
      '<div><span class="small" style="font-weight:600">¿Qué querés mejorar? (elegí las que quieras)</span><div class="chips" style="margin-top:8px">' +
      AREAS.map(function (a) { return '<button class="chip" data-area="' + a[0] + '" aria-pressed="' + (draft.areas.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
      '<div><span class="small" style="font-weight:600">¿Hacés algún deporte?</span><div class="chips" style="margin-top:8px">' +
      SPORTS.map(function (a) { return '<button class="chip" data-sport="' + a[0] + '" aria-pressed="' + (draft.sports.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
      '<label class="row small"><input id="f-news" type="checkbox" ' + (draft.news ? "checked" : "") + '> Avisame novedades de Forma (si dejaste email)</label>' +
      '<button class="btn block" id="create">Crear mi perfil</button><div class="msg" id="wmsg"></div>' +
      '<p class="small muted">Al crear tu perfil aceptás la <a href="privacidad">política de privacidad</a>.</p></main>';
  }

  // --- Hoy ---
  function vHoy() {
    var t = today(), done = 0, hs = S.habits;
    hs.forEach(function (h) { if (h.days[t]) done++; });
    var pct = hs.length ? Math.round(done * 100 / hs.length) : 0;
    var d = new Date(), hr = d.getHours();
    var greet = hr < 6 ? "Buenas noches" : hr < 13 ? "Buen día" : hr < 20 ? "Buenas tardes" : "Buenas noches";
    var dateStr = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }); dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    var sug = PRODUCTS.filter(function (p) { return p.s === "vida" && S.profile.areas.indexOf(p.area) >= 0; }).slice(0, 3);
    return '<p class="muted small" style="margin:0">' + esc(dateStr) + "</p>" +
      '<h1 class="hello">' + greet + ", " + esc(S.profile.name) + "</h1>" +
      '<div class="card dark row" style="margin-top:14px"><div class="ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div><b>' +
      (hs.length ? done + " de " + hs.length + " hábitos hoy" : "Todavía no tenés hábitos") + "</b><div class='small' style='opacity:.8'>" +
      (hs.length ? "Cada día cuenta." : "Armá el primero en la pestaña Hábitos.") + "</div></div></div>" +
      '<div class="sec">Herramientas gratis</div>' +
      '<button class="prod" data-open="organizar"><span class="shape">' + SHAPES.vida + '</span><span><b>Organizá tu día</b><small>Armá tu día en bloques con horarios</small></span><span class="tag ok">Gratis</span></button>' +
      '<button class="prod" data-open="respirar"><span class="shape">' + SHAPES.tenis + '</span><span><b>Respirar 1 minuto</b><small>Pausa guiada para bajar un cambio</small></span><span class="tag ok">Gratis</span></button>' +
      (sug.length ? '<div class="sec">Para vos</div>' + sug.map(prodRow).join("") : "") +
      fullBanner();
  }
  function fullBanner() {
    if (S.demo || S.owned.todo) return "";
    return '<div class="card sage" style="margin-top:14px"><h3 style="font-size:20px">Forma Completo</h3><p class="small" style="margin:6px 0 12px">Todos los productos de Vida diaria y de cada sección, en un solo acceso.</p><button class="btn" data-open="completo">Ver cómo conseguirlo</button></div>';
  }

  // --- Hábitos ---
  function vHabitos() {
    var t = today(), html = "<h1 class='hello'>Tus hábitos</h1><p class='muted small'>Marcá cada día lo que hiciste. Los últimos 7 días se ven abajo de cada uno.</p>";
    if (!S.habits.length) {
      var sug = ["Tomar agua al despertar", "Caminar 20 minutos", "Leer 10 páginas", "Respirar 1 minuto", "Acostarme a horario"];
      html += '<div class="card empty"><b>Empezá con uno solo</b><p class="muted small">Elegí una sugerencia o escribí la tuya.</p><div class="chips" style="justify-content:center">' +
        sug.map(function (s) { return '<button class="chip" data-addhabit="' + esc(s) + '">' + esc(s) + "</button>"; }).join("") + "</div></div>";
    } else {
      html += '<div class="card">' + S.habits.map(function (h) {
        var dots = "";
        for (var i = 6; i >= 0; i--) dots += '<i class="' + (h.days[daysBack(i)] ? "on" : "") + '"></i>';
        return '<div class="habit"><button class="check" role="checkbox" aria-checked="' + !!h.days[t] + '" aria-label="' + esc(h.name) + '" data-check="' + h.id + '">' + ICON.ok + '</button><div style="flex:1"><b>' + esc(h.name) + '</b><div class="dots">' + dots + '</div></div><span class="streak">' + streak(h) + ' 🔥</span><button class="btn ghost sm" data-delhabit="' + h.id + '" aria-label="Borrar">✕</button></div>';
      }).join("") + "</div>";
    }
    html += '<form id="addh" class="row" style="margin-top:8px"><input id="hname" placeholder="Nuevo hábito" maxlength="60" style="flex:1;min-width:0;padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:#fff"><button class="btn sage">Agregar</button></form>';
    return html;
  }

  // --- Productos ---
  function prodRow(p) {
    var ok = owns(p);
    return '<button class="prod" data-prod="' + p.id + '"><span class="shape">' + SHAPES[p.s] + "</span><span><b>" + esc(p.n) + "</b><small>" + esc(p.d) + '</small></span><span class="tag' + (ok ? " ok" : "") + '">' + (ok ? "Tuyo" : (p.price || "Bloqueado")) + "</span></button>";
  }
  function vProductos() {
    var html = "<h1 class='hello'>Productos</h1>";
    html += '<div class="sec">Gratis</div>' +
      '<button class="prod" data-open="organizar"><span class="shape">' + SHAPES.vida + '</span><span><b>Organizá tu día</b><small>Tu día en bloques con horarios</small></span><span class="tag ok">Gratis</span></button>' +
      '<button class="prod" data-tab="habitos"><span class="shape">' + SHAPES.vida + '</span><span><b>Seguimiento de hábitos</b><small>Base de Hábitos que se quedan</small></span><span class="tag ok">Gratis</span></button>' +
      '<button class="prod" data-open="respirar"><span class="shape">' + SHAPES.tenis + '</span><span><b>Respirar 1 minuto</b><small>Pausa guiada</small></span><span class="tag ok">Gratis</span></button>';
    html += fullBanner();
    ["Cuerpo", "Mente", "Orden"].forEach(function (g) {
      html += '<div class="sec">Vida diaria · ' + g + "</div>" + PRODUCTS.filter(function (p) { return p.s === "vida" && p.g === g; }).map(prodRow).join("");
    });
    html += '<div class="sec">Sección Tenis</div>' + PRODUCTS.filter(function (p) { return p.s === "tenis"; }).map(prodRow).join("");
    html += '<div class="sec">Próximamente</div>' + [["futbol", "Fútbol"], ["voley", "Vóley"], ["basquet", "Básquet"], ["handball", "Handball"]].map(function (s) {
      return '<div class="prod" style="cursor:default"><span class="shape">' + SHAPES[s[0]] + "</span><span><b>" + s[1] + "</b><small>Productos y plan completo</small></span><span class=\"tag\">Pronto</span></div>";
    }).join("");
    return html;
  }

  // --- Perfil ---
  function vPerfil() {
    var p = S.profile;
    return "<h1 class='hello'>Tu perfil</h1>" +
      '<div class="card stack"><label class="field"><span>Nombre</span><input id="p-name" value="' + esc(p.name) + '"></label>' +
      '<label class="field"><span>Email</span><input id="p-email" type="email" value="' + esc(p.email) + '"></label>' +
      '<div><span class="small" style="font-weight:600">Quiero mejorar</span><div class="chips" style="margin-top:8px">' +
      AREAS.map(function (a) { return '<button class="chip" data-parea="' + a[0] + '" aria-pressed="' + (p.areas.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
      '<div><span class="small" style="font-weight:600">Deportes</span><div class="chips" style="margin-top:8px">' +
      SPORTS.map(function (a) { return '<button class="chip" data-psport="' + a[0] + '" aria-pressed="' + (p.sports.indexOf(a[0]) >= 0) + '">' + a[1] + "</button>"; }).join("") + "</div></div>" +
      '<button class="btn" id="psave">Guardar cambios</button><div class="msg" id="pmsg"></div></div>' +
      '<div class="card stack"><b>Tus datos</b><p class="small muted" style="margin:0">Todo se guarda solo en este dispositivo. Si cambiás de teléfono o borrás los datos del navegador, se pierde. Descargá una copia cuando quieras.</p>' +
      '<div class="grid2"><button class="btn ghost" id="export">Descargar copia</button><button class="btn ghost" id="wipe">Borrar todo</button></div></div>' +
      '<div class="card small"><a data-link="instagram" href="' + esc(CFG.instagram || "#") + '" target="_blank" rel="noopener">Instagram @formargentina</a> · <a href="privacidad">Privacidad</a> · <a href="./">Sitio de Forma</a></div>';
  }

  // ---------- hojas / pantallas ----------
  function sheet(html) {
    close();
    var el = document.createElement("div"); el.className = "sheet"; el.id = "sheet";
    el.innerHTML = "<div>" + html + "</div>"; document.body.appendChild(el);
  }
  function close() { var s = $("#sheet"); if (s) s.remove(); var f = $("#full"); if (f) f.remove(); stopBreath(); }
  function payButtons(label) {
    var h = "";
    if (CFG.mercadoPago) h += '<a class="btn block" target="_blank" rel="noopener" href="' + esc(CFG.mercadoPago) + '">Pagar con Mercado Pago</a>';
    if (CFG.paypal) h += '<a class="btn ghost block" target="_blank" rel="noopener" href="' + esc(CFG.paypal) + '" style="margin-top:8px">Pagar con PayPal</a>';
    if (!h) {
      h = '<p class="small muted">Los pagos todavía no están abiertos. Dejá tu email y te avisamos primero' + (label ? " (" + esc(label) + ")" : "") + ".</p>" +
        '<form id="notify" class="stack"><input id="n-email" type="email" required placeholder="tu@email.com" value="' + esc(S.profile && S.profile.email) + '" style="width:100%;padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:#fff"><button class="btn block">Avisame</button><div class="msg" id="nmsg"></div></form>';
    }
    return h;
  }
  function openProduct(id) {
    var p = PRODUCTS.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var ok = owns(p);
    sheet('<div class="row"><span class="shape">' + SHAPES[p.s] + '</span><div><h2 style="font-size:22px">' + esc(p.n) + '</h2><span class="small muted">' + esc(p.g) + (p.price ? " · " + p.price : "") + "</span></div></div>" +
      '<p style="margin:14px 0">' + esc(p.d) + "</p>" +
      (ok ? '<div class="card"><b>Ya es tuyo.</b><p class="small muted" style="margin:6px 0 0">Estamos terminando el contenido de este producto. Apenas esté listo lo vas a ver acá, sin que tengas que hacer nada.</p></div>'
        : payButtons(p.n)) +
      (p.id === "ansiedad" || p.id === "dormir" || p.id === "comidas" || p.id === "plata" ? '<p class="small muted">Es un apoyo de bienestar y organización. No reemplaza la consulta con un profesional de la salud' + (p.id === "plata" ? " ni el asesoramiento financiero" : "") + ".</p>" : "") +
      '<button class="btn ghost block" data-close style="margin-top:12px">Cerrar</button>');
  }
  function openFull() {
    sheet("<h2 style='font-size:24px'>Forma Completo</h2><p class='muted'>Un solo acceso a todos los productos de Vida diaria y de cada sección, incluidos los que vayamos sumando.</p>" +
      "<div class='card small'>Precio y fecha: a definir. Quienes se anoten primero tienen un descuento de lanzamiento.</div>" + payButtons("Forma Completo") +
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

  // ---------- eventos ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button,a,[data-prod]"); if (!t) return;
    var d = t.dataset;
    if (d.tab) { close(); tab = d.tab; render(); window.scrollTo(0, 0); return; }
    if (d.close !== undefined) { close(); return; }
    if (d.prod) return openProduct(d.prod);
    if (d.open === "organizar") return openOrganizar();
    if (d.open === "respirar") return openRespirar();
    if (d.open === "completo") return openFull();
    if (t.id === "bstart") return runBreath();
    if (d.area) { toggleIn(draft.areas, d.area); readDraft(); renderWelcome(); return; }
    if (d.sport) { toggleIn(draft.sports, d.sport); readDraft(); renderWelcome(); return; }
    if (t.id === "create") {
      readDraft();
      if (!draft.name.trim()) { $("#wmsg").textContent = "Escribí tu nombre para continuar."; return; }
      var em = draft.email.trim();
      if (em && !/^\S+@\S+\.\S+$/.test(em)) { $("#wmsg").textContent = "Revisá el email."; return; }
      S.profile = { name: draft.name.trim(), email: em, areas: draft.areas.slice(), sports: draft.sports.slice(), created: today() };
      save();
      if (em && draft.news) postLead(em, "app-perfil");
      tab = "hoy"; render(); return;
    }
    if (d.check) { var h = S.habits.filter(function (x) { return x.id === d.check; })[0]; if (h) { if (h.days[today()]) delete h.days[today()]; else h.days[today()] = 1; save(); render(); } return; }
    if (d.delhabit) { if (confirm("¿Borrar este hábito?")) { S.habits = S.habits.filter(function (x) { return x.id !== d.delhabit; }); save(); render(); } return; }
    if (d.addhabit) { addHabit(d.addhabit); return; }
    if (d.parea) { toggleIn(S.profile.areas, d.parea); save(); render(); return; }
    if (d.psport) { toggleIn(S.profile.sports, d.psport); save(); render(); return; }
    if (t.id === "psave") {
      var n = $("#p-name").value.trim(); if (!n) { $("#pmsg").textContent = "El nombre no puede estar vacío."; return; }
      S.profile.name = n; S.profile.email = $("#p-email").value.trim(); save(); $("#pmsg").textContent = "Guardado."; return;
    }
    if (t.id === "export") {
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: "application/json" })); a.download = "forma-mis-datos.json"; a.click(); return;
    }
    if (t.id === "wipe") { if (confirm("Se borran tu perfil y tus hábitos de este dispositivo. ¿Seguir?")) { localStorage.removeItem(KEY); S = load(); draft = { name: "", email: "", areas: [], sports: [], news: true }; render(); } return; }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "addh") { e.preventDefault(); addHabit($("#hname").value); }
    if (e.target.id === "notify") {
      e.preventDefault(); var em = $("#n-email").value.trim(); $("#nmsg").textContent = "Enviando...";
      postLead(em, "app-compra").then(function (ok) { $("#nmsg").textContent = ok ? "Listo, te avisamos." : "Ahora no se pudo enviar. Probá más tarde."; });
    }
  });
  function addHabit(name) {
    name = (name || "").trim(); if (!name) return;
    S.habits.push({ id: "h" + Date.now(), name: name.slice(0, 60), days: {} }); save(); render();
  }
  function readDraft() {
    var a = $("#f-name"), b = $("#f-email"), c = $("#f-news");
    if (a) draft.name = a.value; if (b) draft.email = b.value; if (c) draft.news = c.checked;
  }

  render();
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) { navigator.serviceWorker.register("sw.js").catch(function () {}); }
})();
