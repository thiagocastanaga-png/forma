/* Forma: herramientas con memoria (registros, tarjetas, planes, contadores).
   Se cargan antes de miforma.js. Guardan sus datos en S.tl[id] (se sincroniza con la cuenta). */
(function () {
  "use strict";
  var cur = null, F = {}, ses = null, tick = null;
  function BR() { return window.FormaBridge; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function p2(n) { return ("0" + n).slice(-2); }
  function dk(d) { return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
  function K(n) { var d = new Date(); d.setDate(d.getDate() - (n || 0)); return dk(d); }
  var DN = ["D", "L", "M", "M", "J", "V", "S"];
  function lbl(k) { return DN[new Date(k + "T12:00:00").getDay()]; }
  function toMin(t) { var a = String(t || "").split(":"); return (+a[0] || 0) * 60 + (+a[1] || 0); }
  function hm(m) { m = Math.round(m); var h = Math.floor(m / 60), r = m % 60; return h ? (h + " h" + (r ? " " + r + " min" : "")) : r + " min"; }
  function clock(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return p2(Math.floor(m / 60)) + ":" + p2(m % 60); }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function avg(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
  function sd(a) { var m = avg(a); return Math.sqrt(avg(a.map(function (x) { return (x - m) * (x - m); }))); }
  function S() { var s = BR().S(); s.tl = s.tl || {}; return s; }
  function H(id, def) { var s = S(); if (!s.tl[id]) s.tl[id] = def || {}; return s.tl[id]; }
  function commit(id) { H(id).at = new Date().toISOString(); BR().save(); }
  function mondayKey() { var d = new Date(), k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return dk(d); }

  // ---------- piezas visuales ----------
  function bars(vals, o) {
    o = o || {}; var max = o.max || Math.max.apply(null, vals.map(function (x) { return x.v || 0; }).concat([1]));
    var line = o.line ? '<u class="txline" style="bottom:' + Math.min(100, Math.round(o.line * 100 / max)) + '%"></u>' : "";
    return '<div class="txbars">' + vals.map(function (x) {
      var h = x.v ? Math.max(7, Math.round(x.v * 100 / max)) : 0;
      return '<div class="txb"><div class="txbc">' + line + '<i class="' + (x.c || "") + '" style="height:' + h + '%"></i></div><small>' + esc(x.l) + "</small></div>";
    }).join("") + "</div>";
  }
  function stat(v, l) { return '<div class="txs"><b>' + esc(v) + "</b><small>" + esc(l) + "</small></div>"; }
  function stats(a) { return '<div class="txstats">' + a.map(function (x) { return stat(x[0], x[1]); }).join("") + "</div>"; }
  function chips(key, opts, sel, ev) {
    return '<div class="chips txchips">' + opts.map(function (o) {
      return '<button class="chip" data-tx="' + (ev || "set") + '" data-ta="' + key + '" data-tb="' + esc(o[0]) + '" aria-pressed="' + (String(sel) === String(o[0]) ? "true" : "false") + '">' + esc(o[1]) + "</button>";
    }).join("") + "</div>";
  }
  function inp(key, type, extra) { return '<input class="txin" data-f="' + key + '" type="' + type + '" value="' + esc(F[key] != null ? F[key] : "") + '" ' + (extra || "") + ">"; }
  function field(label, html) { return '<label class="txf"><span>' + esc(label) + "</span>" + html + "</label>"; }
  function btn(txt, a, x, y, cls) { return '<button class="btn ' + (cls || "sage") + ' block" data-tx="' + a + '"' + (x != null ? ' data-ta="' + esc(x) + '"' : "") + (y != null ? ' data-tb="' + esc(y) + '"' : "") + ' style="margin-top:10px">' + esc(txt) + "</button>"; }
  function mini(txt, a, x, y) { return '<button class="txmini" data-tx="' + a + '"' + (x != null ? ' data-ta="' + esc(x) + '"' : "") + (y != null ? ' data-tb="' + esc(y) + '"' : "") + ">" + txt + "</button>"; }
  function note(t) { return '<p class="small muted" style="margin:10px 0 0">' + t + "</p>"; }
  function card(inner, cls) { return '<div class="card txc ' + (cls || "") + '">' + inner + "</div>"; }
  function lastN(n) { var o = []; for (var i = n - 1; i >= 0; i--) o.push(K(i)); return o; }
  function streakWhere(fn) { var n = 0, i = fn(K(0)) ? 0 : 1; if (i === 1 && !fn(K(1))) return 0; for (; i < 400; i++) { if (fn(K(i))) n++; else break; } return n; }

  var APPS = {};

  // ================= REGISTRO DE SUEÑO =================
  APPS.sueno = {
    view: function () {
      var h = H("sueno", { log: {} }), L = h.log;
      if (F.bed == null) { F.bed = "23:00"; F.wake = "07:00"; F.q = 3; F.when = "hoy"; }
      var dur = (toMin(F.wake) - toMin(F.bed) + 1440) % 1440;
      var vals = lastN(7).map(function (k) { var e = L[k]; return { l: lbl(k), v: e ? e.h : 0, c: e ? (e.h >= 7 && e.h <= 9.5 ? "ok" : "warn") : "" }; });
      var es = Object.keys(L).sort().reverse().slice(0, 14).map(function (k) { return L[k]; });
      var out = card("<b>¿Cómo dormiste?</b>" +
        '<div class="txrow2">' + field("Me acosté a las", inp("bed", "time")) + field("Me desperté a las", inp("wake", "time")) + "</div>" +
        '<p class="small" style="margin:4px 0 8px">Dormiste <b>' + hm(dur) + "</b></p>" +
        '<span class="small muted">¿Cómo te sentiste al despertar?</span>' + chips("q", [[1, "Mal"], [2, "Cansado"], [3, "Normal"], [4, "Bien"], [5, "Excelente"]], F.q) +
        '<div style="height:8px"></div>' + chips("when", [["hoy", "Esta noche pasada"], ["ayer", "La anterior"]], F.when) +
        btn("Guardar", "save"));
      if (es.length) {
        var hs = es.map(function (e) { return e.h; }), beds = es.map(function (e) { var m = toMin(e.bed); return m < 720 ? m + 1440 : m; });
        var ins;
        if (es.length < 3) ins = "Con 3 noches registradas empezamos a ver tu patrón.";
        else if (avg(hs) < 6.5) ins = "Estás durmiendo poco. Probá acostarte 30 minutos antes durante esta semana y mirá cómo cambia cómo te sentís.";
        else if (sd(beds) > 60) ins = "Tu hora de acostarte cambia mucho (±" + Math.round(sd(beds)) + " min). Una hora fija ayuda más que dormir de más un día.";
        else ins = "Tenés un ritmo bastante estable. Mantenelo y fijate qué noches te hacen sentir mejor.";
        var good = es.filter(function (e) { return e.q >= 4; }), bad = es.filter(function (e) { return e.q <= 2; });
        if (good.length >= 2 && bad.length >= 2) ins += " Tus mejores noches fueron de unas " + avg(good.map(function (e) { return e.h; })).toFixed(1).replace(".", ",") + " h; las peores, de " + avg(bad.map(function (e) { return e.h; })).toFixed(1).replace(".", ",") + " h.";
        out += card("<b>Tus últimas 7 noches</b>" + bars(vals, { max: 10, line: 7 }) + '<p class="small muted" style="margin:0">La línea marca 7 horas.</p>' +
          stats([[hm(avg(hs) * 60), "promedio"], [clock(avg(beds)), "te acostás en promedio"], ["±" + Math.round(sd(beds)) + " min", "variación"]]) + '<p class="small" style="margin:12px 0 0">' + esc(ins) + "</p>");
        out += card("<b>Registros</b>" + Object.keys(L).sort().reverse().slice(0, 6).map(function (k) { var e = L[k]; return '<div class="txli"><span>' + esc(lbl(k) + " " + k.slice(8) + "/" + k.slice(5, 7)) + " · " + esc(e.bed) + " a " + esc(e.wake) + " · <b>" + hm(e.h * 60) + "</b></span>" + mini("Borrar", "del", k) + "</div>"; }).join(""));
      }
      return out + note("Es un registro personal. Si dormir te cuesta hace mucho tiempo, consultá con un profesional de la salud.");
    },
    act: function (a, x, y) {
      var h = H("sueno", { log: {} });
      if (a === "set") { F[x] = y; return; }
      if (a === "save") { var dur = ((toMin(F.wake) - toMin(F.bed) + 1440) % 1440) / 60; if (!F.bed || !F.wake || dur < 1) return; h.log[F.when === "ayer" ? K(1) : K(0)] = { bed: F.bed, wake: F.wake, h: Math.round(dur * 10) / 10, q: +F.q }; commit("sueno"); return; }
      if (a === "del") { delete h.log[x]; commit("sueno"); }
    }
  };

  // ================= REGISTRO DE CELULAR =================
  APPS.pantalla = {
    view: function () {
      var h = H("pantalla", { limit: 180, log: {} }), L = h.log, lim = h.limit || 180;
      if (F.when == null) F.when = "hoy";
      var vals = lastN(7).map(function (k) { var e = L[k]; return { l: lbl(k), v: e ? e.m : 0, c: e ? (e.m <= lim ? "ok" : "warn") : "" }; });
      var wk = lastN(7).filter(function (k) { return L[k]; }).map(function (k) { return L[k].m; }), pw = lastN(14).slice(0, 7).filter(function (k) { return L[k]; }).map(function (k) { return L[k].m; });
      var st = streakWhere(function (k) { return L[k] && L[k].m <= lim; });
      var out = card("<b>Tu límite diario</b>" + chips("lim", [[60, "1 h"], [120, "2 h"], [180, "3 h"], [240, "4 h"], [300, "5 h"]], lim, "lim") + note("Elegilo realista. Un límite que cumplís vale más que uno que nunca cumplís."));
      out += card("<b>Anotá tu tiempo de pantalla</b>" + note("Lo ves en Ajustes del celular, en Tiempo de uso o Bienestar digital.") +
        '<div class="txrow2" style="margin-top:8px">' + field("Horas", inp("hh", "number", 'min="0" max="24" placeholder="0" inputmode="numeric"')) + field("Minutos", inp("mm", "number", 'min="0" max="59" placeholder="0" inputmode="numeric"')) + "</div>" +
        chips("when", [["hoy", "Hoy"], ["ayer", "Ayer"]], F.when) + btn("Guardar", "save"));
      if (wk.length) {
        var delta = pw.length ? Math.round((avg(wk) - avg(pw)) * 100 / Math.max(1, avg(pw))) : null;
        var ins = avg(wk) <= lim ? "Estás dentro de tu límite en promedio. Bien." : "Estás por encima de tu límite. Probá la herramienta “Antes de abrir el celular” en los momentos en que más lo usás.";
        out += card("<b>Últimos 7 días</b>" + bars(vals, { line: lim }) + '<p class="small muted" style="margin:0">La línea es tu límite (' + hm(lim) + ").</p>" +
          stats([[hm(avg(wk)), "promedio por día"], [st + (st === 1 ? " día" : " días"), "seguidos dentro del límite"], [delta == null ? "–" : (delta > 0 ? "+" : "") + delta + "%", "vs semana anterior"]]) + '<p class="small" style="margin:12px 0 0">' + ins + "</p>");
      }
      return out;
    },
    act: function (a, x, y) {
      var h = H("pantalla", { limit: 180, log: {} });
      if (a === "set") { F[x] = y; return; }
      if (a === "lim") { h.limit = +y; commit("pantalla"); return; }
      if (a === "save") { var m = (+F.hh || 0) * 60 + (+F.mm || 0); if (m <= 0 || m > 1440) return; h.log[F.when === "ayer" ? K(1) : K(0)] = { m: m }; F.hh = ""; F.mm = ""; commit("pantalla"); }
    }
  };

  // ================= MATRIZ DE PRIORIDADES =================
  var QS = [["ui", "Urgente e importante", "Hacelo hoy", "#FF8A4C"], ["ni", "Importante, no urgente", "Agendalo con fecha", "#86A892"], ["un", "Urgente, no importante", "Resolvelo rápido o pedí ayuda", "#FFC83D"], ["nn", "Ni urgente ni importante", "Soltalo sin culpa", "#B9A7F0"]];
  APPS.matriz = {
    view: function () {
      var h = H("matriz", { items: [] }), it = h.items; if (F.q == null) F.q = "ui";
      var td = K(0), foco = it.filter(function (x) { return x.f === td && !x.done; });
      var out = card("<b>Tu foco de hoy</b>" + (foco.length ? foco.map(function (x) { return '<div class="txli"><span>' + esc(x.t) + "</span>" + mini("Hecho", "done", x.id) + "</div>"; }).join("") : '<p class="small muted" style="margin:8px 0 0">Marcá con ★ hasta 3 tareas para hoy. Con eso alcanza.</p>'), "txfoco");
      out += card("<b>Agregar una tarea</b>" + field("¿Qué tenés pendiente?", inp("t", "text", 'maxlength="80" placeholder="Ej: entregar el trabajo"')) + '<span class="small muted">¿Dónde va?</span>' +
        chips("q", QS.map(function (q) { return [q[0], q[1]]; }), F.q) + btn("Agregar", "add"));
      QS.forEach(function (q) {
        var L = it.filter(function (x) { return x.q === q[0]; });
        out += '<div class="card txq" style="border-left:5px solid ' + q[3] + '"><b>' + esc(q[1]) + '</b><small class="muted"> · ' + esc(q[2]) + "</small>" +
          (L.length ? L.map(function (x) { return '<div class="txli' + (x.done ? " done" : "") + '"><span>' + esc(x.t) + "</span><span class='txacts'>" + (x.done ? "" : mini(x.f === td ? "★" : "☆", "star", x.id) + mini("Mover", "mv", x.id)) + mini(x.done ? "Deshacer" : "✓", "done", x.id) + mini("✕", "del", x.id) + "</span></div>"; }).join("") : '<p class="small muted" style="margin:8px 0 0">Vacío</p>') + "</div>";
      });
      if (it.some(function (x) { return x.done; })) out += btn("Limpiar las hechas", "clear", null, null, "ghost");
      return out + note("Tip: lo que más rinde está en “Importante, no urgente”. Si todo es urgente, algo se agendó tarde.");
    },
    act: function (a, x, y) {
      var h = H("matriz", { items: [] }), it = h.items, td = K(0);
      function f(id) { return it.filter(function (z) { return z.id === id; })[0]; }
      if (a === "set") { F[x] = y; return; }
      if (a === "add") { var t = (F.t || "").trim(); if (!t) return; it.push({ id: uid(), t: t.slice(0, 80), q: F.q || "ui", done: false }); F.t = ""; }
      else if (a === "done") { var d = f(x); if (d) { d.done = !d.done; if (d.done) d.f = null; } }
      else if (a === "del") { h.items = it.filter(function (z) { return z.id !== x; }); }
      else if (a === "mv") { var m = f(x); if (m) { var ix = QS.map(function (q) { return q[0]; }).indexOf(m.q); m.q = QS[(ix + 1) % 4][0]; } }
      else if (a === "star") { var s = f(x); if (s) { if (s.f === td) s.f = null; else if (it.filter(function (z) { return z.f === td && !z.done; }).length < 3) s.f = td; else return false; } }
      else if (a === "clear") { h.items = it.filter(function (z) { return !z.done; }); }
      commit("matriz");
    }
  };

  // ================= FOCO CON CONTADOR =================
  APPS.enfoque = {
    view: function () {
      var h = H("enfoque", { log: {}, park: [] }), td = K(0), L = h.log;
      if (ses) {
        var left = Math.max(0, ses.end - Date.now());
        return card('<div style="text-align:center"><small class="muted">Una sola tarea</small><h3 style="margin:4px 0 14px">' + esc(ses.task || "Foco") + '</h3><div class="txbig" id="fcT">' + clk(left) + '</div><div class="actbar" style="margin:14px 0"><i id="fcB" style="width:' + Math.round((1 - left / ses.total) * 100) + '%"></i></div></div>' +
          '<span class="small muted">¿Se te vino algo a la cabeza? Anotalo y seguí.</span>' + '<div class="txrow2" style="grid-template-columns:1fr auto;align-items:end">' + inp("pk", "text", 'maxlength="60" placeholder="Para después..."') + mini("Anotar", "park") + "</div>" +
          '<p class="small muted" style="margin:8px 0 0">Anotadas en esta sesión: ' + ses.n + "</p>" + btn("Terminar ahora", "stop", null, null, "ghost"));
      }
      if (F.done) { var dn = F.done; F.done = null; return card("<b>Sesión terminada</b><p style='margin:8px 0'>Trabajaste " + dn.m + " minutos" + (dn.task ? " en “" + esc(dn.task) + "”" : "") + ".</p>" + (dn.n ? '<p class="small muted">Anotaste ' + dn.n + " cosa" + (dn.n > 1 ? "s" : "") + " para después. No se perdieron.</p>" : "") + btn("Otra sesión", "again")) + stats2(h, td); }
      if (F.min == null) F.min = h.last || 25;
      var out = card("<b>Nueva sesión</b>" + field("¿En qué vas a trabajar?", inp("task", "text", 'maxlength="60" placeholder="Una sola cosa"')) + '<span class="small muted">Duración</span>' + chips("min", [[15, "15 min"], [25, "25 min"], [45, "45 min"], [60, "60 min"]], F.min) + btn("Empezar", "start") + note("Dejá el celular lejos. Si te distraés, anotalo en “para después” y volvé."));
      return out + stats2(h, td);
    },
    act: function (a, x, y) {
      var h = H("enfoque", { log: {}, park: [] });
      if (a === "set") { F[x] = y; return; }
      if (a === "start") { var m = +F.min || 25; ses = { total: m * 60000, end: Date.now() + m * 60000, task: (F.task || "").trim(), m: m, n: 0 }; h.last = m; startTick(); return; }
      if (a === "park") { var t = (F.pk || "").trim(); if (!t || !ses) return false; h.park.unshift({ id: uid(), t: t.slice(0, 60) }); h.park = h.park.slice(0, 30); ses.n++; F.pk = ""; commit("enfoque"); return; }
      if (a === "stop") { finish(false); return; }
      if (a === "again") { F.task = ""; return; }
      if (a === "pdel") { h.park = h.park.filter(function (z) { return z.id !== x; }); commit("enfoque"); }
    }
  };
  function clk(ms) { var s = Math.ceil(ms / 1000); return p2(Math.floor(s / 60)) + ":" + p2(s % 60); }
  function stats2(h, td) {
    var L = h.log, vals = lastN(7).map(function (k) { var m = (L[k] || []).reduce(function (s, e) { return s + e.m; }, 0); return { l: lbl(k), v: m, c: m >= 25 ? "ok" : "" }; });
    var today = (L[td] || []).reduce(function (s, e) { return s + e.m; }, 0), week = vals.reduce(function (s, v) { return s + v.v; }, 0), ns = lastN(7).reduce(function (s, k) { return s + (L[k] || []).length; }, 0);
    var o = card("<b>Tu foco</b>" + bars(vals) + stats([[hm(today), "hoy"], [hm(week), "últimos 7 días"], [ns, "sesiones"]]));
    if (h.park && h.park.length) o += card("<b>Para después</b>" + h.park.slice(0, 8).map(function (p) { return '<div class="txli"><span>' + esc(p.t) + "</span>" + mini("✓", "pdel", p.id) + "</div>"; }).join(""));
    return o;
  }
  function finish(done) {
    if (!ses) return; var h = H("enfoque", { log: {}, park: [] }), el = Math.min(ses.m, Math.round((Date.now() - (ses.end - ses.total)) / 60000));
    var m = done ? ses.m : el; if (m >= 5) { var k = K(0); (h.log[k] = h.log[k] || []).push({ m: m, task: ses.task, t: Date.now() }); commit("enfoque"); F.done = { m: m, task: ses.task, n: ses.n }; }
    ses = null; clearInterval(tick); tick = null;
  }
  function startTick() {
    clearInterval(tick); tick = setInterval(function () {
      if (!document.getElementById("tx") || cur !== "enfoque" || !ses) { clearInterval(tick); tick = null; if (!document.getElementById("tx")) ses = null; return; }
      var left = Math.max(0, ses.end - Date.now()), t = document.getElementById("fcT"), b = document.getElementById("fcB");
      if (t) t.textContent = clk(left); if (b) b.style.width = Math.round((1 - left / ses.total) * 100) + "%";
      if (left <= 0) { finish(true); paint(); }
    }, 500);
  }

  // ================= ÁNIMO =================
  var MOODS = [[1, "Mal"], [2, "Bajo"], [3, "Normal"], [4, "Bien"], [5, "Muy bien"]];
  var TAGS = ["Cansancio", "Estrés", "Tranquilidad", "Motivación", "Soledad", "Enojo", "Alegría", "Preocupación", "Concentración"];
  APPS.animo = {
    view: function () {
      var h = H("animo", { log: {} }), L = h.log; if (!F.tags) F.tags = [];
      var out = card("<b>¿Cómo estás ahora?</b>" + chips("v", MOODS, F.v) + '<div style="height:10px"></div><span class="small muted">¿Qué lo explica? (opcional)</span><div class="chips txchips">' +
        TAGS.map(function (t) { return '<button class="chip" data-tx="tag" data-ta="' + t + '" aria-pressed="' + (F.tags.indexOf(t) >= 0 ? "true" : "false") + '">' + t + "</button>"; }).join("") + "</div>" +
        field("Una nota (opcional)", inp("note", "text", 'maxlength="140" placeholder="Qué pasó, qué pensás..."')) + btn("Guardar", "save"));
      var days = lastN(14), vals = days.map(function (k) { var e = L[k]; var v = e && e.length ? avg(e.map(function (z) { return z.v; })) : 0; return { l: lbl(k), v: v, c: v >= 4 ? "ok" : (v && v <= 2 ? "warn" : "") }; });
      var all = []; Object.keys(L).forEach(function (k) { (L[k] || []).forEach(function (e) { all.push(Object.assign({ k: k }, e)); }); });
      if (all.length) {
        var w1 = lastN(7).reduce(function (a, k) { return a.concat((L[k] || []).map(function (e) { return e.v; })); }, []), w0 = lastN(14).slice(0, 7).reduce(function (a, k) { return a.concat((L[k] || []).map(function (e) { return e.v; })); }, []);
        var tc = {}; all.slice(-30).forEach(function (e) { (e.tags || []).forEach(function (t) { tc[t] = (tc[t] || 0) + 1; }); });
        var top = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a]; })[0];
        var part = { m: [], t: [], n: [] }; all.forEach(function (e) { var hh = toMin(e.t) / 60; part[hh < 13 ? "m" : hh < 20 ? "t" : "n"].push(e.v); });
        var best = Object.keys(part).filter(function (p) { return part[p].length >= 2; }).sort(function (a, b) { return avg(part[b]) - avg(part[a]); })[0];
        var ins = []; if (w1.length && w0.length) ins.push(avg(w1) >= avg(w0) ? "Esta semana estás igual o mejor que la anterior." : "Esta semana estás un poco más bajo que la anterior. Mirá qué cambió.");
        if (top) ins.push("Lo que más aparece es: " + top.toLowerCase() + ".");
        if (best) ins.push("Tu mejor momento suele ser a la " + { m: "mañana", t: "tarde", n: "noche" }[best] + ".");
        out += card("<b>Últimos 14 días</b>" + bars(vals, { max: 5 }) + (w1.length ? stats([[avg(w1).toFixed(1).replace(".", ","), "promedio semanal (1 a 5)"], [all.length, "registros"]]) : "") + '<p class="small" style="margin:12px 0 0">' + esc(ins.join(" ")) + "</p>");
        out += card("<b>Últimos registros</b>" + all.slice(-5).reverse().map(function (e) { return '<div class="txli"><span>' + esc(e.k.slice(8) + "/" + e.k.slice(5, 7)) + " " + esc(e.t) + " · <b>" + esc(MOODS[e.v - 1][1]) + "</b>" + (e.tags && e.tags.length ? " · " + esc(e.tags.join(", ")) : "") + (e.note ? "<br><small class='muted'>" + esc(e.note) + "</small>" : "") + "</span>" + mini("Borrar", "del", e.k + "|" + e.id) + "</div>"; }).join(""));
      }
      return out + note("Es un registro personal, no un diagnóstico. Si hace varios días te sentís mal, hablalo con alguien de confianza o con un profesional de la salud.");
    },
    act: function (a, x, y) {
      var h = H("animo", { log: {} });
      if (a === "set") { F[x] = y; return; }
      if (a === "tag") { var i = F.tags.indexOf(x); if (i >= 0) F.tags.splice(i, 1); else F.tags.push(x); return; }
      if (a === "save") { if (!F.v) return false; var k = K(0), d = new Date(); (h.log[k] = h.log[k] || []).push({ id: uid(), v: +F.v, tags: F.tags.slice(), note: (F.note || "").trim().slice(0, 140), t: p2(d.getHours()) + ":" + p2(d.getMinutes()) }); F.v = null; F.tags = []; F.note = ""; commit("animo"); return; }
      if (a === "del") { var p = x.split("|"); h.log[p[0]] = (h.log[p[0]] || []).filter(function (e) { return e.id !== p[1]; }); if (!h.log[p[0]].length) delete h.log[p[0]]; commit("animo"); }
    }
  };

  // ================= RESPIRACIÓN CON RITMOS =================
  var PAT = { caja: { n: "Caja", d: "Calma y foco", p: [["Inhalá", 4], ["Sostené", 4], ["Exhalá", 4], ["Sostené", 4]] }, "478": { n: "4-7-8", d: "Para dormir", p: [["Inhalá", 4], ["Sostené", 7], ["Exhalá", 8]] }, coh: { n: "Coherente", d: "Equilibrio", p: [["Inhalá", 5], ["Exhalá", 5]] }, larga: { n: "Exhalación larga", d: "Bajar la tensión", p: [["Inhalá", 4], ["Exhalá", 6]] } };
  APPS.ritmos = {
    view: function () {
      var h = H("ritmos", { log: {} }), L = h.log;
      if (ses && ses.br) {
        return card('<div style="text-align:center"><div class="txring"><div id="brC" class="txcirc"></div><div class="txringt"><b id="brL">Preparate</b><span id="brN"></span></div></div><p class="small muted" id="brR" style="margin:6px 0 0"></p></div>' + btn("Terminar", "stop", null, null, "ghost"));
      }
      if (F.done) { F.done = null; var wk = lastN(7).reduce(function (s, k) { return s + (L[k] || 0); }, 0); return card("<b>Hecho</b><p style='margin:8px 0'>Respirar así unos minutos baja las pulsaciones y suelta la tensión. Ya llevás " + wk + " min esta semana.</p>" + btn("Otra vez", "again")); }
      if (!F.pat) { F.pat = h.pat || "caja"; F.min = h.min || 3; }
      var out = card("<b>Elegí el ritmo</b>" + Object.keys(PAT).map(function (k) { return '<button class="txopt" data-tx="set" data-ta="pat" data-tb="' + k + '" aria-pressed="' + (F.pat === k ? "true" : "false") + '"><b>' + esc(PAT[k].n) + "</b><small>" + esc(PAT[k].d) + " · " + PAT[k].p.map(function (z) { return z[1]; }).join("-") + "</small></button>"; }).join("") +
        '<div style="height:8px"></div><span class="small muted">Duración</span>' + chips("min", [[1, "1 min"], [3, "3 min"], [5, "5 min"], [10, "10 min"]], F.min) + btn("Empezar", "start"));
      var wkv = lastN(7).map(function (k) { return { l: lbl(k), v: L[k] || 0, c: L[k] ? "ok" : "" }; }), tot = wkv.reduce(function (s, v) { return s + v.v; }, 0);
      if (tot) out += card("<b>Tu semana</b>" + bars(wkv) + stats([[tot + " min", "últimos 7 días"], [streakWhere(function (k) { return L[k]; }) + "", "días seguidos"]]));
      return out + note("Si te mareás, volvé a respirar normal. Es un apoyo de bienestar y no reemplaza a un profesional.");
    },
    act: function (a, x, y) {
      var h = H("ritmos", { log: {} });
      if (a === "set") { F[x] = y; return; }
      if (a === "again") { return; }
      if (a === "start") { var P = PAT[F.pat], cyc = P.p.reduce(function (s, z) { return s + z[1]; }, 0); h.pat = F.pat; h.min = +F.min; ses = { br: true, p: P.p, cyc: cyc, t0: Date.now() + 2500, total: (+F.min) * 60000, m: +F.min }; startBr(); return; }
      if (a === "stop") { endBr(false); }
    }
  };
  function startBr() {
    clearInterval(tick); tick = setInterval(function () {
      if (!document.getElementById("brC") || !ses || !ses.br) { clearInterval(tick); tick = null; if (!document.getElementById("tx")) ses = null; return; }
      var el = Date.now() - ses.t0, c = document.getElementById("brC"), l = document.getElementById("brL"), n = document.getElementById("brN"), r = document.getElementById("brR");
      if (el < 0) { l.textContent = "Preparate"; n.textContent = Math.ceil(-el / 1000); return; }
      if (el >= ses.total) { endBr(true); paint(); return; }
      var s = (el / 1000) % ses.cyc, acc = 0, ph = ses.p[0], within = 0, idx = 0;
      for (var i = 0; i < ses.p.length; i++) { if (s < acc + ses.p[i][1]) { ph = ses.p[i]; within = s - acc; idx = i; break; } acc += ses.p[i][1]; }
      var prog = within / ph[1], name = ph[0], sc;
      if (name === "Inhalá") sc = 0.5 + 0.5 * prog; else if (name === "Exhalá") sc = 1 - 0.5 * prog; else { var prev = ses.p[(idx + ses.p.length - 1) % ses.p.length][0]; sc = prev === "Inhalá" ? 1 : 0.5; }
      c.style.transform = "scale(" + sc.toFixed(3) + ")"; l.textContent = name; n.textContent = Math.ceil(ph[1] - within);
      r.textContent = "Quedan " + clk(Math.max(0, ses.total - el));
    }, 100);
  }
  function endBr(done) {
    if (!ses) return; var h = H("ritmos", { log: {} }), el = Math.max(0, Date.now() - ses.t0), m = done ? ses.m : Math.floor(el / 60000);
    if (m >= 1) { var k = K(0); h.log[k] = (h.log[k] || 0) + m; commit("ritmos"); F.done = true; }
    ses = null; clearInterval(tick); tick = null;
  }

  // ================= TARJETAS DE REPASO =================
  var INTV = [0, 1, 3, 7, 16, 35];
  function dueIn(n) { var d = new Date(); d.setDate(d.getDate() + n); return dk(d); }
  APPS.tarjetas = {
    view: function () {
      var h = H("tarjetas", { decks: {} }), D = h.decks, td = K(0); F.v = F.v || "list";
      if (F.v === "study" && ses && ses.cards) {
        var c = ses.cards[ses.i];
        if (!c) { var pc = ses.ok, tot = ses.cards.length; ses = null; F.v = "deck"; return card("<b>Repaso terminado</b><p style='margin:8px 0'>Sabías " + pc + " de " + tot + ". Las que fallaste vuelven mañana; las que sabías, más adelante.</p>" + btn("Volver al mazo", "deck", F.deck)); }
        return card('<small class="muted">Tarjeta ' + (ses.i + 1) + " de " + ses.cards.length + '</small><div class="txfc"><span>' + esc(c.q) + "</span>" + (ses.show ? '<hr><span class="txans">' + esc(c.a) + "</span>" : "") + "</div>" +
          (ses.show ? '<div class="txrow2">' + '<button class="btn ghost block" data-tx="no">No la sabía</button><button class="btn sage block" data-tx="yes">La sabía</button></div>' : btn("Mostrar respuesta", "show")) + btn("Salir", "exit", null, null, "ghost"));
      }
      if (F.v === "new") return card("<b>Nuevo mazo</b>" + field("Nombre", inp("dn", "text", 'maxlength="40" placeholder="Ej: Historia, unidad 2"')) + btn("Crear", "mk") + btn("Cancelar", "list", null, null, "ghost"));
      if (F.v === "deck" && D[F.deck]) {
        var dk0 = D[F.deck], due = dk0.cards.filter(function (c) { return c.due <= td; });
        var out = card("<b>" + esc(dk0.n) + '</b><p class="small muted" style="margin:4px 0 0">' + dk0.cards.length + " tarjetas · " + due.length + " para repasar hoy</p>" + (due.length ? btn("Repasar ahora (" + due.length + ")", "study") : '<p class="small" style="margin:10px 0 0">Estás al día. Volvé mañana o agregá más tarjetas.</p>'));
        out += card("<b>Agregar tarjeta</b>" + field("Pregunta", inp("cq", "text", 'maxlength="140" placeholder="¿Qué es...?"')) + field("Respuesta", inp("ca", "text", 'maxlength="200" placeholder="Es..."')) + btn("Agregar", "addc") +
          '<details class="txdet"><summary>Agregar varias juntas</summary><p class="small muted">Una por línea: pregunta :: respuesta</p><textarea class="txin" data-f="bulk" rows="5" placeholder="Capital de Francia :: París">' + esc(F.bulk || "") + "</textarea>" + btn("Agregar todas", "bulk", null, null, "ghost") + "</details>");
        if (dk0.cards.length) out += card("<b>Tarjetas</b>" + dk0.cards.slice(-12).reverse().map(function (c) { return '<div class="txli"><span>' + esc(c.q) + "<br><small class='muted'>" + esc(c.a) + "</small></span>" + mini("✕", "delc", c.id) + "</div>"; }).join(""));
        return out + btn("Borrar este mazo", "deld", F.deck, null, "ghost") + btn("Volver", "list", null, null, "ghost");
      }
      var ids = Object.keys(D), out2 = "";
      if (!ids.length) out2 = card("<b>Tarjetas de repaso</b><p class='small' style='margin:8px 0 0'>Creá un mazo, agregá preguntas y respuestas, y repasalas. Las que sabés aparecen cada vez más espaciadas; las que no, vuelven pronto. Es la forma más eficaz de recordar.</p>");
      ids.forEach(function (id) { var d = D[id], n = d.cards.filter(function (c) { return c.due <= td; }).length; out2 += '<button class="prod txdeck" data-tx="deck" data-ta="' + id + '"><span style="flex:1"><b>' + esc(d.n) + "</b><small>" + d.cards.length + " tarjetas</small></span><span class='tag" + (n ? "" : " ok") + "'>" + (n ? n + " hoy" : "Al día") + "</span></button>"; });
      return out2 + btn("Nuevo mazo", "new");
    },
    act: function (a, x, y) {
      var h = H("tarjetas", { decks: {} }), D = h.decks;
      if (a === "list") { F.v = "list"; return; }
      if (a === "new") { F.v = "new"; F.dn = ""; return; }
      if (a === "mk") { var n = (F.dn || "").trim(); if (!n) return false; var id = uid(); D[id] = { n: n.slice(0, 40), cards: [] }; F.deck = id; F.v = "deck"; commit("tarjetas"); return; }
      if (a === "deck") { F.deck = x; F.v = "deck"; return; }
      if (a === "addc") { var q = (F.cq || "").trim(), an = (F.ca || "").trim(); if (!q || !an || !D[F.deck]) return false; D[F.deck].cards.push({ id: uid(), q: q.slice(0, 140), a: an.slice(0, 200), box: 0, due: K(0) }); F.cq = ""; F.ca = ""; commit("tarjetas"); return; }
      if (a === "bulk") { var d0 = D[F.deck]; if (!d0) return false; (F.bulk || "").split("\n").forEach(function (ln) { var p = ln.split("::"); if (p.length < 2) p = ln.split("|"); if (p.length >= 2 && p[0].trim() && p[1].trim()) d0.cards.push({ id: uid(), q: p[0].trim().slice(0, 140), a: p.slice(1).join(":").trim().slice(0, 200), box: 0, due: K(0) }); }); F.bulk = ""; commit("tarjetas"); return; }
      if (a === "delc") { D[F.deck].cards = D[F.deck].cards.filter(function (c) { return c.id !== x; }); commit("tarjetas"); return; }
      if (a === "deld") { if (!confirm("¿Borrar el mazo y sus tarjetas?")) return false; delete D[x]; F.v = "list"; commit("tarjetas"); return; }
      if (a === "study") { var dd = D[F.deck], due = dd.cards.filter(function (c) { return c.due <= K(0); }); ses = { cards: due.slice(0, 30), i: 0, show: false, ok: 0 }; F.v = "study"; return; }
      if (a === "show") { ses.show = true; return; }
      if (a === "yes" || a === "no") { var c = ses.cards[ses.i], real = D[F.deck].cards.filter(function (z) { return z.id === c.id; })[0]; if (real) { if (a === "yes") { real.box = Math.min(5, real.box + 1); ses.ok++; } else real.box = 0; real.due = dueIn(INTV[real.box] || 1); } ses.i++; ses.show = false; commit("tarjetas"); return; }
      if (a === "exit") { ses = null; F.v = "deck"; }
    }
  };

  // ================= PLAN DE EXAMEN =================
  APPS.examen = {
    view: function () {
      var h = H("examen", { ex: [] }), E = h.ex; F.v = F.v || "list";
      if (F.v === "new") return card("<b>Nuevo examen</b>" + field("Materia o examen", inp("en", "text", 'maxlength="50" placeholder="Ej: Biología, parcial 1"')) + field("Fecha", inp("ed", "date")) + field("Temas (uno por línea)", '<textarea class="txin" data-f="et" rows="6" placeholder="Célula\nGenética\nEvolución">' + esc(F.et || "") + "</textarea>") + btn("Crear plan", "mk") + btn("Cancelar", "list", null, null, "ghost"));
      var cur0 = E.filter(function (e) { return e.id === F.id; })[0];
      if (F.v === "ex" && cur0) {
        var days = Math.ceil((new Date(cur0.date + "T00:00:00") - new Date(K(0) + "T00:00:00")) / 864e5), pend = cur0.topics.filter(function (t) { return !t.done; }), pct = cur0.topics.length ? Math.round((cur0.topics.length - pend.length) * 100 / cur0.topics.length) : 0;
        var pace = days > 0 ? Math.ceil(pend.length / days) : pend.length, head;
        if (!pend.length) head = "Viste todos los temas. Dedicá el tiempo que queda a repasar sin mirar."; else if (days < 0) head = "El examen ya pasó."; else if (days === 0) head = "Es hoy. Repasá lo más importante y descansá."; else head = "Para llegar bien, hoy te toca " + pace + (pace === 1 ? " tema" : " temas") + ".";
        var out = card("<b>" + esc(cur0.n) + "</b>" + stats([[days > 0 ? days : 0, days === 1 ? "día" : "días"], [pct + "%", "visto"], [pend.length, "temas pendientes"]]) + '<div class="actbar" style="margin:12px 0"><i style="width:' + pct + '%"></i></div><p class="small" style="margin:0">' + esc(head) + "</p>");
        out += card("<b>Temas</b>" + cur0.topics.map(function (t, i) { var rec = !t.done && pend.indexOf(t) < pace && days >= 0; return '<div class="txli' + (t.done ? " done" : "") + '"><span>' + (rec ? "<b>" + esc(t.t) + "</b> <small class='muted'>hoy</small>" : esc(t.t)) + "</span>" + mini(t.done ? "Deshacer" : "✓ Visto", "tg", t.id) + "</div>"; }).join("") + '<div class="txrow2" style="grid-template-columns:1fr auto;align-items:end;margin-top:8px">' + inp("nt", "text", 'maxlength="60" placeholder="Agregar un tema"') + mini("Agregar", "addt") + "</div>");
        return out + btn("Borrar este examen", "del", cur0.id, null, "ghost") + btn("Volver", "list", null, null, "ghost");
      }
      var o2 = ""; E.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (e) { var d = Math.ceil((new Date(e.date + "T00:00:00") - new Date(K(0) + "T00:00:00")) / 864e5), v = e.topics.filter(function (t) { return t.done; }).length; o2 += '<button class="prod txdeck" data-tx="ex" data-ta="' + e.id + '"><span style="flex:1"><b>' + esc(e.n) + "</b><small>" + v + " de " + e.topics.length + " temas</small></span><span class='tag'>" + (d < 0 ? "Pasó" : d === 0 ? "Hoy" : d + " d") + "</span></button>"; });
      if (!E.length) o2 = card("<b>Plan de examen</b><p class='small' style='margin:8px 0 0'>Cargá la fecha y los temas. Te decimos cuántos tenés que ver por día para llegar tranquilo.</p>");
      return o2 + btn("Nuevo examen", "new");
    },
    act: function (a, x, y) {
      var h = H("examen", { ex: [] }), E = h.ex;
      if (a === "list") { F.v = "list"; return; }
      if (a === "new") { F.v = "new"; F.en = ""; F.ed = ""; F.et = ""; return; }
      if (a === "ex") { F.id = x; F.v = "ex"; return; }
      if (a === "mk") { var tp = (F.et || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 40); if (!(F.en || "").trim() || !F.ed || !tp.length) return false; var id = uid(); E.push({ id: id, n: F.en.trim().slice(0, 50), date: F.ed, topics: tp.map(function (t) { return { id: uid(), t: t.slice(0, 60), done: false }; }) }); F.id = id; F.v = "ex"; commit("examen"); return; }
      var c = E.filter(function (e) { return e.id === F.id; })[0];
      if (a === "tg" && c) { c.topics.forEach(function (t) { if (t.id === x) t.done = !t.done; }); }
      else if (a === "addt" && c) { var n = (F.nt || "").trim(); if (!n) return false; c.topics.push({ id: uid(), t: n.slice(0, 60), done: false }); F.nt = ""; }
      else if (a === "del") { if (!confirm("¿Borrar este examen?")) return false; h.ex = E.filter(function (e) { return e.id !== x; }); F.v = "list"; }
      commit("examen");
    }
  };

  // ================= REVISIÓN SEMANAL =================
  APPS.revision = {
    view: function () {
      var h = H("revision", { log: {} }), L = h.log, wk = mondayKey(), prevK = Object.keys(L).filter(function (k) { return k < wk; }).sort().pop(), prev = prevK ? L[prevK] : null;
      if (F.step == null) F.step = L[wk] ? "done" : 0;
      var b = BR(), act = b.weekCount ? b.weekCount(0) : null;
      if (F.step === "hist") return card("<b>Revisiones anteriores</b>" + (Object.keys(L).sort().reverse().map(function (k) { var r = L[k]; return '<div class="txrev"><b>Semana del ' + esc(k.slice(8) + "/" + k.slice(5, 7)) + " · nota " + esc(r.score) + "/10</b><p class='small' style='margin:4px 0'>Bien: " + esc(r.wins) + "<br>Se trabó: " + esc(r.fix) + "<br>Prioridad: " + esc(r.focus) + "</p></div>"; }).join("") || "<p class='small muted'>Todavía no hay.</p>") + btn("Volver", "back", null, null, "ghost"));
      if (F.step === "done") { var r = L[wk]; return card("<b>Revisión de esta semana lista</b><p class='small' style='margin:8px 0'>Nota " + esc(r.score) + "/10. Tu prioridad para la semana que viene: <b>" + esc(r.focus) + "</b></p>") + btn("Ver anteriores", "hist", null, null, "ghost") + btn("Rehacerla", "redo", null, null, "ghost"); }
      var steps = [
        ["¿Qué salió bien esta semana?", "Tres cosas, aunque sean chicas.", "wins", "1. ...\n2. ...\n3. ..."],
        ["¿Qué se trabó y por qué?", "Sin culpa: buscamos el motivo, no un culpable.", "fix", "Se me complicó... porque..."],
        ["¿Cómo puntuarías la semana?", "Del 1 al 10.", "score", ""],
        ["¿Cuál es tu prioridad para la semana que viene?", "Una sola, lo más importante.", "focus", "La semana que viene voy a..."]];
      var s = steps[F.step], out = "";
      if (F.step === 0 && prev) out += card("<small class='muted'>La semana pasada te propusiste</small><p style='margin:4px 0 8px'><b>" + esc(prev.focus) + "</b></p>" + chips("kept", [["si", "Lo logré"], ["algo", "Más o menos"], ["no", "No pude"]], F.kept));
      if (F.step === 0 && act != null) out += '<p class="small muted" style="margin:0 0 10px">Esta semana tuviste actividad en ' + act + " de 7 días.</p>";
      out += card('<small class="muted">Paso ' + (F.step + 1) + " de 4</small><h3 style='margin:4px 0 6px'>" + esc(s[0]) + "</h3><p class='small muted' style='margin:0 0 10px'>" + esc(s[1]) + "</p>" + (s[2] === "score" ? chips("score", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return [n, n]; }), F.score) : '<textarea class="txin" data-f="' + s[2] + '" rows="4" placeholder="' + esc(s[3]) + '">' + esc(F[s[2]] || "") + "</textarea>") +
        '<div class="txrow2" style="margin-top:6px">' + (F.step > 0 ? '<button class="btn ghost block" data-tx="prev" style="margin-top:10px">Atrás</button>' : "<span></span>") + '<button class="btn sage block" data-tx="next" style="margin-top:10px">' + (F.step === 3 ? "Guardar" : "Siguiente") + "</button></div>");
      return out + (Object.keys(L).length ? btn("Ver anteriores", "hist", null, null, "ghost") : "");
    },
    act: function (a, x, y) {
      var h = H("revision", { log: {} }), keys = ["wins", "fix", "score", "focus"];
      if (a === "set") { F[x] = y; return; }
      if (a === "back") { F.step = L0(h) ? "done" : 0; return; }
      if (a === "hist") { F.step = "hist"; return; }
      if (a === "redo") { F.step = 0; return; }
      if (a === "prev") { F.step--; return; }
      if (a === "next") { var k = keys[F.step]; if (!F[k] || (typeof F[k] === "string" && !F[k].trim())) return false; if (F.step < 3) { F.step++; return; }
        h.log[mondayKey()] = { wins: F.wins.trim().slice(0, 400), fix: F.fix.trim().slice(0, 400), score: +F.score, focus: F.focus.trim().slice(0, 200), kept: F.kept || null }; F.step = "done"; commit("revision"); }
    }
  };
  function L0(h) { return h.log[mondayKey()]; }

  // ================= MIS RUTINAS =================
  var TPL = { man: ["Mañana", ["Tomar un vaso de agua", "Moverme 5 minutos", "Ordenar mi cuarto", "Mirar mi día antes que el celular"]], noc: ["Noche", ["Dejar la ropa lista", "Celular lejos de la cama", "Luces bajas", "Anotar una cosa que salió bien"]], est: ["Estudio", ["Material sobre la mesa", "Celular en otro cuarto", "Escribir la meta de la sesión", "Pausa de 5 minutos"]], vac: ["Mi rutina", []] };
  APPS.rutinas = {
    view: function () {
      var h = H("rutinas", { r: [] }), R = h.r, td = K(0); F.v = F.v || "list";
      function pr(r) { var d = (r.done && r.done[td]) || {}, n = r.items.filter(function (i) { return d[i.id]; }).length; return [n, r.items.length]; }
      function full(r, k) { var d = (r.done && r.done[k]) || {}; return r.items.length && r.items.every(function (i) { return d[i.id]; }); }
      var cr = R.filter(function (r) { return r.id === F.id; })[0];
      if (F.v === "new") return card("<b>Nueva rutina</b><p class='small muted'>Elegí una base y después la cambiás.</p>" + Object.keys(TPL).map(function (k) { return '<button class="txopt" data-tx="mk" data-ta="' + k + '"><b>' + esc(TPL[k][0]) + "</b><small>" + (TPL[k][1].length ? esc(TPL[k][1].join(" · ")) : "Vacía, la armás vos") + "</small></button>"; }).join("") + btn("Cancelar", "list", null, null, "ghost"));
      if (F.v === "r" && cr) {
        var d = (cr.done && cr.done[td]) || {}, p = pr(cr), st = streakWhere(function (k) { return full(cr, k); });
        var out = card("<b>" + esc(cr.n) + "</b>" + stats([[p[0] + "/" + p[1], "hoy"], [st + (st === 1 ? " día" : " días"), "seguidos completa"]]) + '<div class="actbar" style="margin:12px 0"><i style="width:' + (p[1] ? Math.round(p[0] * 100 / p[1]) : 0) + '%"></i></div>' +
          cr.items.map(function (i) { return '<div class="txli' + (d[i.id] ? " done" : "") + '"><button class="txcheck" data-tx="tg" data-ta="' + i.id + '" aria-pressed="' + (d[i.id] ? "true" : "false") + '" aria-label="Tildar">' + (d[i.id] ? "✓" : "") + "</button><span style='flex:1'>" + esc(i.t) + "</span>" + mini("✕", "di", i.id) + "</div>"; }).join("") +
          (p[1] && p[0] === p[1] ? '<p class="small" style="margin:10px 0 0"><b>Rutina completa hoy.</b></p>' : "") +
          '<div class="txrow2" style="grid-template-columns:1fr auto;align-items:end;margin-top:10px">' + inp("ni", "text", 'maxlength="60" placeholder="Agregar un paso"') + mini("Agregar", "ai") + "</div>");
        return out + btn("Borrar esta rutina", "dr", cr.id, null, "ghost") + btn("Volver", "list", null, null, "ghost");
      }
      var o2 = card("<b>Mis rutinas</b><p class='small' style='margin:8px 0 0'>Armá tus propias rutinas (mañana, noche, estudio) con los pasos que quieras y tildalas cada día.</p>");
      R.forEach(function (r) { var p = pr(r); o2 += '<button class="prod txdeck" data-tx="r" data-ta="' + r.id + '"><span style="flex:1"><b>' + esc(r.n) + "</b><small>" + r.items.length + " pasos</small></span><span class='tag" + (p[1] && p[0] === p[1] ? " ok" : "") + "'>" + p[0] + "/" + p[1] + "</span></button>"; });
      return o2 + btn("Nueva rutina", "new");
    },
    act: function (a, x, y) {
      var h = H("rutinas", { r: [] }), R = h.r, td = K(0), cr = R.filter(function (r) { return r.id === F.id; })[0];
      if (a === "list") { F.v = "list"; return; }
      if (a === "new") { F.v = "new"; return; }
      if (a === "r") { F.id = x; F.v = "r"; return; }
      if (a === "mk") { var t = TPL[x], id = uid(); R.push({ id: id, n: t[0], items: t[1].map(function (s) { return { id: uid(), t: s }; }), done: {} }); F.id = id; F.v = "r"; commit("rutinas"); return; }
      if (!cr) return false;
      if (a === "tg") { cr.done = cr.done || {}; var d = cr.done[td] = cr.done[td] || {}; if (d[x]) delete d[x]; else d[x] = 1; }
      else if (a === "ai") { var n = (F.ni || "").trim(); if (!n) return false; cr.items.push({ id: uid(), t: n.slice(0, 60) }); F.ni = ""; }
      else if (a === "di") { cr.items = cr.items.filter(function (i) { return i.id !== x; }); }
      else if (a === "dr") { if (!confirm("¿Borrar esta rutina?")) return false; h.r = R.filter(function (r) { return r.id !== x; }); F.v = "list"; }
      commit("rutinas");
    }
  };

  // ================= motor =================
  function collect() { [].slice.call(document.querySelectorAll("#tx [data-f]")).forEach(function (el) { F[el.dataset.f] = el.value; }); }
  function paint() {
    var box = document.getElementById("tx"); if (!box || !APPS[cur]) return;
    var sc = box.closest(".sheet > div"), top = sc ? sc.scrollTop : 0;
    try { box.innerHTML = APPS[cur].view(); } catch (e) { box.innerHTML = '<p class="muted">No pudimos mostrar esta herramienta. Cerrala y abrila de nuevo.</p>'; try { console.error(e); } catch (x) {} }
    if (sc) sc.scrollTop = top;
  }
  function open(id) {
    var T = (window.FormaTools.defs || []).filter(function (t) { return t.id === id; })[0]; if (!T || !APPS[id]) return;
    cur = id; F = {}; ses = null; clearInterval(tick); tick = null;
    var b = BR(); b.sheet('<div class="row"><span class="shape">' + b.shape(T.plan) + '</span><div><span class="badge">Herramienta · ' + esc(b.planName(T.plan)) + '</span><h2 style="font-size:22px;margin-top:4px">' + esc(T.n) + '</h2></div></div><div id="tx" style="margin-top:12px"></div><button class="btn ghost block" data-close style="margin-top:6px">Cerrar</button>');
    paint();
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-tx]"); if (!el || !cur || !APPS[cur] || !document.getElementById("tx")) return;
    e.stopPropagation(); collect();
    var r = APPS[cur].act(el.dataset.tx, el.dataset.ta, el.dataset.tb);
    if (r !== false || true) paint();
  }, true);

  window.FormaTools = {
    open: open,
    has: function (id) { return !!APPS[id]; },
    defs: [
      { id: "sueno", n: "Registro de sueño", d: "Anotá cómo dormiste y mirá tu promedio y tu regularidad.", plan: "dormir", mins: 5, app: true },
      { id: "pantalla", n: "Registro de celular", d: "Tu tiempo de pantalla por día, con tu límite y tu racha.", plan: "celular", mins: 5, app: true },
      { id: "matriz", n: "Matriz de prioridades", d: "Ordená lo pendiente en 4 cuadrantes y elegí tu foco de hoy.", plan: "arrancar", mins: 10, app: true },
      { id: "enfoque", n: "Foco con contador", d: "Sesiones de 15 a 60 minutos, con “para después” y estadísticas.", plan: "arrancar", gate: "vida", mins: 30, app: true },
      { id: "animo", n: "Registro de ánimo", d: "Anotá cómo te sentís y descubrí qué lo mueve.", plan: "calma", free: true, mins: 5, app: true },
      { id: "ritmos", n: "Respiración con ritmos", d: "Caja, 4-7-8, coherente y más, con guía animada.", plan: "calma", free: true, mins: 5, app: true },
      { id: "tarjetas", n: "Tarjetas de repaso", d: "Creá mazos y repasalos con repetición espaciada.", plan: "estudio", mins: 15, app: true },
      { id: "examen", n: "Plan de examen", d: "Fecha y temas: te decimos cuánto ver cada día.", plan: "estudio", mins: 10, app: true },
      { id: "revision", n: "Revisión semanal", d: "Cuatro preguntas para cerrar la semana y elegir la próxima prioridad.", plan: "vida", gate: "vida", mins: 10, app: true },
      { id: "rutinas", n: "Mis rutinas", d: "Armá tus rutinas con pasos propios y tildalas cada día.", plan: "vida", gate: "vida", mins: 10, app: true }
    ]
  };
})();
