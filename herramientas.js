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

  // ================= HERRAMIENTAS POR OBJETIVO (deporte, comer, movimiento, plata, viajes, laburo) =================
  function setF(a, x, y) { if (a === "set") { F[x] = y; return true; } return false; }
  function money(n) { return "$" + Math.round(n || 0).toLocaleString("es-AR"); }
  function wkKeys() { var o = [], d = new Date(mondayKey() + "T12:00:00"); for (var i = 0; i < 7; i++) { var x = new Date(d); x.setDate(d.getDate() + i); o.push(dk(x)); } return o; }
  function sumWeek(L, f) { return wkKeys().reduce(function (s, k) { return s + (L[k] ? f(L[k]) : 0); }, 0); }
  function ck(on, a, x, txt) { return '<button class="txck' + (on ? " on" : "") + '" data-tx="' + a + '" data-ta="' + esc(x) + '"><i>' + (on ? "✓" : "") + "</i><span>" + esc(txt) + "</span></button>"; }
  function dm(k) { return k.slice(8) + "/" + k.slice(5, 7); }
  function mins(a) { return (a || []).reduce(function (s, x) { return s + (x.min || x.m || 0); }, 0); }

  // ---------- DEPORTE: rutina de entrenamiento ----------
  var ETPL = {
    casa: ["Fuerza general", [["Sentadillas", 3, "12"], ["Flexiones (rodillas apoyadas si hace falta)", 3, "8"], ["Puente de glúteos", 3, "12"], ["Estocadas alternadas", 3, "10 por pierna"], ["Plancha", 3, "30 s"]]],
    prev: ["Prevención y movilidad", [["Movilidad de cadera", 2, "10"], ["Rotación de hombros con toalla o banda", 2, "12"], ["Equilibrio en un pie", 2, "30 s por pie"], ["Elevación de talones", 3, "15"], ["Plancha lateral", 2, "20 s por lado"]]],
    vacia: ["Mi rutina", []]
  };
  APPS.entreno = {
    view: function () {
      var h = H("entreno", { r: [], log: {} }), R = h.r, L = h.log; F.v = F.v || "list";
      var cr = R.filter(function (r) { return r.id === F.id; })[0];
      if (F.v === "fin" && cr) {
        if (F.min == null || F.min === "") F.min = F.t0 ? Math.max(1, Math.round((Date.now() - F.t0) / 60000)) : 30;
        return card("<b>¡Terminaste «" + esc(cr.n) + "»!</b>" + field("¿Cuántos minutos entrenaste?", inp("min", "number", 'min="1" max="300" inputmode="numeric"')) +
          '<span class="small muted">¿Qué tan exigente fue? 1 muy fácil · 10 al máximo</span>' + chips("rpe", [[3, "3"], [4, "4"], [5, "5"], [6, "6"], [7, "7"], [8, "8"], [9, "9"], [10, "10"]], F.rpe) +
          field("Nota (opcional)", inp("nt", "text", 'maxlength="100" placeholder="Cómo te sentiste, qué subir la próxima"')) + btn("Guardar sesión", "save") + btn("Volver a la rutina", "r", cr.id, null, "ghost"));
      }
      if (F.v === "r" && cr) {
        F.sd = F.sd || {}; var tot = 0, dn = 0;
        var rows = cr.ex.map(function (e) {
          var c = F.sd[e.id] || 0, b = ""; tot += e.s; dn += Math.min(c, e.s);
          for (var i = 0; i < e.s; i++) b += '<button class="txset' + (i < c ? " on" : "") + '" data-tx="sr" data-ta="' + e.id + '" data-tb="' + (i + 1) + '">' + (i < c ? "✓" : i + 1) + "</button>";
          return '<div class="txex"><div class="row between"><b>' + esc(e.n) + "</b>" + mini("✕", "de", e.id) + '</div><small class="muted">' + e.s + " series × " + esc(e.rep) + '</small><div class="txsets">' + b + "</div></div>";
        }).join("");
        var out = card("<b>" + esc(cr.n) + "</b>" + (cr.ex.length ? '<p class="small muted" style="margin:4px 0 8px">Tocá cada serie cuando la terminás · ' + dn + "/" + tot + "</p>" + rows + btn(dn >= tot ? "Terminar sesión" : "Terminar sesión (" + dn + "/" + tot + ")", "end") : '<p class="small muted" style="margin:6px 0 0">Todavía no tiene ejercicios. Agregá el primero abajo.</p>'));
        out += card("<b>Agregar ejercicio</b>" + field("Ejercicio", inp("en", "text", 'maxlength="50" placeholder="Ej: sentadilla con mancuerna"')) + '<div class="txrow2">' + field("Series", inp("es", "number", 'min="1" max="10" inputmode="numeric" placeholder="3"')) + field("Repeticiones o tiempo", inp("er", "text", 'maxlength="20" placeholder="10 o 30 s"')) + "</div>" + btn("Agregar", "ae", null, null, "ghost"));
        return out + btn("Borrar esta rutina", "dr", cr.id, null, "ghost") + btn("Volver a mis rutinas", "list", null, null, "ghost");
      }
      if (F.v === "new") return card("<b>¿Cómo querés empezar?</b>" + Object.keys(ETPL).map(function (k) { return '<button class="prod txdeck" data-tx="mk" data-ta="' + k + '"><span style="flex:1"><b>' + esc(ETPL[k][0]) + "</b><small>" + (ETPL[k][1].length ? ETPL[k][1].length + " ejercicios para arrancar, los cambiás a tu gusto" : "La armás de cero") + "</small></span></button>"; }).join("")) + btn("Volver", "list", null, null, "ghost");
      var ses = wkKeys().reduce(function (s, k) { return s + (L[k] || []).length; }, 0), wm = sumWeek(L, mins), load = sumWeek(L, function (a) { return a.reduce(function (s, x) { return s + x.min * (x.rpe || 5); }, 0); });
      var out2 = card("<b>Esta semana</b>" + stats([[ses, ses === 1 ? "sesión" : "sesiones"], [wm + " min", "entrenados"], [load, "carga"]]) + bars(lastN(7).map(function (k) { var m = mins(L[k]); return { l: lbl(k), v: m, c: m ? "ok" : "" }; })) + note("Carga = minutos × exigencia. Si sube mucho de una semana a la otra, cuidá el descanso."));
      out2 += card("<b>Mis rutinas</b>" + (R.length ? "" : '<p class="small muted" style="margin:6px 0 0">Armá tu rutina con ejercicios, series y repeticiones. La hacés acá, serie por serie, y cada sesión queda guardada.</p>') + R.map(function (r) { return '<button class="prod txdeck" data-tx="r" data-ta="' + r.id + '"><span style="flex:1"><b>' + esc(r.n) + "</b><small>" + r.ex.length + " ejercicios</small></span><span class='tag'>Entrenar</span></button>"; }).join("") + btn("Nueva rutina", "new", null, null, R.length ? "ghost" : "sage"));
      var last = Object.keys(L).sort().reverse().slice(0, 5);
      if (last.length) out2 += card("<b>Últimas sesiones</b>" + last.map(function (k) { return L[k].map(function (x) { return '<div class="txli"><span>' + esc(lbl(k) + " " + dm(k)) + " · " + esc(x.r) + " · <b>" + x.min + " min</b>" + (x.rpe ? " · exigencia " + x.rpe : "") + "</span></div>"; }).join(""); }).join(""));
      return out2 + note("Si sentís dolor (no cansancio), pará ese ejercicio. Ante una lesión, consultá con un profesional.");
    },
    act: function (a, x, y) {
      if (setF(a, x, y)) return;
      var h = H("entreno", { r: [], log: {} }), R = h.r, cr = R.filter(function (r) { return r.id === F.id; })[0];
      if (a === "list") { F.v = "list"; F.sd = {}; F.t0 = null; return; }
      if (a === "new") { F.v = "new"; return; }
      if (a === "mk") { var t = ETPL[x], id = uid(); R.push({ id: id, n: t[0], ex: t[1].map(function (e) { return { id: uid(), n: e[0], s: e[1], rep: e[2] }; }) }); F.id = id; F.v = "r"; F.sd = {}; F.t0 = Date.now(); commit("entreno"); return; }
      if (a === "r") { if (F.id !== x) { F.sd = {}; F.t0 = Date.now(); } F.id = x; F.v = "r"; F.min = null; return; }
      if (!cr) return false;
      if (a === "sr") { F.sd = F.sd || {}; if (!F.t0) F.t0 = Date.now(); var n = +y; F.sd[x] = (F.sd[x] || 0) >= n ? n - 1 : n; return; }
      if (a === "ae") { var en = (F.en || "").trim(); if (!en) return false; cr.ex.push({ id: uid(), n: en.slice(0, 50), s: Math.max(1, Math.min(10, Math.round(+F.es) || 3)), rep: (F.er || "10").trim().slice(0, 20) || "10" }); F.en = ""; F.es = ""; F.er = ""; commit("entreno"); return; }
      if (a === "de") { cr.ex = cr.ex.filter(function (e) { return e.id !== x; }); commit("entreno"); return; }
      if (a === "dr") { if (!confirm("¿Borrar esta rutina?")) return false; h.r = R.filter(function (r) { return r.id !== x; }); F.v = "list"; commit("entreno"); return; }
      if (a === "end") { F.v = "fin"; F.min = null; return; }
      if (a === "save") { var m = Math.round(+F.min); if (!m || m < 1 || m > 300) return false; (h.log[K(0)] = h.log[K(0)] || []).push({ r: cr.n, min: m, rpe: +F.rpe || 0, nt: (F.nt || "").trim().slice(0, 100) }); F.v = "list"; F.sd = {}; F.t0 = null; F.rpe = null; F.nt = ""; commit("entreno"); }
    },
    done: function (h) { return !!(h.log && h.log[K(0)]); },
    sum: function (h) { var L = h.log || {}, s = wkKeys().reduce(function (a, k) { return a + (L[k] || []).length; }, 0); return s ? s + (s === 1 ? " sesión" : " sesiones") + " esta semana · " + sumWeek(L, mins) + " min" : ""; }
  };

  // ---------- DEPORTE: diario de partidos ----------
  APPS.partidos = {
    view: function () {
      var h = H("partidos", { log: [] }), L = h.log; if (F.res == null) { F.res = "G"; F.lv = "3"; }
      var out = card("<b>Anotá tu partido</b>" + '<div class="txrow2">' + field("Rival o equipo", inp("rv", "text", 'maxlength="40" placeholder="Contra quién"')) + field("Resultado", inp("sc", "text", 'maxlength="30" placeholder="6-4 6-3 / 2-1"')) + "</div>" +
        chips("res", [["G", "Gané"], ["P", "Perdí"], ["E", "Empaté"]], F.res) + '<span class="small muted" style="display:block;margin-top:10px">¿Cómo jugaste? 1 muy mal · 5 muy bien</span>' + chips("lv", [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]], F.lv) +
        field("Qué salió bien", inp("ok", "text", 'maxlength="120" placeholder="Lo que tenés que seguir haciendo"')) + field("Qué mejorar", inp("mj", "text", 'maxlength="120" placeholder="Una sola cosa para entrenar"')) + btn("Guardar partido", "save"));
      if (L.length) {
        var g = L.filter(function (e) { return e.res === "G"; }).length, p = L.filter(function (e) { return e.res === "P"; }).length, l10 = L.slice(0, 10);
        out += card("<b>Tu temporada</b>" + stats([[g + "-" + p, "ganados-perdidos"], [Math.round(g * 100 / L.length) + "%", "de victorias"], [avg(l10.map(function (e) { return e.lv; })).toFixed(1).replace(".", ","), "cómo jugaste (últ. 10)"]]) +
          bars(l10.slice().reverse().map(function (e) { return { l: e.res, v: e.lv, c: e.res === "G" ? "ok" : "warn" }; }), { max: 5 }) + '<p class="small muted" style="margin:0">Cómo jugaste en tus últimos partidos (G ganado · P perdido).</p>');
        var mj = L.filter(function (e) { return e.mj; }).slice(0, 3);
        if (mj.length) out += card("<b>Lo que venís diciendo que tenés que mejorar</b><ul class='small' style='margin:8px 0 0;padding-left:18px'>" + mj.map(function (e) { return "<li>" + esc(e.mj) + "</li>"; }).join("") + "</ul>" + note("Si se repite, ese es tu próximo foco de entrenamiento."));
        out += card("<b>Partidos</b>" + L.slice(0, 8).map(function (e) { return '<div class="txli"><span>' + esc(dm(e.d)) + " · " + (e.res === "G" ? "Ganaste" : e.res === "P" ? "Perdiste" : "Empate") + (e.rv ? " vs " + esc(e.rv) : "") + (e.sc ? " · " + esc(e.sc) : "") + "</span>" + mini("✕", "del", e.id) + "</div>"; }).join(""));
      }
      return out;
    },
    act: function (a, x, y) {
      if (setF(a, x, y)) return; var h = H("partidos", { log: [] });
      if (a === "save") { h.log.unshift({ id: uid(), d: K(0), rv: (F.rv || "").trim().slice(0, 40), sc: (F.sc || "").trim().slice(0, 30), res: F.res || "G", lv: +F.lv || 3, ok: (F.ok || "").trim().slice(0, 120), mj: (F.mj || "").trim().slice(0, 120) }); h.log = h.log.slice(0, 300); F.rv = F.sc = F.ok = F.mj = ""; commit("partidos"); return; }
      if (a === "del") { h.log = h.log.filter(function (e) { return e.id !== x; }); commit("partidos"); }
    },
    done: function (h) { return (h.log || []).some(function (e) { return e.d === K(0); }); },
    sum: function (h) { var L = h.log || []; if (!L.length) return ""; return L.length + " partidos · " + L.filter(function (e) { return e.res === "G"; }).length + " ganados"; }
  };

  // ---------- COMER: comidas y agua ----------
  var MEALS = [["des", "Desayuno"], ["alm", "Almuerzo"], ["mer", "Merienda"], ["cen", "Cena"]];
  function ordOf(e) { return e ? MEALS.filter(function (m) { return e.m && e.m[m[0]] === "ok"; }).length : 0; }
  APPS.comidas = {
    view: function () {
      var h = H("comidas", { log: {}, goal: 8 }), L = h.log, td = L[K(0)] || { m: {}, w: 0 }, goal = h.goal || 8;
      var out = card("<b>Hoy</b>" + MEALS.map(function (m) { var v = td.m[m[0]]; return '<div class="txmeal"><span>' + m[1] + '</span><div class="chips txchips">' + [["ok", "Ordenada"], ["pic", "Picoteé"], ["no", "La salteé"]].map(function (o) { return '<button class="chip" data-tx="meal" data-ta="' + m[0] + '" data-tb="' + o[0] + '" aria-pressed="' + (v === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div></div>"; }).join("") +
        '<div class="txwater"><span><b>Agua</b><small>' + (td.w || 0) + " de " + goal + ' vasos</small></span><div class="row" style="gap:8px;align-items:center">' + mini("−", "w", "-1") + '<span class="txwv">' + (td.w ? "💧".repeat(Math.min(td.w, 10)) : "") + "</span>" + mini("+ vaso", "w", "1") + "</div></div>");
      var ks = lastN(7);
      out += card("<b>Tus últimos 7 días</b>" + bars(ks.map(function (k) { var o = ordOf(L[k]); return { l: lbl(k), v: o, c: o >= 3 ? "ok" : o ? "warn" : "" }; }), { max: 4 }) + '<p class="small muted" style="margin:0">Comidas ordenadas por día (de 4).</p>' +
        stats([[streakWhere(function (k) { return ordOf(L[k]) >= 3; }) + " días", "seguidos con 3 o más"], [avg(ks.filter(function (k) { return L[k]; }).map(function (k) { return L[k].w || 0; })).toFixed(1).replace(".", ","), "vasos de agua promedio"]]));
      out += card("<b>Tu meta de agua</b>" + chips("goal", [["6", "6 vasos"], ["8", "8 vasos"], ["10", "10 vasos"]], String(goal), "goal"));
      return out + note("Es un registro de hábitos, no una dieta. Si tenés una indicación médica o nutricional, seguí esa.");
    },
    act: function (a, x, y) {
      var h = H("comidas", { log: {}, goal: 8 }), k = K(0), e = h.log[k] = h.log[k] || { m: {}, w: 0 };
      if (a === "meal") { if (e.m[x] === y) delete e.m[x]; else e.m[x] = y; }
      else if (a === "w") e.w = Math.max(0, Math.min(20, (e.w || 0) + (+x)));
      else if (a === "goal") h.goal = +y;
      commit("comidas");
    },
    done: function (h) { var e = h.log && h.log[K(0)]; return !!(e && Object.keys(e.m || {}).length); },
    sum: function (h) { var L = h.log || {}, ks = lastN(7).filter(function (k) { return L[k]; }); return ks.length ? "Promedio: " + avg(ks.map(function (k) { return ordOf(L[k]); })).toFixed(1).replace(".", ",") + " comidas ordenadas por día" : ""; }
  };

  // ---------- COMER: menú semanal y compras ----------
  var DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  APPS.menu = {
    view: function () {
      var h = H("menu", { w: {}, list: [] }), W = h.w, Ls = h.list; F.v = F.v || "menu";
      if (!F.ld) { for (var i = 0; i < 7; i++) { F["a" + i] = W["a" + i] || ""; F["c" + i] = W["c" + i] || ""; } F.ld = 1; }
      var pend = Ls.filter(function (i) { return !i.ok; }).length, tabs = chips("v", [["menu", "Menú de la semana"], ["lista", "Lista de compras" + (pend ? " (" + pend + ")" : "")]], F.v);
      if (F.v === "lista") return tabs + card("<b>Lista de compras</b>" + '<div class="row" style="gap:8px;margin:8px 0">' + inp("it", "text", 'maxlength="80" placeholder="Tomates, arroz, leche…" style="flex:1"') + mini("Sumar", "add") + "</div>" +
        (Ls.length ? Ls.map(function (i) { return ck(i.ok, "tg", i.id, i.t); }).join("") : '<p class="small muted">Vacía. Separá con comas para sumar varias cosas juntas.</p>') + (Ls.some(function (i) { return i.ok; }) ? btn("Sacar lo ya comprado", "clr", null, null, "ghost") : ""));
      return tabs + card("<b>Planificá tus comidas</b>" + note("Con 10 minutos el domingo te ahorrás pensar qué comer todos los días. No hace falta llenar todo.") +
        DAYS.map(function (d, i) { return '<div class="txday"><b>' + d + '</b><div class="txrow2">' + field("Almuerzo", inp("a" + i, "text", 'maxlength="50" placeholder="—"')) + field("Cena", inp("c" + i, "text", 'maxlength="50" placeholder="—"')) + "</div></div>"; }).join("") +
        btn(F.saved ? "Guardado ✓" : "Guardar menú", "save"));
    },
    act: function (a, x, y) {
      var h = H("menu", { w: {}, list: [] }); if (a === "set") { F[x] = y; return; }
      if (a === "save") { for (var i = 0; i < 7; i++) { h.w["a" + i] = (F["a" + i] || "").trim().slice(0, 50); h.w["c" + i] = (F["c" + i] || "").trim().slice(0, 50); } F.saved = 1; commit("menu"); return; }
      F.saved = 0;
      if (a === "add") { var t = (F.it || "").trim(); if (!t) return false; t.split(",").forEach(function (s) { s = s.trim(); if (s) h.list.push({ id: uid(), t: s.slice(0, 40), ok: false }); }); F.it = ""; }
      else if (a === "tg") h.list.forEach(function (i) { if (i.id === x) i.ok = !i.ok; });
      else if (a === "clr") h.list = h.list.filter(function (i) { return !i.ok; });
      commit("menu");
    },
    sum: function (h) { var n = Object.keys(h.w || {}).filter(function (k) { return h.w[k]; }).length, p = (h.list || []).filter(function (i) { return !i.ok; }).length; return n || p ? n + " comidas planificadas · " + p + " cosas por comprar" : ""; }
  };

  // ---------- MOVIMIENTO: registro ----------
  APPS.mover = {
    view: function () {
      var h = H("mover", { log: {}, goal: 150 }), L = h.log, goal = h.goal || 150; if (F.tp == null) F.tp = "Caminar";
      var wk = sumWeek(L, mins), pc = Math.min(100, Math.round(wk * 100 / goal));
      var out = card("<b>Esta semana: " + wk + " de " + goal + " min</b>" + '<div class="pgbar" style="margin:10px 0 4px"><i style="width:' + pc + '%"></i></div><p class="small muted" style="margin:0">' + (wk >= goal ? "¡Meta cumplida! Lo que sumes ahora es extra." : "Te faltan " + (goal - wk) + " minutos. En pedacitos también cuenta.") + "</p>" + bars(lastN(7).map(function (k) { var m = mins(L[k]); return { l: lbl(k), v: m, c: m ? "ok" : "" }; })));
      out += card("<b>Sumá movimiento</b>" + chips("tp", [["Caminar", "🚶 Caminar"], ["Bici", "🚲 Bici"], ["Gimnasio", "🏋️ Gimnasio"], ["Deporte", "⚽ Deporte"], ["Baile", "💃 Baile"], ["Otro", "Otro"]], F.tp) +
        '<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">' + [10, 20, 30, 45, 60].map(function (m) { return mini("+" + m + " min", "add", m); }).join("") + "</div>" +
        '<div class="row" style="gap:8px;margin-top:8px">' + inp("mn", "number", 'min="1" max="300" inputmode="numeric" placeholder="Otra cantidad" style="flex:1"') + mini("Sumar", "addc") + "</div>");
      var td = L[K(0)] || []; if (td.length) out += card("<b>Hoy</b>" + td.map(function (x, i) { return '<div class="txli"><span>' + esc(x.t) + " · <b>" + x.m + " min</b></span>" + mini("✕", "del", i) + "</div>"; }).join(""));
      out += card("<b>Tu meta semanal</b>" + chips("goal", [["90", "90 min"], ["150", "150 min"], ["210", "210 min"], ["300", "300 min"]], String(goal), "goal") + note("La recomendación general para adultos es de al menos 150 minutos por semana de actividad moderada. Empezá por donde estés."));
      return out;
    },
    act: function (a, x, y) {
      var h = H("mover", { log: {}, goal: 150 }), k = K(0); if (a === "set") { F[x] = y; return; }
      if (a === "goal") { h.goal = +y; commit("mover"); return; }
      if (a === "add" || a === "addc") { var m = a === "add" ? +x : Math.round(+F.mn); if (!m || m < 1 || m > 300) return false; (h.log[k] = h.log[k] || []).push({ t: F.tp || "Otro", m: m }); F.mn = ""; commit("mover"); return; }
      if (a === "del") { (h.log[k] || []).splice(+x, 1); if (h.log[k] && !h.log[k].length) delete h.log[k]; commit("mover"); }
    },
    done: function (h) { return !!(h.log && h.log[K(0)] && h.log[K(0)].length); },
    sum: function (h) { var wk = sumWeek(h.log || {}, mins); return wk ? wk + " de " + (h.goal || 150) + " min esta semana" : ""; }
  };

  // ---------- PLATA: gastos ----------
  var GCAT = ["Comida", "Súper", "Transporte", "Casa y servicios", "Salidas", "Compras", "Salud", "Otros"];
  function mKey() { return K(0).slice(0, 7); }
  APPS.gastos = {
    view: function () {
      var h = H("gastos", { g: [], bud: 0 }), M = h.g.filter(function (e) { return e.d.slice(0, 7) === mKey(); }), tot = M.reduce(function (s, e) { return s + e.v; }, 0), bud = h.bud || 0;
      if (F.ct == null) F.ct = "Comida";
      var out = card("<b>Anotá un gasto</b>" + '<div class="txrow2">' + field("Monto", inp("mo", "number", 'min="1" inputmode="decimal" placeholder="0"')) + field("Detalle (opcional)", inp("nt", "text", 'maxlength="40" placeholder="Qué fue"')) + "</div>" + chips("ct", GCAT.map(function (c) { return [c, c]; }), F.ct) + btn("Guardar gasto", "save"));
      var d = new Date(), left = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1, by = {};
      M.forEach(function (e) { by[e.c] = (by[e.c] || 0) + e.v; }); var cs = Object.keys(by).sort(function (a, b) { return by[b] - by[a]; });
      out += card("<b>Este mes: " + money(tot) + "</b>" + (bud ? '<div class="pgbar" style="margin:10px 0 4px"><i style="width:' + Math.min(100, Math.round(tot * 100 / bud)) + "%" + (tot > bud ? ";background:var(--err)" : "") + '"></i></div><p class="small muted" style="margin:0">' + (tot > bud ? "Te pasaste " + money(tot - bud) + " del presupuesto." : "Te quedan " + money(bud - tot) + " para " + left + " días: unos " + money((bud - tot) / left) + " por día.") + "</p>" : '<p class="small muted" style="margin:6px 0 0">Poné un presupuesto mensual y te decimos cuánto podés gastar por día.</p>') +
        (cs.length ? '<div style="margin-top:12px">' + cs.map(function (c) { return '<div class="txcat"><span>' + esc(c) + '</span><i><u style="width:' + Math.max(4, Math.round(by[c] * 100 / by[cs[0]])) + '%"></u></i><b>' + money(by[c]) + "</b></div>"; }).join("") + '</div><p class="small" style="margin:10px 0 0">Tu mayor gasto es <b>' + esc(cs[0]) + "</b>: " + Math.round(by[cs[0]] * 100 / tot) + "% del mes.</p>" : ""));
      out += card("<b>Presupuesto mensual</b>" + '<div class="row" style="gap:8px;margin-top:8px">' + inp("bd", "number", 'min="0" inputmode="numeric" placeholder="' + (bud ? money(bud) : "Ej: 300000") + '" style="flex:1"') + mini("Guardar", "bud") + "</div>");
      if (M.length) out += card("<b>Últimos gastos</b>" + M.slice(0, 8).map(function (e) { return '<div class="txli"><span>' + esc(dm(e.d)) + " · " + esc(e.c) + (e.nt ? " · " + esc(e.nt) : "") + " · <b>" + money(e.v) + "</b></span>" + mini("✕", "del", e.id) + "</div>"; }).join(""));
      return out + note("Tus datos quedan en tu cuenta. Forma no te pide datos bancarios ni se conecta con tu banco.");
    },
    act: function (a, x, y) {
      var h = H("gastos", { g: [], bud: 0 }); if (a === "set") { F[x] = y; return; }
      if (a === "save") { var v = Math.round(+F.mo); if (!v || v <= 0) return false; h.g.unshift({ id: uid(), d: K(0), v: v, c: F.ct || "Otros", nt: (F.nt || "").trim().slice(0, 40) }); h.g = h.g.slice(0, 1500); F.mo = ""; F.nt = ""; commit("gastos"); return; }
      if (a === "bud") { var b = Math.round(+F.bd); if (!(b >= 0)) return false; h.bud = b; F.bd = ""; commit("gastos"); return; }
      if (a === "del") { h.g = h.g.filter(function (e) { return e.id !== x; }); commit("gastos"); }
    },
    done: function (h) { return (h.g || []).some(function (e) { return e.d === K(0); }); },
    sum: function (h) { var t = (h.g || []).filter(function (e) { return e.d.slice(0, 7) === mKey(); }).reduce(function (s, e) { return s + e.v; }, 0); return t ? "Este mes: " + money(t) + (h.bud ? " de " + money(h.bud) : "") : ""; }
  };

  // ---------- PLATA: metas de ahorro ----------
  APPS.ahorro = {
    view: function () {
      var h = H("ahorro", { m: [] }), M = h.m;
      var out = M.map(function (m) { var s = m.ap.reduce(function (q, x) { return q + x.v; }, 0), pc = Math.min(100, Math.round(s * 100 / m.obj));
        return card('<div class="row between"><b>' + esc(m.n) + "</b>" + mini("✕", "dm", m.id) + '</div><p class="small" style="margin:6px 0">' + money(s) + " de " + money(m.obj) + " · <b>" + pc + '%</b></p><div class="pgbar"><i style="width:' + pc + '%"></i></div>' +
          (s >= m.obj ? '<p class="small" style="margin:8px 0 0"><b>¡Llegaste a tu meta!</b></p>' : '<div class="row" style="gap:8px;margin-top:10px">' + inp("ap_" + m.id, "number", 'min="1" inputmode="numeric" placeholder="Sumar un aporte" style="flex:1"') + mini("Sumar", "ap", m.id) + "</div>")); }).join("");
      out += card("<b>Nueva meta</b>" + field("¿Para qué ahorrás?", inp("mn", "text", 'maxlength="40" placeholder="Viaje, bici, fondo de emergencia…"')) + field("¿Cuánto necesitás?", inp("mo", "number", 'min="1" inputmode="numeric" placeholder="0"')) + btn("Crear meta", "mk", null, null, M.length ? "ghost" : "sage"));
      return out + note("Tip: apartá el aporte apenas cobrás, antes de gastar.");
    },
    act: function (a, x) {
      var h = H("ahorro", { m: [] });
      if (a === "mk") { var n = (F.mn || "").trim(), o = Math.round(+F.mo); if (!n || !o) return false; h.m.push({ id: uid(), n: n.slice(0, 40), obj: o, ap: [] }); F.mn = ""; F.mo = ""; commit("ahorro"); return; }
      if (a === "ap") { var v = Math.round(+F["ap_" + x]), m = h.m.filter(function (z) { return z.id === x; })[0]; if (!m || !v) return false; m.ap.push({ d: K(0), v: v }); F["ap_" + x] = ""; commit("ahorro"); return; }
      if (a === "dm") { if (!confirm("¿Borrar esta meta?")) return false; h.m = h.m.filter(function (z) { return z.id !== x; }); commit("ahorro"); }
    },
    done: function (h) { return (h.m || []).some(function (m) { return m.ap.some(function (x) { return x.d === K(0); }); }); },
    sum: function (h) { var m = (h.m || [])[0]; if (!m) return ""; var s = m.ap.reduce(function (q, x) { return q + x.v; }, 0); return m.n + ": " + Math.min(100, Math.round(s * 100 / m.obj)) + "% de la meta"; }
  };

  // ---------- VIAJES: mi viaje ----------
  var VRUB = [["pas", "Pasajes"], ["alo", "Alojamiento"], ["com", "Comida"], ["pse", "Paseos y entradas"], ["otr", "Otros"]];
  var VRES = ["Pasajes", "Alojamiento", "Seguro de viaje", "Documentos (DNI o pasaporte)", "Traslados", "Plata: efectivo o tarjeta para el destino"];
  function dTo(k) { return Math.round((new Date(k + "T12:00:00") - new Date(K(0) + "T12:00:00")) / 864e5); }
  APPS.viaje = {
    view: function () {
      var h = H("viaje", { t: null }), T = h.t;
      if (!T || F.edit) {
        if (!F.ld) { var t0 = T || {}; F.ds = t0.ds || ""; F.di = t0.di || ""; F.dv = t0.dv || ""; F.pr = t0.pr || ""; F.ld = 1; }
        return card("<b>" + (T ? "Editar mi viaje" : "Armá tu viaje") + "</b>" + field("¿Adónde vas?", inp("ds", "text", 'maxlength="40" placeholder="Destino"')) + '<div class="txrow2">' + field("Ida", inp("di", "date")) + field("Vuelta", inp("dv", "date")) + "</div>" + field("Presupuesto total", inp("pr", "number", 'min="0" inputmode="numeric" placeholder="0"')) + btn("Guardar", "save") + (T ? btn("Cancelar", "cancel", null, null, "ghost") : ""));
      }
      T.rb = T.rb || {}; T.it = T.it || []; T.rs = T.rs || {};
      var dd = dTo(T.di), nd = T.dv ? Math.max(1, dTo(T.dv) - dd + 1) : 0, plan = VRUB.reduce(function (s, r) { return s + (+T.rb[r[0]] || 0); }, 0), rd = VRES.filter(function (r, i) { return T.rs[i]; }).length;
      var out = card('<div class="row between"><b style="font-size:18px">✈️ ' + esc(T.ds) + "</b>" + mini("Editar", "edit") + "</div>" + stats([[dd > 0 ? dd : dd === 0 ? "¡Hoy!" : "En viaje", dd > 0 ? "días para salir" : "a disfrutar"], [nd ? nd + " días" : "—", "de viaje"], [T.pr ? money(+T.pr) : "—", "presupuesto"]]));
      out += card("<b>Reservas y papeles · " + rd + "/" + VRES.length + '</b><div class="pgbar" style="margin:8px 0"><i style="width:' + Math.round(rd * 100 / VRES.length) + '%"></i></div>' + VRES.map(function (r, i) { return ck(T.rs[i], "rs", i, r); }).join(""));
      if (!F.rbl) { VRUB.forEach(function (r) { F["rb_" + r[0]] = T.rb[r[0]] || ""; }); F.rbl = 1; }
      out += card("<b>Presupuesto por rubro</b>" + '<div class="txrow2">' + VRUB.map(function (r) { return field(r[1], inp("rb_" + r[0], "number", 'min="0" inputmode="numeric" placeholder="0"')); }).join("") + "</div>" +
        '<p class="small" style="margin:8px 0 0">Planificado: <b>' + money(plan) + "</b>" + (T.pr ? (plan > +T.pr ? " · te pasás " + money(plan - T.pr) : " · te sobran " + money(T.pr - plan)) : "") + (nd && plan ? " · " + money(plan / nd) + " por día" : "") + "</p>" + btn("Guardar presupuesto", "rb", null, null, "ghost"));
      out += card("<b>Itinerario</b>" + (T.it.length ? T.it.map(function (x) { return '<div class="txli"><span><b>Día ' + x.d + "</b> · " + esc(x.t) + "</span>" + mini("✕", "di", x.id) + "</div>"; }).join("") : '<p class="small muted" style="margin:6px 0 0">Anotá qué querés hacer cada día. Una o dos cosas por día alcanzan.</p>') +
        '<div class="row" style="gap:8px;margin-top:10px">' + inp("idn", "number", 'min="1" max="90" inputmode="numeric" placeholder="Día" style="width:74px"') + inp("itx", "text", 'maxlength="60" placeholder="Qué vas a hacer" style="flex:1"') + mini("Sumar", "ai") + "</div>");
      return out + btn("Cerrar este viaje y armar otro", "reset", null, null, "ghost");
    },
    act: function (a, x) {
      var h = H("viaje", { t: null });
      if (a === "edit") { F.edit = 1; F.ld = 0; return; }
      if (a === "cancel") { F.edit = 0; return; }
      if (a === "save") { var ds = (F.ds || "").trim(); if (!ds || !F.di) return false; h.t = Object.assign(h.t || {}, { ds: ds.slice(0, 40), di: F.di, dv: F.dv || "", pr: Math.round(+F.pr) || 0 }); F.edit = 0; commit("viaje"); return; }
      var T = h.t; if (!T) return false;
      if (a === "rs") { T.rs = T.rs || {}; if (T.rs[x]) delete T.rs[x]; else T.rs[x] = 1; }
      else if (a === "rb") { T.rb = {}; VRUB.forEach(function (r) { T.rb[r[0]] = Math.round(+F["rb_" + r[0]]) || 0; }); }
      else if (a === "ai") { var t = (F.itx || "").trim(), d = Math.round(+F.idn); if (!t || !d) return false; T.it = T.it || []; T.it.push({ id: uid(), d: d, t: t.slice(0, 60) }); T.it.sort(function (p, q) { return p.d - q.d; }); F.itx = ""; }
      else if (a === "di") T.it = (T.it || []).filter(function (z) { return z.id !== x; });
      else if (a === "reset") { if (!confirm("¿Cerrar este viaje? Se borra para que armes uno nuevo.")) return false; h.t = null; F = {}; }
      commit("viaje");
    },
    sum: function (h) { var T = h.t; if (!T) return ""; var dd = dTo(T.di); return T.ds + (dd > 0 ? " · faltan " + dd + " días" : "") + " · " + VRES.filter(function (r, i) { return T.rs && T.rs[i]; }).length + "/" + VRES.length + " reservas"; }
  };

  // ---------- VIAJES: valija ----------
  var VTPL = { base: ["Documento o pasaporte", "Cargador y adaptador", "Medicamentos que uses", "Cepillo y pasta de dientes", "Ropa interior y medias", "Remeras", "Pantalón", "Abrigo liviano", "Calzado cómodo", "Auriculares"], playa: ["Malla", "Protector solar", "Ojotas", "Lentes de sol", "Gorra", "Toallón"], frio: ["Campera abrigada", "Gorro y guantes", "Ropa térmica", "Bufanda", "Medias gruesas"] };
  APPS.valija = {
    view: function () {
      var h = H("valija", { it: [] }), I = h.it, dn = I.filter(function (i) { return i.ok; }).length;
      var out = card("<b>" + (I.length ? "Tu valija · " + dn + "/" + I.length : "Armá tu valija") + "</b>" + (I.length ? '<div class="pgbar" style="margin:8px 0"><i style="width:' + Math.round(dn * 100 / I.length) + '%"></i></div>' : "") + '<p class="small muted" style="margin:6px 0 8px">Sumá una lista base y agregá lo tuyo.</p><div class="row" style="gap:8px;flex-wrap:wrap">' + mini("+ Básico", "tpl", "base") + mini("+ Playa", "tpl", "playa") + mini("+ Frío", "tpl", "frio") + "</div>");
      out += card(I.map(function (i) { return '<div class="row" style="gap:6px">' + '<div style="flex:1">' + ck(i.ok, "tg", i.id, i.t) + "</div>" + mini("✕", "del", i.id) + "</div>"; }).join("") + '<div class="row" style="gap:8px;margin-top:8px">' + inp("nt", "text", 'maxlength="40" placeholder="Agregar algo" style="flex:1"') + mini("Sumar", "add") + "</div>");
      return out + (I.length ? btn("Vaciar la lista", "clr", null, null, "ghost") : "");
    },
    act: function (a, x) {
      var h = H("valija", { it: [] });
      if (a === "tpl") (VTPL[x] || []).forEach(function (t) { if (!h.it.some(function (i) { return i.t === t; })) h.it.push({ id: uid(), t: t, ok: false }); });
      else if (a === "add") { var t = (F.nt || "").trim(); if (!t) return false; h.it.push({ id: uid(), t: t.slice(0, 40), ok: false }); F.nt = ""; }
      else if (a === "tg") h.it.forEach(function (i) { if (i.id === x) i.ok = !i.ok; });
      else if (a === "del") h.it = h.it.filter(function (i) { return i.id !== x; });
      else if (a === "clr") { if (!confirm("¿Vaciar la lista?")) return false; h.it = []; }
      commit("valija");
    },
    sum: function (h) { var I = h.it || []; return I.length ? "Valija: " + I.filter(function (i) { return i.ok; }).length + " de " + I.length + " cosas listas" : ""; }
  };

  // ---------- LABURO: postulaciones ----------
  var PST = ["Enviada", "Entrevista", "Prueba técnica", "Oferta", "No quedó"];
  APPS.postul = {
    view: function () {
      var h = H("postul", { p: [] }), P = h.p;
      var out = card("<b>Nueva postulación</b>" + '<div class="txrow2">' + field("Empresa", inp("em", "text", 'maxlength="40"')) + field("Puesto", inp("pu", "text", 'maxlength="40"')) + "</div>" + btn("Guardar", "add"));
      if (P.length) {
        var inP = P.filter(function (p) { return p.s >= 1 && p.s <= 3; }).length, of = P.filter(function (p) { return p.s === 3; }).length;
        out += card("<b>Tu búsqueda</b>" + stats([[P.length, "postulaciones"], [inP, "en proceso"], [of, of === 1 ? "oferta" : "ofertas"]]) + bars(lastN(7).map(function (k) { var n = P.filter(function (p) { return p.d === k; }).length; return { l: lbl(k), v: n, c: n ? "ok" : "" }; })) +
          note(P.length < 10 ? "Constancia: 2 o 3 postulaciones buenas por día rinden más que 20 de golpe." : inP ? "Vas bien: preparate para cada entrevista con el simulacro." : "Si no te llaman, revisá tu CV y adaptalo a cada puesto."));
        out += card("<b>Postulaciones</b>" + P.slice(0, 20).map(function (p) { return '<div class="txpst"><div style="flex:1;min-width:0"><b>' + esc(p.em) + "</b><small>" + esc(p.pu || "") + " · " + esc(dm(p.d)) + '</small></div><button class="txstage s' + p.s + '" data-tx="st" data-ta="' + p.id + '">' + PST[p.s] + " ›</button>" + mini("✕", "del", p.id) + "</div>"; }).join("") + note("Tocá el estado para avanzarlo."));
      }
      return out;
    },
    act: function (a, x) {
      var h = H("postul", { p: [] });
      if (a === "add") { var em = (F.em || "").trim(); if (!em) return false; h.p.unshift({ id: uid(), em: em.slice(0, 40), pu: (F.pu || "").trim().slice(0, 40), s: 0, d: K(0) }); F.em = ""; F.pu = ""; }
      else if (a === "st") h.p.forEach(function (p) { if (p.id === x) { p.s = (p.s + 1) % PST.length; p.u = K(0); } });
      else if (a === "del") h.p = h.p.filter(function (p) { return p.id !== x; });
      commit("postul");
    },
    done: function (h) { return (h.p || []).some(function (p) { return p.d === K(0) || p.u === K(0); }); },
    sum: function (h) { var P = h.p || []; return P.length ? P.length + " postulaciones · " + P.filter(function (p) { return p.s >= 1 && p.s <= 3; }).length + " en proceso" : ""; }
  };

  // ---------- cuándo cuenta como "hecha hoy" y resumen de datos (herramientas que ya existían) ----------
  APPS.sueno.done = function (h) { return !!(h.log && h.log[K(0)]); };
  APPS.sueno.sum = function (h) { var L = h.log || {}, v = lastN(7).filter(function (k) { return L[k]; }).map(function (k) { return L[k].h; }); return v.length ? "Dormís " + hm(avg(v) * 60) + " en promedio (" + v.length + (v.length === 1 ? " noche" : " noches") + ")" : ""; };
  APPS.pantalla.done = function (h) { return !!(h.log && h.log[K(0)]); };
  APPS.pantalla.sum = function (h) { var L = h.log || {}, v = lastN(7).filter(function (k) { return L[k]; }).map(function (k) { return L[k].m; }); return v.length ? "Pantalla: " + hm(avg(v)) + " por día · límite " + hm(h.limit || 180) : ""; };
  APPS.enfoque.done = function (h) { return !!(h.log && h.log[K(0)] && h.log[K(0)].length); };
  APPS.enfoque.sum = function (h) { var m = sumWeek(h.log || {}, mins); return m ? m + " min de foco esta semana" : ""; };
  APPS.animo.done = function (h) { return !!(h.log && h.log[K(0)] && h.log[K(0)].length); };
  APPS.animo.sum = function (h) { var L = h.log || {}, n = lastN(7).reduce(function (s, k) { return s + (L[k] || []).length; }, 0); return n ? n + " registros de ánimo en 7 días" : ""; };
  APPS.ritmos.done = function (h) { return !!(h.log && h.log[K(0)]); };
  APPS.ritmos.sum = function (h) { var m = sumWeek(h.log || {}, function (x) { return +x || 0; }); return m ? m + " min de respiración esta semana" : ""; };
  APPS.revision.done = function (h) { return !!(h.log && h.log[mondayKey()]); };
  APPS.rutinas.done = function (h) { return (h.r || []).some(function (r) { return r.done && r.done[K(0)] && Object.keys(r.done[K(0)]).length; }); };
  APPS.tarjetas.sum = function (h) { var D = h.decks || {}, n = Object.keys(D).reduce(function (s, k) { return s + D[k].cards.length; }, 0); return n ? n + " tarjetas en " + Object.keys(D).length + " mazo(s)" : ""; };
  APPS.examen.sum = function (h) { var E = (h.ex || []).filter(function (e) { return e.d >= K(0); }); return E.length ? E.length + " examen(es) por delante" : ""; };

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
    var b = BR(); b.sheet('<div class="row"><span class="shape">' + b.shape(T.plan) + '</span><div><span class="badge">Herramienta · ' + esc(b.planName(T.plan)) + '</span><h2 style="font-size:22px;margin-top:4px">' + esc(T.n) + '</h2></div></div><div id="tx" style="margin-top:12px"></div><button class="btn ghost block" data-close style="margin-top:6px">Listo</button>', true);
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
    done: function (id) { var A = APPS[id], s = BR().S(), h = s.tl && s.tl[id]; if (!A || !h) return false; try { if (A.done) return !!A.done(h); } catch (e) { return false; } return !!(h.at && dk(new Date(h.at)) === K(0)); },
    sum: function (id) { var A = APPS[id], s = BR().S(), h = s.tl && s.tl[id]; if (!A || !h || !A.sum) return ""; try { return A.sum(h) || ""; } catch (e) { return ""; } },
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
      { id: "rutinas", n: "Mis rutinas", d: "Armá tus rutinas con pasos propios y tildalas cada día.", plan: "vida", gate: "vida", mins: 10, app: true },
      { id: "entreno", n: "Mi rutina de entrenamiento", d: "Armá tus rutinas, hacelas serie por serie y mirá tu carga de la semana.", plan: "deporte", mins: 45, app: true },
      { id: "partidos", n: "Diario de partidos", d: "Resultado, cómo jugaste y qué mejorar. Ves tu temporada y tus patrones.", plan: "deporte", mins: 5, app: true },
      { id: "comidas", n: "Comidas y agua", d: "Tildá tus 4 comidas y tus vasos de agua. Sin contar calorías.", plan: "comer", mins: 3, app: true },
      { id: "menu", n: "Menú semanal y compras", d: "Planificá almuerzos y cenas de la semana y armá tu lista del súper.", plan: "comer", mins: 15, app: true },
      { id: "mover", n: "Registro de movimiento", d: "Sumá tus minutos de actividad y llegá a tu meta de la semana.", plan: "movimiento", mins: 3, app: true },
      { id: "gastos", n: "Registro de gastos", d: "Anotá en segundos, mirá en qué se te va la plata y cuánto te queda por día.", plan: "plata", mins: 3, app: true },
      { id: "ahorro", n: "Metas de ahorro", d: "Poné una meta, sumá aportes y mirá cuánto te falta.", plan: "plata", mins: 3, app: true },
      { id: "viaje", n: "Mi viaje", d: "Cuenta regresiva, presupuesto por rubro, reservas e itinerario día por día.", plan: "viajes", mins: 15, app: true },
      { id: "valija", n: "Valija", d: "Listas base para playa o frío, y tildás lo que ya guardaste.", plan: "viajes", mins: 10, app: true },
      { id: "postul", n: "Mis postulaciones", d: "Seguí cada búsqueda: enviada, entrevista, prueba, oferta.", plan: "laburo", mins: 10, app: true }
    ]
  };
})();
