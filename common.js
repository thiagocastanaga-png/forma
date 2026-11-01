(function () {
  var CFG = window.FORMA || {};

  // ---- Origen (Instagram u otro): se guarda la primera visita con utm_source ----
  var origin = "directo";
  try {
    var qs = new URLSearchParams(location.search);
    var src = qs.get("utm_source");
    if (src) sessionStorage.setItem("forma_origen", src);
    origin = sessionStorage.getItem("forma_origen") || "directo";
  } catch (e) {
    origin = "directo";
  }

  // ---- Palabra "forma" que cambia de forma y de letra ----
  var variants = [
    { font: "Montserrat, sans-serif", weight: 800, italic: false, upper: false, rot: 0, dy: 0 },
    { font: "'Playfair Display', serif", weight: 900, italic: true, upper: false, rot: -4, dy: -0.02 },
    { font: "'Space Mono', monospace", weight: 700, italic: false, upper: true, rot: 3, dy: 0.02 },
    { font: "'Bebas Neue', sans-serif", weight: 400, italic: false, upper: true, rot: 0, dy: -0.03 },
    { font: "Pacifico, cursive", weight: 400, italic: false, upper: false, rot: -6, dy: 0.01 },
    { font: "'Archivo Black', sans-serif", weight: 400, italic: false, upper: false, rot: 5, dy: 0 }
  ];
  var base = ["f", "o", "r", "m", "a"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#86A892";

  document.querySelectorAll("[data-morph]").forEach(function (el) {
    var theme = getComputedStyle(el).getPropertyValue("--accent").trim() || accent;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", "forma");
    var spans = base.map(function (ch) {
      var s = document.createElement("span");
      s.className = "l";
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch;
      el.appendChild(s);
      return s;
    });
    var d = document.createElement("span");
    d.className = "dot";
    d.setAttribute("aria-hidden", "true");
    el.appendChild(d);

    function paint(tick) {
      var n = variants.length;
      var phase = tick % (n + 2);
      var settled = reduce || phase >= n;
      spans.forEach(function (s, i) {
        var v = settled ? variants[0] : variants[(phase + i * 2) % n];
        var hi = !settled && (phase + i) % 3 === 0;
        s.textContent = v.upper ? base[i].toUpperCase() : base[i];
        s.style.fontFamily = v.font;
        s.style.fontWeight = v.weight;
        s.style.fontStyle = v.italic ? "italic" : "normal";
        s.style.letterSpacing = "-0.02em";
        s.style.color = hi ? theme : "";
        s.style.transform = "translateY(" + v.dy + "em) rotate(" + v.rot + "deg)";
      });
    }
    var tick = 6;
    paint(tick);
    if (!reduce) {
      setInterval(function () { tick++; paint(tick); }, 1100);
    }
  });

  // ---- Links configurables (pagos, instagram) ----
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var key = a.getAttribute("data-link");
    var url = CFG[key];
    if (url) {
      a.setAttribute("href", url);
      if (/^https?:/.test(url)) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
    } else {
      a.classList.add("is-off");
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("href", "#");
      a.addEventListener("click", function (ev) { ev.preventDefault(); });
    }
  });
  document.querySelectorAll("[data-show-if-empty]").forEach(function (el) {
    if (CFG[el.getAttribute("data-show-if-empty")]) el.hidden = true;
  });

  // ---- Formularios de lista de espera ----
  document.querySelectorAll("form[data-waitlist]").forEach(function (form) {
    var msg = form.querySelector(".form-msg");
    var o = form.querySelector('input[name="origen"]');
    if (o) o.value = origin;
    var p = form.querySelector('input[name="pagina"]');
    if (p) p.value = location.pathname;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.querySelector('input[name="web"]').value) return; // trampa para bots
      if (!CFG.formEndpoint) {
        msg.textContent = "El formulario todavía no está conectado. Mientras tanto, escribinos por Instagram @formargentina.";
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== "web") data[k] = v; });
      msg.textContent = "Enviando...";
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) { msg.textContent = "Listo, te anotamos. Gracias."; form.reset(); if (o) o.value = origin; if (p) p.value = location.pathname; }
        else { msg.textContent = "No pudimos enviarlo. Probá de nuevo en un rato."; }
      }).catch(function () { msg.textContent = "No pudimos enviarlo. Revisá tu conexión y probá de nuevo."; });
    });
  });
})();
