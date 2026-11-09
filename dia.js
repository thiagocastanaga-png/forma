(function () {
  "use strict";
    // ---------- Utilidades ----------
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
  // Opciones de hora cada 30 min. wrap=true guarda la hora del día (0 a 1439).
  function times(from, to, wrap) {
    var o = [];
    for (var m = from; m <= to; m += 30) o.push([fmt(m), wrap ? m % 1440 : m]);
    return o;
  }
  var CLOCK = times(300, 300 + 1410, true); // 05:00 hasta 04:30, para horarios fijos
  var CLOCK_END = times(300, 300 + 1410, true);

  // ---------- Preguntas ----------
  var STEPS = [
    { title: "¿A qué hora te despertás y a qué hora te dormís?", hint: "Elegí tus horarios reales, aunque sean distintos cada día: usá los más habituales.",
      fields: [
        { key: "wake", label: "Me despierto", type: "select", placeholder: "Elegí una hora", opts: times(180, 960, true), ex: [180, 960, true] },
        { key: "sleep", label: "Me duermo", type: "select", placeholder: "Elegí una hora", opts: times(1200, 1920, false), ex: [1200, 1920, false] }
      ],
      check: function (a) {
        if (a.wake === undefined || a.sleep === undefined) return "";
        var d = a.sleep - a.wake;
        if (d < 360) return "Entre que te despertás y te dormís hay menos de 6 horas. Revisá los horarios.";
        if (d > 1260) return "Entre que te despertás y te dormís hay más de 21 horas. Revisá los horarios.";
        return "";
      } },
    { title: "¿Tenés horarios fijos?", hint: "Trabajo, estudio, clases o lo que no se mueve. Agregá todos los que necesites y ponele nombre a cada uno. Si terminás después de medianoche, elegí la hora igual (por ejemplo, 06:00).",
      fields: [
        { key: "fixedOn", label: "", type: "chips", opts: [["No tengo", "no"], ["Sí tengo", "yes"]] },
        { key: "fixed", label: "", type: "blocks", showIf: function (a) { return a.fixedOn === "yes"; } }
      ],
      check: function (a) {
        if (a.fixedOn !== "yes" || a.wake === undefined) return "";
        var list = (a.fixed || []).filter(function (b) { return b.s !== undefined && b.e !== undefined; });
        var iv = [];
        for (var i = 0; i < list.length; i++) {
          var dur = ((list[i].e - list[i].s) + 1440) % 1440;
          if (dur === 0) return "El horario fijo " + (i + 1) + " empieza y termina a la misma hora.";
          var st = list[i].s;
          while (st < a.wake) st += 1440;
          iv.push([st, st + dur, i + 1]);
        }
        for (var x = 0; x < iv.length; x++) for (var y = x + 1; y < iv.length; y++) {
          if (iv[x][0] < iv[y][1] && iv[y][0] < iv[x][1]) return "Los horarios fijos " + iv[x][2] + " y " + iv[y][2] + " se superponen. Revisá las horas.";
        }
        return "";
      } },
    { skip: function (a) { return a.fixedOn !== "yes"; }, title: "¿Cuánto tardás en cada traslado?", hint: "Es lo que tardás en llegar a tus horarios fijos y en volver. Elegí un tiempo de la lista o escribí el tuyo. Si no te movés, dejá \"No viajo\".",
      fields: [
        { key: "commuteGo", label: "Ida", type: "minutes" },
        { key: "commuteSame", label: "¿La vuelta tarda lo mismo?", type: "chips", opts: [["Sí, igual", "same"], ["No, distinta", "diff"]] },
        { key: "commuteBack", label: "Vuelta", type: "minutes", showIf: function (a) { return a.commuteSame === "diff"; } }
      ] },
    { title: "¿Cuáles son tus prioridades de esta etapa?", hint: "Las que más querés mover ahora. La primera que elijas es la más importante.",
      fields: [
        { key: "prios", label: "", type: "chips", multi: true, max: 3, opts: [["Salud", "health"], ["Familia y relaciones", "family"], ["Cuidar a otros", "care"], ["Proyectos personales", "projects"], ["Deporte o entrenamiento", "sport"], ["Estudio", "study"], ["Trabajo e ingresos", "income"], ["Casa y tareas", "home"], ["Descanso y ocio", "rest"]] }
      ] },
    { title: "¿Qué hábitos nuevos querés sumar?", hint: "Mejor pocos y bien hechos. Si no querés sumar ninguno ahora, seguí.",
      fields: [
        { key: "habits", label: "", type: "chips", multi: true, max: 3, req: false, opts: [["Leer", "read"], ["Meditar y respirar", "breathe"], ["Moverme y estirar", "move"], ["Escribir un diario", "write"], ["Aprender algo nuevo", "learn"], ["Caminar", "walk"], ["Planificar el día siguiente", "plan"]] }
      ] },
    { title: "¿En qué momento del día tenés más energía?", hint: "Ahí va lo que más te cuesta o más te importa.",
      fields: [
        { key: "energy", label: "", type: "chips", opts: [["A la mañana", "am"], ["A la tarde", "pm"], ["A la noche", "night"], ["Va cambiando", "any"]] }
      ] },
    { title: "¿Cuánto tiempo libre real tenés por día?", hint: "Sin contar trabajo, estudio, comidas ni traslados.",
      fields: [
        { key: "free", label: "", type: "chips", opts: [["Media hora", 30], ["1 hora", 60], ["1 hora y media", 90], ["2 horas", 120], ["3 horas", 180], ["4 horas", 240], ["5 horas o más", 300]] }
      ] },
    { title: "¿Qué es lo que más te hace perder el tiempo?", hint: "No para prohibirlo: para planificarlo.",
      fields: [
        { key: "waste", label: "", type: "chips", opts: [["El celular y las redes", "phone"], ["Postergar lo importante", "procrastinate"], ["Los imprevistos", "buffer"], ["Nada en particular", "none"]] }
      ] },
    { title: "¿Entrenás o hacés actividad física?", hint: "Contanos cuánto dura un día de entrenamiento y cuándo te gustaría hacerlo.",
      fields: [
        { key: "train", label: "Duración", type: "chips", opts: [["No entreno", 0], ["30 minutos", 30], ["45 minutos", 45], ["1 hora", 60], ["1 hora y media", 90], ["2 horas", 120]] },
        { key: "trainWhen", label: "Momento preferido", type: "chips", opts: [["A la mañana", "am"], ["A la tarde", "pm"], ["A la noche", "night"], ["Me da igual", "any"]], showIf: function (a) { return a.train > 0; } }
      ] },
    { title: "¿A qué hora comés?", hint: "La hora del almuerzo y de la cena. Si no almorzás o no cenás, elegilo.",
      fields: [
        { key: "lunch", label: "Almuerzo", type: "select", placeholder: "Elegí una hora", opts: times(600, 1020, true).concat([["No almuerzo", -1]]), ex: [600, 1020, true] },
        { key: "dinner", label: "Cena", type: "select", opts: [["Que la elija Forma", "auto"]].concat(times(1080, 1440, true)).concat([["No ceno", -1]]), ex: [1080, 1440, true] }
      ] },
    { title: "¿Plan estricto o flexible?", hint: "Estricto asigna todo el día. Flexible deja margen libre a propósito.",
      fields: [
        { key: "style", label: "", type: "chips", opts: [["Estricto", "strict"], ["Flexible", "flex"]] }
      ] },
    { title: "¿Querés pausas con respiración durante el día?", hint: "Son de 5 minutos y se acomodan dentro de los bloques más largos.",
      fields: [
        { key: "pauses", label: "", type: "chips", opts: [["No, gracias", 0], ["Sí, 2 pausas", 2], ["Sí, 3 pausas", 3], ["Sí, 4 pausas", 4]] }
      ] },
    { title: "¿A qué hora querés cerrar tu día?", hint: "A esa hora te aparece el cierre: repasás cómo te fue y te llevás tu forma de hoy. Lo podés cambiar cuando quieras.",
      fields: [
        { key: "closeAt", label: "Cierro mi día a las", type: "select", placeholder: "Elegí una hora (opcional)", opts: times(1020, 1410, false), req: false, ex: [1020, 1410, false] }
      ] }
  ];

  var KIND = {
    fixed: { tag: "Fijo", dot: "#8A8678" },
    commute: { tag: "Traslado", dot: "#8A8478" },
    meal: { tag: "Comida", dot: "#C9AE72" },
    train: { tag: "Entreno", dot: "#2F5D46" },
    focus: { tag: "Foco", dot: "#86A892" },
    habit: { tag: "Hábito", dot: "#5E8C73" },
    pause: { tag: "Pausa", dot: "#9DB7A8" },
    free: { tag: "Libre", dot: "#D9D4C7" },
    rest: { tag: "Descanso", dot: "#6B6B63" }
  };

  function newBlock() { return { s: undefined, e: undefined, name: "", travel: "yes" }; }
  var MIN_OPTS = [["No viajo", 0], ["5 minutos", 5], ["10 minutos", 10], ["15 minutos", 15], ["20 minutos", 20], ["30 minutos", 30], ["45 minutos", 45], ["1 hora", 60], ["1 hora 15", 75], ["1 hora 30", 90], ["2 horas", 120], ["2 horas 30", 150], ["3 horas", 180]];
  function initial() {
    return { step: 0, ans: { commuteGo: 0, commuteSame: "same", dinner: "auto", fixedOn: "no", fixed: [newBlock()] }, focus: null };
  }
  var state = initial();

  // ---------- Motor de reglas ----------
  function plan(a) {
    var blocks = [], warnings = [];
    var wake = a.wake, sleep = a.sleep;
    var strict = a.style === "strict";

    function norm(t) {
      while (t < wake) t += 1440;
      while (t >= wake + 1440) t -= 1440;
      return t;
    }
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
    function fillFree(s, e, label, kind, note) {
      gaps(s, e).forEach(function (g) { if (g[1] - g[0] >= 10) add(g[0], g[1], label, kind, note); });
    }
    function place(dur, from, to, label, kind, note, backward) {
      to = Math.min(to, sleep - 60); // nunca después de "Desconectar y dormir"
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
    // Ventana por hora del día (se prueba hoy y pasada la medianoche)
    function placeClock(dur, win, label, kind, note) {
      var lo = wake + 40, hi = sleep - 65;
      for (var k = 0; k < 2; k++) {
        var f = Math.max(win[0] + 1440 * k, lo), t = Math.min(win[1] + 1440 * k, hi);
        if (t - f >= 15 && place(dur, f, t, label, kind, note)) return true;
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

    // Sueño y despertar
    add(sleep - 60, sleep, "Desconectar y dormir", "rest", "Sin pantallas. Preparás el día siguiente y bajás el ritmo.");
    add(wake, wake + 40, "Despertar, agua y desayuno", "meal", "Primero luz y un vaso de agua, antes que el celular.");

    // Comidas
    var lunch = null, din = null;
    if (a.lunch !== -1 && a.lunch !== undefined) {
      lunch = Math.max(norm(a.lunch), wake + 60);
      if (lunch + 45 > sleep - 120) { lunch = null; warnings.push("Tu almuerzo (" + fmt(a.lunch) + ") quedó fuera de tu día, entre que te despertás y te dormís. Revisá la hora del almuerzo o tus horarios."); }
    }
    if (a.dinner !== -1) {
      din = (a.dinner === "auto" || a.dinner === undefined)
        ? Math.min(Math.max(sleep - 150, wake + 360), sleep - 105)
        : Math.min(norm(a.dinner), sleep - 105);
      if (din < wake + 120) { din = null; warnings.push("Tu cena quedó muy cerca de que te despertás, así que no la incluimos. Revisá la hora de la cena."); }
    }
    // La cena automática se corre para no pisar horarios fijos
    if (din !== null && (a.dinner === "auto" || a.dinner === undefined) && a.fixedOn === "yes") {
      var gGo = a.commuteGo || 0, gBack = a.commuteSame === "diff" ? (a.commuteBack || 0) : gGo;
      var ivs = (a.fixed || []).filter(function (b) { return b.s !== undefined && b.e !== undefined && ((b.e - b.s) + 1440) % 1440 > 0; }).map(function (b) {
        var st = norm(b.s), du = ((b.e - b.s) + 1440) % 1440, tr = b.travel !== "no";
        return [st - (tr ? gGo : 0), st + du + (tr ? gBack : 0)];
      });
      var hit = function (x) { return ivs.filter(function (v) { return x < v[1] && x + 45 > v[0]; }); };
      var cand = din, guard = 0;
      while (hit(cand).length && guard++ < 10) {
        cand = Math.round(Math.max.apply(null, hit(cand).map(function (v) { return v[1]; })) / 5) * 5;
      }
      if (hit(cand).length === 0 && cand <= sleep - 105) {
        din = cand;
      } else {
        cand = din; guard = 0;
        while (hit(cand).length && guard++ < 10) {
          cand = Math.round(Math.min.apply(null, hit(cand).map(function (v) { return v[0]; })) / 5) * 5 - 45;
        }
        if (hit(cand).length === 0 && cand >= wake + 120) din = cand;
      }
    }
    var meals = [];
    if (lunch !== null) { fillFree(lunch, lunch + 45, "Almuerzo", "meal", ""); meals.push([lunch, lunch + 45]); }
    if (din !== null) { fillFree(din, din + 45, "Cena", "meal", ""); meals.push([din, din + 45]); }

    // Horarios fijos y traslados
    var cGo = a.commuteGo || 0;
    var cBack = a.commuteSame === "diff" ? (a.commuteBack || 0) : cGo;
    var fixedList = a.fixedOn === "yes" ? (a.fixed || []).filter(function (b) { return b.s !== undefined && b.e !== undefined; }) : [];
    fixedList.forEach(function (fx) {
      var dur = ((fx.e - fx.s) + 1440) % 1440;
      if (dur === 0) return;
      var tr = fx.travel !== "no";
      var ci = tr ? cGo : 0, cb = tr ? cBack : 0;
      var s = norm(fx.s), e = s + dur;
      s = Math.max(s, wake + 40 + ci);
      e = Math.min(e, sleep - 60 - cb);
      var nm = (fx.name || "").trim() || "Tus horarios fijos";
      if (e - s < 30) {
        warnings.push("El horario " + nm + " (" + fmt(fx.s) + " a " + fmt(fx.e) + ") quedó casi fuera de tu día entre que te despertás y te dormís.");
        return;
      }
      var segs = [[s, e]];
      meals.forEach(function (cut) {
        segs = segs.reduce(function (acc, sg) { return acc.concat(sub(sg, cut)); }, []);
      });
      segs.forEach(function (sg) { fillFree(sg[0], sg[1], nm, "fixed", "Horario fijo."); });
      if (ci > 0) fillFree(s - ci, s, "Traslado", "commute", "");
      if (cb > 0) fillFree(e, e + cb, "Traslado de vuelta", "commute", "");
    });

    // Entrenamiento
    if (a.train > 0) {
      var extra = a.train <= 30 ? 15 : 30;
      var tdur = a.train + extra;
      var tnote = "Incluye entrada en calor y recuperación.";
      var tw = { am: [300, 720], pm: [720, 1080], night: [1080, 1440] }[a.trainWhen];
      if (!tw) tw = a.energy === "pm" ? [300, 720] : [960, 1200];
      var ok = placeClock(tdur, tw, "Entrenamiento", "train", tnote) || place(tdur, wake + 40, sleep - 65, "Entrenamiento", "train", tnote);
      if (!ok) warnings.push("No encontramos lugar para entrenar. Probá reducir el tiempo de entrenamiento o tus horarios fijos.");
    }

    // Hábitos anclados
    var HB = {
      read: { n: "Leer", d: 20, pref: "night" },
      breathe: { n: "Meditar y respirar", d: 10, pref: "am" },
      move: { n: "Moverme y estirar", d: 15, pref: "am" },
      write: { n: "Escribir un diario", d: 10, pref: "night" },
      learn: { n: "Aprender algo nuevo", d: 25, pref: "mid" },
      walk: { n: "Caminar", d: 20, pref: "mid" },
      plan: { n: "Planificar el día siguiente", d: 10, pref: "night" }
    };
    var habitList = (a.habits || []).map(function (k) { return HB[k]; });
    var afterLunch = lunch !== null ? lunch + 45 : wake + 240;
    var nightFrom = din !== null ? din + 45 : sleep - 240;
    habitList.forEach(function (h) {
      var anchors = {
        am: function () { return place(h.d, wake + 40, wake + 240, h.n, "habit", "Anclado a despertarte: lo pegás a algo que ya hacés."); },
        mid: function () { return place(h.d, afterLunch, afterLunch + 300, h.n, "habit", lunch !== null ? "Anclado a almorzar: justo después de comer." : "A media jornada, después de arrancar."); },
        night: function () { return place(h.d, nightFrom, sleep - 60, h.n, "habit", "Anclado a desconectar: lo último antes de dormir.", true); }
      };
      var ok = anchors[h.pref]();
      if (!ok) ok = ["am", "mid", "night"].some(function (k) { return anchors[k](); });
      if (!ok) warnings.push('No encontramos lugar para "' + h.n + '". Probá con menos hábitos o más tiempo libre.');
    });

    // Prioridades
    var PR = {
      health: ["Salud", "Comida, movimiento y descanso."],
      family: ["Familia y relaciones", "Tiempo de calidad, sin celular."],
      care: ["Cuidar a otros", "Tiempo reservado para quienes dependen de vos, para que no compita con todo lo demás."],
      projects: ["Proyectos personales", "Un paso concreto de tu proyecto, no todo el proyecto."],
      sport: ["Deporte o entrenamiento", "Práctica técnica o mental de tu deporte."],
      study: ["Estudio", "Estudio profundo, un solo tema."],
      income: ["Trabajo e ingresos", "Una acción concreta que mueva tu trabajo o tus ingresos."],
      home: ["Casa y tareas", "Un bloque para lo que hay que hacer en casa, sin que se acumule."],
      rest: ["Descanso y ocio", "Descanso y ocio, con permiso."]
    };
    var prios = a.prios || [];
    var habitsTotal = habitList.reduce(function (s, h) { return s + h.d; }, 0);
    var budget = a.free * (strict ? 1 : 0.8);
    var avail = Math.max(budget - habitsTotal, prios.length * 20);
    var weights = [3, 2, 1].slice(0, prios.length);
    var sumW = weights.reduce(function (s, w) { return s + w; }, 0) || 1;
    var peak = { am: [300, 720], pm: [720, 1080], night: [1080, 1440] }[a.energy];
    var peakNotePlaced = false;
    prios.forEach(function (k, i) {
      var dur = Math.max(20, Math.round(avail * weights[i] / sumW / 5) * 5);
      var base = PR[k][1];
      var extra = (i === 0 && a.waste === "procrastinate") ? " Regla de 10 minutos: empezá solo 10 y después decidís." : "";
      var ok = false;
      if (peak) {
        var before = blocks.length;
        ok = placeClock(dur, peak, PR[k][0], "focus", (i === 0 ? "Tu mejor momento de energía. " : "") + base + extra);
        if (ok && i === 0) peakNotePlaced = true;
      }
      if (!ok) ok = place(dur, wake + 40, sleep - 65, PR[k][0], "focus", base + extra);
      if (!ok) warnings.push('No encontramos lugar para "' + PR[k][0] + '". Probá con menos prioridades o más tiempo libre.');
    });
    if (peak && prios.length && !peakNotePlaced) {
      warnings.push("Tu mejor momento de energía está ocupado por otras cosas, así que tu prioridad número 1 quedó en otro horario.");
    }

    // Tiempo perdido
    if (a.waste === "phone") place(20, afterLunch, Math.max(din !== null ? din : sleep - 120, afterLunch + 60), "Celular y redes, con límite", "free", "20 minutos con alarma. Después lo dejás.");
    if (a.waste === "buffer") place(30, wake + 360, din !== null ? din : sleep - 120, "Margen para imprevistos", "free", "Si no pasa nada, es tiempo extra para vos.");

    // Pausas con respiración
    blocks.filter(function (b) { return (b.kind === "fixed" || b.kind === "focus") && b.e - b.s >= 80; })
      .sort(function (x, y) { return (y.e - y.s) - (x.e - x.s); })
      .slice(0, a.pauses)
      .forEach(function (b) {
        var mid = Math.round((b.s + b.e) / 2 / 5) * 5, end = b.e;
        b.e = mid;
        add(mid, mid + 5, "Pausa y respiración", "pause", "Respiración cuadrada: inhalá 4, sostené 4, exhalá 4, sostené 4. Cuatro vueltas.");
        add(mid + 5, end, b.label, b.kind, b.note);
      });

    // Lo que queda libre
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
  // ---------- Interfaz dentro de la app ----------
  var st = null, host = null;
  function visibleFields(step) { return step.fields.filter(function (f) { return !f.showIf || f.showIf(st.ans); }); }
  function stepMessage(step) { return step.check ? step.check(st.ans) : ""; }
  function isReady(step) {
    var ok = visibleFields(step).every(function (f) {
      if (f.req === false) return true;
      var v = st.ans[f.key];
      if (f.type === "blocks") return (v || []).length > 0 && v.every(function (b) { return b.s !== undefined && b.e !== undefined; });
      if (f.type === "minutes") return typeof v === "number" && !isNaN(v) && v >= 0;
      return f.multi ? (v || []).length >= 1 : v !== undefined;
    });
    return ok && stepMessage(step) === "";
  }
  function selectHtml(label, attrs, opts, selFn, ph) {
    var h = '<label class="field"><span>' + esc(label) + '</span><select ' + attrs + '>';
    var any = opts.some(function (o, i) { return selFn(o, i); });
    if (ph) h += '<option value=""' + (any ? "" : " selected") + " disabled>" + esc(ph) + "</option>";
    opts.forEach(function (o, i) { h += '<option value="' + i + '"' + (selFn(o, i) ? " selected" : "") + ">" + esc(o[0]) + "</option>"; });
    return h + "</select></label>";
  }
  // horarios fijos: lista cada 30 min + hora exacta (cualquier minuto)
  function blkSel(label, i, prop, val) {
    var has = typeof val === "number" && CLOCK.some(function (o) { return o[1] === val; }), opts = CLOCK.slice();
    if (typeof val === "number" && !has) { opts.push([fmt(val), val]); opts.sort(function (a, c) { return ((a[1] - 300 + 1440) % 1440) - ((c[1] - 300 + 1440) % 1440); }); }
    var h = '<label class="field"><span>' + esc(label) + '</span><select data-blk="' + i + '" data-prop="' + prop + '"><option value=""' + (typeof val === "number" ? "" : " selected") + " disabled>Hora</option>";
    opts.forEach(function (o) { h += '<option value="' + o[1] + '"' + (o[1] === val ? " selected" : "") + ">" + esc(o[0]) + "</option>"; });
    return h + '</select></label><label class="field exact"><span class="small muted">Hora exacta</span><input type="time" data-blkx="' + i + '" data-prop="' + prop + '" value="' + (typeof val === "number" ? fmt(val) : "") + '"></label>';
  }
  function fieldHtml(f) {
    var val = st.ans[f.key], h = "";
    if (f.type === "blocks") {
      var list = st.ans.fixed || [];
      list.forEach(function (b, i) {
        h += '<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b>Horario fijo ' + (i + 1) + '</b>' + (list.length > 1 ? '<button type="button" class="btn ghost sm" data-da="rmblk" data-i="' + i + '">Quitar</button>' : "") + '</div>' +
          '<label class="field"><span>Nombre (opcional)</span><input type="text" maxlength="40" data-blk="' + i + '" data-prop="name" value="' + esc(b.name || "") + '" placeholder="Trabajo, facultad, clases..."></label>' +
          '<div class="row" style="align-items:flex-start;margin-top:10px"><div style="flex:1">' + blkSel("Empieza", i, "s", b.s) + '</div><div style="flex:1">' + blkSel("Termina", i, "e", b.e) + '</div></div>' + (st.exErr && st.exErr["blk" + i] ? '<p class="small" style="color:var(--naranja,#FF8A4C);margin:6px 0 0">' + esc(st.exErr["blk" + i]) + "</p>" : "") +
          '<div style="margin-top:10px"><span class="small" style="font-weight:600">¿Tenés que trasladarte?</span><div class="chips" style="margin-top:6px">' + [["Sí", "yes"], ["No", "no"]].map(function (o) {
            return '<button type="button" class="chip" aria-pressed="' + (b.travel === o[1]) + '" data-blk="' + i + '" data-prop="travel" data-val="' + o[1] + '">' + o[0] + "</button>";
          }).join("") + "</div></div></div>";
      });
      if (list.length < 8) h += '<button type="button" class="btn ghost sm" data-da="addblk">+ Agregar otro horario fijo</button>';
      return h;
    }
    if (f.type === "minutes") {
      var custom = st.ans[f.key + "Mode"] === "custom", opts = MIN_OPTS.concat([["Otro tiempo (escribir minutos)", "custom"]]);
      h = selectHtml(f.label, 'data-key="' + f.key + '" data-kind="minutes"', opts, function (o) { return custom ? o[1] === "custom" : o[1] === val; }, null);
      if (custom) h += '<label class="field" style="margin-top:10px"><span>Minutos (de 0 a 300)</span><input type="number" min="0" max="300" inputmode="numeric" data-key="' + f.key + '" data-custom="1" value="' + (typeof val === "number" ? val : "") + '" placeholder="Por ejemplo, 37"></label>';
      return h;
    }
    if (f.type === "select") {
      return '<label class="field"><span>' + esc(f.label) + '</span><select data-key="' + f.key + '">' + (f.placeholder ? '<option value=""' + (val === undefined ? " selected" : "") + " disabled>" + esc(f.placeholder) + "</option>" : "") +
        f.opts.map(function (o, oi) { return '<option value="' + oi + '"' + (val === o[1] ? " selected" : "") + ">" + esc(o[0]) + "</option>"; }).join("") + "</select></label>" + exactHtml(f, val);
    }
    if (f.label) h += '<div class="small" style="font-weight:600;margin-bottom:6px">' + esc(f.label) + "</div>";
    h += '<div class="chips">' + f.opts.map(function (o, oi) {
      var sel = f.multi ? (val || []).indexOf(o[1]) >= 0 : val === o[1];
      return '<button type="button" class="chip" aria-pressed="' + sel + '" data-key="' + f.key + '" data-o="' + oi + '">' + esc(o[0]) + "</button>";
    }).join("") + "</div>";
    if (f.multi) h += '<p class="small muted" style="margin:8px 0 0">Elegí hasta ' + f.max + ".</p>";
    return h;
  }
  function summary(res) {
    var a = st.ans;
    return '<h2 style="font-size:26px">Tu día, con forma</h2><p class="muted">De ' + fmt(a.wake) + " a " + fmt(a.sleep) + ", repartido en bloques. Va a quedar fijo en tu pantalla de Hoy.</p>" +
      '<div class="grid3"><div class="card stat"><b>' + durText(res.focus) + '</b><span>de foco</span></div><div class="card stat"><b>' + durText(res.habits) + '</b><span>en hábitos</span></div><div class="card stat"><b>' + durText(res.free) + '</b><span>libres</span></div></div>' +
      (res.warnings.length ? '<div class="card sage"><b>Para tener en cuenta</b>' + res.warnings.map(function (w) { return '<p class="small" style="margin:6px 0 0">' + esc(w) + "</p>"; }).join("") + "</div>" : "") +
      res.blocks.map(function (b) {
        var k = KIND[b.kind];
        return '<div class="blk"><div class="tm">' + fmt(b.s) + "<br>" + fmt(b.e) + '</div><div class="bd"><span class="kd"><i style="background:' + k.dot + '"></i>' + k.tag + " · " + durText(b.e - b.s) + "</span><b>" + esc(b.label) + "</b>" + (b.note ? '<span class="nt">' + esc(b.note) + "</span>" : "") + "</div></div>";
      }).join("") + '<p class="small muted">Es una guía de organización. Si tenés dolor o una lesión, consultá a un profesional de la salud antes de entrenar.</p>';
  }
  function skipped(i) { var q = STEPS[i - 1]; return !!(q && q.skip && q.skip(st.ans)); }
  function nSteps() { return st && st.quick ? 2 : STEPS.length; }
  var QDEF = { lunch: 780, dinner: "auto", train: 0, prios: ["health"], habits: [], energy: "any", free: 60, waste: "none", style: "flex", pauses: 0 };
  function withDefaults(a) { var o = JSON.parse(JSON.stringify(a)); Object.keys(QDEF).forEach(function (k) { if (o[k] === undefined) o[k] = JSON.parse(JSON.stringify(QDEF[k])); }); return o; }
  function moveStep(d) { var n = st.step + d; while (n >= 1 && n <= nSteps() && skipped(n)) n += d; return n; }
  function render() {
    if (!host) return;
    var total = nSteps(), body = host.querySelector(".dbody"), foot = host.querySelector(".dfoot"), bar = host.querySelector(".actbar i"), html = "", fh = "";
    if (st.step === 0) {
      html = '<span class="badge">' + (st.quick ? "2 preguntas · 1 minuto" : "12 preguntas · 2 minutos") + '</span><h2 style="font-size:28px;margin-top:8px">Armemos tu día</h2><p class="muted">Contanos cómo es tu día y te lo armamos en bloques con horarios: lo fijo, lo importante, tus hábitos y tus pausas. Después lo ves siempre en Hoy.</p><p class="small muted">Tus respuestas quedan en tu cuenta para que puedas cambiarlas cuando quieras.</p>';
      fh = '<button class="btn block" data-da="start">Empezar</button>'; bar.style.width = "0%";
    } else if (st.step <= total) {
      var s = STEPS[st.step - 1], msg = stepMessage(s), vt = 0, vn = 0; STEPS.forEach(function (q, qi) { if (qi < total && !skipped(qi + 1)) { vt++; if (qi + 1 <= st.step) vn++; } });
      bar.style.width = Math.round((vn - 1) * 100 / vt) + "%";
      html = '<span class="badge">Pregunta ' + vn + " de " + vt + '</span><h2 style="font-size:24px;margin:8px 0 6px" tabindex="-1" id="dq">' + esc(s.title) + '</h2><p class="muted small">' + esc(s.hint) + '</p><div class="stack" style="margin-top:12px">' + visibleFields(s).map(function (f) { return "<div>" + fieldHtml(f) + "</div>"; }).join("") + "</div>" +
        (msg ? '<div class="card sage" role="alert" style="margin-top:12px">' + esc(msg) + "</div>" : "");
      fh = '<div class="row"><button class="btn ghost" data-da="back">Atrás</button><button class="btn" style="flex:1" data-da="next"' + (isReady(s) ? "" : " disabled") + ">" + (moveStep(1) > total ? "Armar mi día" : "Siguiente") + "</button></div>";
    } else {
      bar.style.width = "100%"; html = summary(plan(st.quick ? withDefaults(st.ans) : st.ans));
      fh = '<button class="btn block" data-da="save">Listo, usar este día</button><button class="btn ghost block" data-da="edit" style="margin-top:8px">Cambiar mis respuestas</button>';
    }
    body.innerHTML = html; foot.innerHTML = fh;
    if (host._ls !== st.step) {
      var back = host._ls !== undefined && st.step < host._ls; host._ls = st.step;
      if (body.animate && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) body.animate([{ opacity: 0, transform: "translateX(" + (back ? -28 : 28) + "px)" }, { opacity: 1, transform: "none" }], { duration: 720, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
    }
    if (st.focus) {
      var el = st.focus.sel ? body.querySelector(st.focus.sel) : body.querySelector('[data-key="' + st.focus.key + '"]' + (st.focus.o !== undefined ? '[data-o="' + st.focus.o + '"]' : ""));
      if (el) el.focus(); st.focus = null;
    } else { body.scrollTop = 0; }
  }
  // Hora exacta (cualquier minuto) para las preguntas de horarios
  function exactHtml(f, val) {
    if (!f.ex) return "";
    var v = typeof val === "number" && val >= 0 ? fmt(val) : "", err = st.exErr && st.exErr[f.key];
    return '<label class="field exact"><span class="small muted">¿Otra hora? Escribila exacta (opcional)</span><input type="time" data-key="' + f.key + '" data-exact="1" value="' + v + '"></label>' + (err ? '<p class="small" style="color:var(--naranja,#FF8A4C);margin:4px 0 0">' + esc(err) + "</p>" : "");
  }
  function exactSet(f, raw) {
    var mm = /^(\d\d):(\d\d)$/.exec(raw || ""); st.exErr = st.exErr || {}; delete st.exErr[f.key]; if (!mm) return;
    var m = +mm[1] * 60 + +mm[2], lo = f.ex[0], hi = f.ex[1], c = null;
    [m, m + 1440].forEach(function (x) { if (c === null && x >= lo && x <= hi) c = x; });
    if (c === null) { st.exErr[f.key] = "Elegí una hora entre " + fmt(lo) + " y " + fmt(hi) + "."; return; }
    var val = f.ex[2] ? c % 1440 : c, has = f.opts.some(function (o) { return o[1] === val; });
    if (!has) { var at = f.opts.length; for (var i = 0; i < f.opts.length; i++) { var ov = f.opts[i][1]; if (typeof ov === "number" && ov >= 0 && ov > val && ((f.ex[2] ? ov % 1440 : ov) > val)) { at = i; break; } } f.opts.splice(at, 0, [fmt(val), val]); }
    st.ans[f.key] = val;
  }
  function fieldOf(key) { var fs = STEPS[st.step - 1].fields; for (var i = 0; i < fs.length; i++) if (fs[i].key === key) return fs[i]; return null; }
  function refreshNext() { var b = host.querySelector('[data-da="next"]'); if (b) b.disabled = !isReady(STEPS[st.step - 1]); }

  function onInput(ev) {
    var el = ev.target;
    if (el.hasAttribute("data-blk") && el.getAttribute("data-prop") === "name") st.ans.fixed[+el.getAttribute("data-blk")].name = el.value;
    else if (el.hasAttribute("data-custom")) {
      var raw = el.value.trim(), key = el.getAttribute("data-key");
      st.ans[key] = raw === "" || isNaN(Number(raw)) ? undefined : Math.min(300, Math.max(0, Math.round(Number(raw))));
      refreshNext();
    }
  }
  function onChange(ev) {
    var el = ev.target;
    if (el.hasAttribute("data-blkx")) {
      var xi = +el.getAttribute("data-blkx"), xp = el.getAttribute("data-prop"), xm = /^(\d\d):(\d\d)$/.exec(el.value || "");
      st.exErr = st.exErr || {}; delete st.exErr["blk" + xi];
      if (xm) st.ans.fixed[xi][xp] = +xm[1] * 60 + +xm[2];
      st.focus = { sel: 'input[data-blkx="' + xi + '"][data-prop="' + xp + '"]' }; render(); return;
    }
    if (el.hasAttribute("data-exact")) { var xf = fieldOf(el.getAttribute("data-key")); if (xf) { exactSet(xf, el.value); st.focus = { key: xf.key }; render(); } return; }
    if (el.tagName !== "SELECT") return;
    if (el.hasAttribute("data-blk")) {
      var bi = +el.getAttribute("data-blk"), prop = el.getAttribute("data-prop");
      st.ans.fixed[bi][prop] = +el.value; st.focus = { sel: 'select[data-blk="' + bi + '"][data-prop="' + prop + '"]' }; return render();
    }
    if (el.getAttribute("data-kind") === "minutes") {
      var mk = el.getAttribute("data-key");
      if (el.value === String(MIN_OPTS.length)) { st.ans[mk + "Mode"] = "custom"; st.ans[mk] = undefined; } else { st.ans[mk + "Mode"] = "preset"; st.ans[mk] = MIN_OPTS[+el.value][1]; }
      st.focus = { sel: 'select[data-key="' + mk + '"]' }; return render();
    }
    var f = fieldOf(el.getAttribute("data-key"));
    if (!f || el.value === "") return;
    if (st.exErr) delete st.exErr[f.key]; st.ans[f.key] = f.opts[+el.value][1]; st.focus = { key: f.key }; render();
  }
  function onClick(ev) {
    var el = ev.target.closest("button"); if (!el || el.disabled) return;
    var act = el.getAttribute("data-da");
    if (act === "exit") { if (confirm("¿Salir? Si salís ahora no se guarda tu día. Podés armarlo después desde Hoy.")) { host.remove(); host = null; if (st.opts.onExit) st.opts.onExit(); } return; }
    if (act === "start") st.step = 1;
    else if (act === "next") st.step = moveStep(1);
    else if (act === "back") st.step = Math.max(moveStep(-1), 0);
    else if (act === "edit") st.step = 1;
    else if (act === "save") { var a = st.quick ? withDefaults(st.ans) : st.ans; if (st.quick) a.quick = true; else delete a.quick; var cb = st.opts.onSave; host.remove(); host = null; if (cb) cb(JSON.parse(JSON.stringify(a))); return; }
    else if (act === "addblk") { st.ans.fixed.push(newBlock()); st.focus = { sel: 'select[data-blk="' + (st.ans.fixed.length - 1) + '"][data-prop="s"]' }; return render(); }
    else if (act === "rmblk") { st.ans.fixed.splice(+el.getAttribute("data-i"), 1); return render(); }
    else if (el.hasAttribute("data-blk") && el.getAttribute("data-prop") === "travel") {
      var tb = +el.getAttribute("data-blk"); st.ans.fixed[tb].travel = el.getAttribute("data-val");
      st.focus = { sel: 'button[data-blk="' + tb + '"][data-prop="travel"][data-val="' + el.getAttribute("data-val") + '"]' }; return render();
    } else if (el.hasAttribute("data-o")) {
      var f = fieldOf(el.getAttribute("data-key")), o = f.opts[+el.getAttribute("data-o")];
      if (f.multi) { var cur = (st.ans[f.key] || []).slice(), i = cur.indexOf(o[1]); if (i >= 0) cur.splice(i, 1); else if (cur.length < f.max) cur.push(o[1]); st.ans[f.key] = cur; }
      else st.ans[f.key] = o[1];
      st.focus = { key: f.key, o: +el.getAttribute("data-o") }; return render();
    } else return;
    render();
  }
  function open(opts) {
    opts = opts || {};
    var old = document.getElementById("full"); if (old) old.remove();
    st = { step: 0, ans: initial().ans, focus: null, opts: opts, quick: !!opts.quick };
    if (opts.ans) { st.ans = JSON.parse(JSON.stringify(opts.ans)); st.step = 1; st.quick = false; }
    host = document.createElement("div"); host.className = "full"; host.id = "full";
    host.innerHTML = '<header><button class="btn ghost sm" data-da="exit">Salir</button><b>'+String(opts.title||"Armá tu día").replace(/</g,"")+'</b></header><div class="actbar"><i style="width:0%"></i></div><div class="dbody"></div><div class="dfoot"></div>';
    document.body.appendChild(host);
    host.addEventListener("click", function (e) { e.stopPropagation(); onClick(e); });
    host.addEventListener("input", function (e) { e.stopPropagation(); onInput(e); });
    host.addEventListener("change", function (e) { e.stopPropagation(); onChange(e); });
    render();
  }
  window.FormaDia = { open: open, plan: plan, KIND: KIND, fmt: fmt, durText: durText };
})();
