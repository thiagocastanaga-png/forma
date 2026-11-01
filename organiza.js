(function () {
  var root = document.getElementById("organiza");
  if (!root) return;

  var STEPS = [
    { title: "¿A qué hora te despertás y a qué hora te dormís?", hint: "Con esto sabemos cuánto día tenés para repartir.", fields: [
      { key: "wake", label: "Me despierto", opts: [["5:00", 300], ["6:00", 360], ["7:00", 420], ["8:00", 480], ["9:00", 540]] },
      { key: "sleep", label: "Me duermo", opts: [["22:00", 1320], ["23:00", 1380], ["00:00", 1440], ["01:00", 1500]] }
    ] },
    { title: "¿Qué horarios fijos tenés?", hint: "Trabajo, estudio o clases que no se mueven.", fields: [
      { key: "fixed", label: "", opts: [["Ninguno", "none"], ["Mañana (9 a 13)", "am"], ["Tarde (14 a 18)", "pm"], ["Jornada completa (9 a 18)", "full"], ["Noche (18 a 22)", "night"]] }
    ] },
    { title: "¿Cuánto tardás en cada traslado?", hint: "Lo que tardás en ir, y lo mismo para volver.", fields: [
      { key: "commute", label: "", opts: [["No viajo", 0], ["Hasta 20 min", 20], ["Unos 45 min", 45], ["Hora y media", 90]] }
    ] },
    { title: "¿Cuáles son tus prioridades de esta etapa?", hint: "Las que más querés mover ahora. La primera que elijas es la más importante.", fields: [
      { key: "prios", label: "", multi: true, max: 3, opts: [["Salud", "health"], ["Familia y relaciones", "family"], ["Proyectos personales", "projects"], ["Tenis o mi deporte", "sport"], ["Estudio", "study"], ["Ingresos económicos", "income"], ["Descanso y ocio", "rest"]] }
    ] },
    { title: "¿Qué hábitos nuevos querés sumar?", hint: "Mejor pocos y bien hechos. Si no querés sumar ninguno ahora, seguí.", fields: [
      { key: "habits", label: "", multi: true, max: 3, req: false, opts: [["Leer", "read"], ["Meditar y respirar", "breathe"], ["Moverme y estirar", "move"], ["Escribir un diario", "write"], ["Aprender algo nuevo", "learn"], ["Caminar", "walk"]] }
    ] },
    { title: "¿En qué momento del día tenés más energía?", hint: "Ahí va lo que más te cuesta o más te importa.", fields: [
      { key: "energy", label: "", opts: [["A la mañana", "am"], ["A la tarde", "pm"], ["A la noche", "night"]] }
    ] },
    { title: "¿Cuánto tiempo libre real tenés por día?", hint: "Sin contar trabajo, estudio, comidas ni traslados.", fields: [
      { key: "free", label: "", opts: [["Poco, cerca de 1 hora", 60], ["Medio, 2 a 3 horas", 150], ["Mucho, 4 horas o más", 240]] }
    ] },
    { title: "¿Qué es lo que más te hace perder el tiempo?", hint: "No para prohibirlo: para planificarlo.", fields: [
      { key: "waste", label: "", opts: [["El celular y las redes", "phone"], ["Postergar lo importante", "procrastinate"], ["Los imprevistos", "buffer"], ["Nada en particular", "none"]] }
    ] },
    { title: "¿Entrenás o hacés actividad física?", hint: "Contanos cuánto dura un día de entrenamiento.", fields: [
      { key: "train", label: "", opts: [["No entreno", 0], ["Una hora", 60], ["Dos horas", 120]] }
    ] },
    { title: "¿A qué hora almorzás?", hint: "La cena la acomodamos nosotros según a qué hora te dormís.", fields: [
      { key: "lunch", label: "", opts: [["12:30", 750], ["13:30", 810], ["14:30", 870]] }
    ] },
    { title: "¿Plan estricto o flexible?", hint: "Estricto asigna todo el día. Flexible deja margen libre a propósito.", fields: [
      { key: "style", label: "", opts: [["Estricto", "strict"], ["Flexible", "flex"]] }
    ] },
    { title: "¿Querés pausas con respiración durante el día?", hint: "Son de 5 minutos y se acomodan dentro de los bloques más largos.", fields: [
      { key: "pauses", label: "", opts: [["No, gracias", 0], ["Sí, 2 pausas", 2], ["Sí, 3 pausas", 3]] }
    ] }
  ];

  var KIND = {
    fixed: { tag: "Fijo", dot: "#111111" },
    commute: { tag: "Traslado", dot: "#8A8478" },
    meal: { tag: "Comida", dot: "#C9AE72" },
    train: { tag: "Entreno", dot: "#2F5D46" },
    focus: { tag: "Foco", dot: "#86A892" },
    habit: { tag: "Hábito", dot: "#5E8C73" },
    pause: { tag: "Pausa", dot: "#9DB7A8" },
    free: { tag: "Libre", dot: "#D9D4C7" },
    rest: { tag: "Descanso", dot: "#6B6B63" }
  };

  var state = { step: 0, ans: {} };

  function fmt(m) {
    var x = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(x / 60), mm = x % 60;
    return String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
  }
  function durText(d) {
    if (d < 60) return d + " min";
    var h = Math.floor(d / 60), r = d % 60;
    return h + " h" + (r ? " " + r + " min" : "");
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  // ---------- Motor de reglas ----------
  function plan(a) {
    var blocks = [], warnings = [];
    var wake = a.wake, sleep = a.sleep, lunch = a.lunch;
    var din = Math.min(Math.max(sleep - 135, 1110), 1290);
    var strict = a.style === "strict";

    function add(s, e, label, kind, note) {
      if (e - s >= 5) blocks.push({ s: s, e: e, label: label, kind: kind, note: note || "" });
    }
    function gaps(from, to) {
      var sorted = blocks.slice().sort(function (x, y) { return x.s - y.s; });
      var out = [], cur = from;
      for (var i = 0; i < sorted.length; i++) {
        var b = sorted[i];
        if (b.e <= cur) continue;
        if (b.s >= to) break;
        if (b.s > cur) out.push([cur, Math.min(b.s, to)]);
        cur = Math.max(cur, b.e);
        if (cur >= to) break;
      }
      if (cur < to) out.push([cur, to]);
      return out;
    }
    function place(dur, from, to, label, kind, note, backward) {
      var fs = [1, 0.75, 0.5];
      for (var i = 0; i < fs.length; i++) {
        var d = Math.max(Math.round(dur * fs[i] / 5) * 5, Math.min(dur, 15));
        var gs = gaps(from, to).filter(function (g) { return g[1] - g[0] >= d; });
        if (gs.length) {
          var g = backward ? gs[gs.length - 1] : gs[0];
          var s = backward ? g[1] - d : g[0];
          add(s, s + d, label, kind, note);
          return true;
        }
      }
      return false;
    }
    function sub(sg, cut) {
      if (cut[1] <= sg[0] || cut[0] >= sg[1]) return [sg];
      var out = [];
      if (cut[0] - sg[0] >= 15) out.push([sg[0], cut[0]]);
      if (sg[1] - cut[1] >= 15) out.push([cut[1], sg[1]]);
      return out;
    }

    add(sleep - 60, sleep, "Desconectar y dormir", "rest", "Sin pantallas. Preparás el día siguiente y bajás el ritmo.");
    add(wake, wake + 40, "Despertar, agua y desayuno", "meal", "Primero luz y un vaso de agua, antes que el celular.");
    add(lunch, lunch + 45, "Almuerzo", "meal", "");
    add(din, din + 45, "Cena", "meal", "");

    var fxMap = { am: [540, 780], pm: [840, 1080], full: [540, 1080], night: [1080, 1320] };
    var fx = fxMap[a.fixed];
    if (fx) {
      var c = a.commute;
      var fs = Math.max(fx[0], wake + 40 + c);
      var fe = Math.min(fx[1], sleep - 90 - c);
      if (fe - fs >= 60) {
        var segs = [[fs, fe]];
        [[lunch, lunch + 45], [din, din + 45]].forEach(function (cut) {
          segs = segs.reduce(function (acc, sg) { return acc.concat(sub(sg, cut)); }, []);
        });
        segs.forEach(function (sg) { add(sg[0], sg[1], "Tus horarios fijos", "fixed", "Trabajo, estudio o clases."); });
        if (c > 0) {
          gaps(fs - c, fs).forEach(function (g) { add(g[0], g[1], "Traslado", "commute", ""); });
          gaps(fe, fe + c).forEach(function (g) { add(g[0], g[1], "Traslado de vuelta", "commute", ""); });
        }
      }
    }

    if (a.train > 0) {
      var tdur = a.train + 30;
      var win = a.energy === "pm" ? [wake + 40, 720] : [960, 1200];
      var tnote = "Incluye 10 min de entrada en calor y 20 de recuperación.";
      if (!place(tdur, win[0], win[1], "Entrenamiento", "train", tnote)) {
        if (!place(tdur, wake + 40, sleep - 65, "Entrenamiento", "train", tnote)) {
          warnings.push("No encontramos lugar para entrenar. Probá reducir el tiempo de entrenamiento o tus horarios fijos.");
        }
      }
    }

    var HB = {
      read: { n: "Leer", d: 20, pref: "night" },
      breathe: { n: "Meditar y respirar", d: 10, pref: "am" },
      move: { n: "Moverme y estirar", d: 15, pref: "am" },
      write: { n: "Escribir un diario", d: 10, pref: "night" },
      learn: { n: "Aprender algo nuevo", d: 25, pref: "mid" },
      walk: { n: "Caminar", d: 20, pref: "mid" }
    };
    var habitList = (a.habits || []).map(function (k) { return HB[k]; });
    habitList.forEach(function (h) {
      var anchors = {
        am: function () { return place(h.d, wake + 40, wake + 240, h.n, "habit", "Anclado a despertarte: lo pegás a algo que ya hacés."); },
        mid: function () { return place(h.d, lunch + 45, lunch + 300, h.n, "habit", "Anclado a almorzar: justo después de comer."); },
        night: function () { return place(h.d, din + 45, sleep - 60, h.n, "habit", "Anclado a desconectar: lo último antes de dormir.", true); }
      };
      var ok = anchors[h.pref]();
      if (!ok) ok = ["am", "mid", "night"].some(function (k) { return anchors[k](); });
      if (!ok) warnings.push('No encontramos lugar para "' + h.n + '". Probá con menos hábitos o más tiempo libre.');
    });

    var PR = {
      health: ["Salud", "Comida, movimiento y descanso."],
      family: ["Familia y relaciones", "Tiempo de calidad, sin celular."],
      projects: ["Proyectos personales", "Un paso concreto de tu proyecto, no todo el proyecto."],
      sport: ["Tenis o mi deporte", "Práctica técnica o mental de tu deporte."],
      study: ["Estudio", "Estudio profundo, un solo tema."],
      income: ["Ingresos económicos", "Una acción concreta que mueva tus ingresos."],
      rest: ["Descanso y ocio", "Descanso y ocio, con permiso."]
    };
    var prios = a.prios || [];
    var habitsTotal = habitList.reduce(function (s, h) { return s + h.d; }, 0);
    var budget = a.free * (strict ? 1 : 0.8);
    var avail = Math.max(budget - habitsTotal, prios.length * 20);
    var weights = [3, 2, 1].slice(0, prios.length);
    var sumW = weights.reduce(function (s, w) { return s + w; }, 0) || 1;
    var peak = { am: [wake + 40, 720], pm: [840, 1080], night: [1140, sleep - 75] }[a.energy];
    prios.forEach(function (k, i) {
      var dur = Math.max(20, Math.round(avail * weights[i] / sumW / 5) * 5);
      var note = PR[k][1];
      var extra = (i === 0 && a.waste === "procrastinate") ? " Regla de 10 minutos: empezá solo 10 y después decidís." : "";
      var peakNote = (i === 0 ? "Tu mejor momento de energía. " : "") + note + extra;
      var ok = place(dur, peak[0], peak[1], PR[k][0], "focus", peakNote) || place(dur, wake + 40, sleep - 65, PR[k][0], "focus", note + extra);
      if (ok && i === 0 && peakNote !== note + extra) {
        var placed = blocks.filter(function (b) { return b.label === PR[k][0] && b.kind === "focus"; })[0];
        if (placed && (placed.e <= peak[0] || placed.s >= peak[1])) placed.note = note + extra;
        if (placed && placed.note === note + extra) warnings.push("Tu mejor momento de energía está ocupado por tus horarios fijos, así que tu prioridad número 1 quedó en otro horario.");
      }
      if (!ok) warnings.push('No encontramos lugar para "' + PR[k][0] + '". Probá con menos prioridades o más tiempo libre.');
    });

    if (a.waste === "phone") place(20, lunch + 45, din, "Celular y redes, con límite", "free", "20 minutos con alarma. Después lo dejás.");
    if (a.waste === "buffer") place(30, 900, din, "Margen para imprevistos", "free", "Si no pasa nada, es tiempo extra para vos.");

    blocks.filter(function (b) { return (b.kind === "fixed" || b.kind === "focus") && b.e - b.s >= 80; })
      .sort(function (x, y) { return (y.e - y.s) - (x.e - x.s); })
      .slice(0, a.pauses)
      .forEach(function (b) {
        var mid = Math.round((b.s + b.e) / 2 / 5) * 5, end = b.e;
        b.e = mid;
        add(mid, mid + 5, "Pausa y respiración", "pause", "Respiración cuadrada: inhalá 4, sostené 4, exhalá 4, sostené 4. Cuatro vueltas.");
        add(mid + 5, end, b.label, b.kind, b.note);
      });

    gaps(wake, sleep - 60).forEach(function (g) {
      if (g[1] - g[0] >= 20) {
        if (strict) add(g[0], g[1], "Ocio y descanso", "rest", "Descanso sin culpa: también es parte del plan.");
        else add(g[0], g[1], "Margen libre", "free", "Lo dejamos sin asignar a propósito.");
      } else {
        add(g[0], g[1], "Transición", "free", "Un respiro entre bloques.");
      }
    });

    blocks.sort(function (x, y) { return x.s - y.s; });
    function sum(kinds) {
      return blocks.filter(function (b) { return kinds.indexOf(b.kind) >= 0; }).reduce(function (s, b) { return s + (b.e - b.s); }, 0);
    }
    return { blocks: blocks, warnings: warnings, focus: sum(["focus"]), habits: sum(["habit"]), free: Math.max(sum(["free", "rest"]) - 60, 0) };
  }

  // ---------- Interfaz ----------
  function isReady(step) {
    return step.fields.every(function (f) {
      if (f.req === false) return true;
      var v = state.ans[f.key];
      return f.multi ? (v || []).length >= 1 : v !== undefined;
    });
  }

  function render() {
    var total = STEPS.length;
    var html = "";
    if (state.step === 0) {
      html = '<div class="stack gap-24">'
        + '<h1>Organizá tu día</h1>'
        + '<p class="lead muted">Respondé 12 preguntas rápidas y recibí tu día armado en bloques con horarios: lo fijo, lo importante, tus hábitos y tus pausas.</p>'
        + '<div><button type="button" class="btn btn-dark" data-act="start">Empezar</button></div>'
        + '<p class="fineprint">Tarda 2 minutos. Tus respuestas no se envían ni se guardan: todo se calcula en tu navegador.</p></div>';
    } else if (state.step <= total) {
      var st = STEPS[state.step - 1];
      var pct = Math.round(state.step / total * 100);
      html = '<div class="stack gap-32">'
        + '<div class="stack gap-12"><div class="muted" style="font-size:16px;font-weight:600">Pregunta ' + state.step + ' de ' + total + '</div>'
        + '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div style="width:' + pct + '%"></div></div></div>'
        + '<div class="stack gap-12"><h2 style="font-size:clamp(26px,4vw,38px)" id="q-title" tabindex="-1">' + esc(st.title) + '</h2><p class="muted">' + esc(st.hint) + '</p></div>';
      st.fields.forEach(function (f, fi) {
        var val = state.ans[f.key];
        html += '<div class="stack gap-12">';
        if (f.label) html += '<div style="font-size:16px;font-weight:600">' + esc(f.label) + '</div>';
        html += '<div class="chips">';
        f.opts.forEach(function (o, oi) {
          var sel = f.multi ? (val || []).indexOf(o[1]) >= 0 : val === o[1];
          html += '<button type="button" class="chip" aria-pressed="' + sel + '" data-f="' + fi + '" data-o="' + oi + '">' + esc(o[0]) + '</button>';
        });
        html += '</div>';
        if (f.multi) html += '<div class="muted" style="font-size:16px">Elegí hasta ' + f.max + '.</div>';
        html += '</div>';
      });
      html += '<div class="row"><button type="button" class="btn btn-ghost" data-act="back">Atrás</button>'
        + '<button type="button" class="btn btn-accent" data-act="next"' + (isReady(st) ? "" : " disabled") + '>' + (state.step === total ? "Armar mi día" : "Siguiente") + '</button></div></div>';
    } else {
      var a = state.ans, res = plan(a);
      html = '<div class="stack gap-40">'
        + '<div class="stack gap-12"><h2 id="q-title" tabindex="-1">Tu día, con forma</h2><p class="lead muted">De ' + fmt(a.wake) + " a " + fmt(a.sleep) + ", repartido en bloques.</p></div>"
        + '<div class="stats"><div class="stat"><b>' + durText(res.focus) + '</b><span>de foco en tus prioridades</span></div>'
        + '<div class="stat"><b>' + durText(res.habits) + '</b><span>en hábitos nuevos</span></div>'
        + '<div class="stat"><b>' + durText(res.free) + '</b><span>libres para descansar</span></div></div>';
      if (res.warnings.length) {
        html += '<div class="notice"><b>Para tener en cuenta</b>' + res.warnings.map(function (w) { return "<div>" + esc(w) + "</div>"; }).join("") + "</div>";
      }
      html += '<div class="timeline">';
      res.blocks.forEach(function (b) {
        var k = KIND[b.kind], d = b.e - b.s;
        var h = Math.min(Math.max(72, Math.round(d * 1.1)), 220);
        html += '<div class="block k-' + b.kind + '"><div class="time">' + fmt(b.s) + " – " + fmt(b.e) + "</div>"
          + '<div class="body" style="min-height:' + h + 'px"><div class="meta"><span class="dotk" style="background:' + k.dot + '"></span><b>' + k.tag + "</b><span>" + durText(d) + "</span></div>"
          + '<div class="title">' + esc(b.label) + "</div>" + (b.note ? '<div class="note">' + esc(b.note) + "</div>" : "") + "</div></div>";
      });
      html += "</div>"
        + '<div class="dark" style="border-radius:24px;padding:32px"><div class="stack gap-12"><h3 style="font-size:24px">Cómo armamos tu día</h3>'
        + '<p class="muted">1. Primero van tus horarios fijos, las comidas y los traslados.</p>'
        + '<p class="muted">2. Tu prioridad número 1 va en tu mejor momento de energía.</p>'
        + '<p class="muted">3. Cada hábito nuevo se pega a algo que ya hacés: despertarte, almorzar o desconectar.</p>'
        + '<p class="muted">4. La última hora antes de dormir queda protegida, sin pantallas.</p>'
        + '<p class="muted" style="font-size:16px">Es una guía de organización. Si tenés dolor o una lesión, consultá a un profesional de la salud antes de entrenar.</p></div></div>'
        + '<div class="row"><button type="button" class="btn btn-accent" data-act="edit">Cambiar mis respuestas</button>'
        + '<button type="button" class="btn btn-ghost" data-act="restart">Empezar de nuevo</button>'
        + '<button type="button" class="btn btn-ghost" data-act="print">Imprimir o guardar en PDF</button></div>'
        + '<div class="dark" style="border-radius:24px;padding:32px"><div class="stack gap-12"><h3 style="font-size:24px">¿Querés esto todos los días, sin armarlo a mano?</h3>'
        + '<p class="muted">Estamos armando Forma Hábitos, la app que hace esto por vos.</p>'
        + '<div><a class="btn btn-accent" href="app">Anotarme en la lista de espera</a></div></div></div>'
        + "</div>";
    }
    root.innerHTML = html;
    var t = document.getElementById("q-title");
    if (t && state.step > 0) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
  }

  root.addEventListener("click", function (ev) {
    var el = ev.target.closest("button");
    if (!el || el.disabled) return;
    var act = el.getAttribute("data-act");
    if (act === "start") state.step = 1;
    else if (act === "next") state.step += 1;
    else if (act === "back") state.step = Math.max(state.step - 1, 0);
    else if (act === "edit") state.step = 1;
    else if (act === "restart") state = { step: 0, ans: {} };
    else if (act === "print") { window.print(); return; }
    else if (el.hasAttribute("data-f")) {
      var f = STEPS[state.step - 1].fields[+el.getAttribute("data-f")];
      var o = f.opts[+el.getAttribute("data-o")];
      if (f.multi) {
        var cur = (state.ans[f.key] || []).slice();
        var i = cur.indexOf(o[1]);
        if (i >= 0) cur.splice(i, 1); else if (cur.length < f.max) cur.push(o[1]);
        state.ans[f.key] = cur;
      } else {
        state.ans[f.key] = o[1];
      }
      render();
      return;
    } else return;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  render();
})();
