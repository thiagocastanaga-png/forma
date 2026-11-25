/* Forma · programas de 14 días. Cada paso se hace DENTRO de la app y solo cuenta si se completa.
   Campos (f): text{l,min,ph} · list{l,n,ph} · choice{l,o,need} · time{l} · num{l,u,min,max} · timer{s,l} · check{o} · act{a,l}
   when: "am" (hasta las 14) / "pm" (desde las 18). log: registro diario de cada programa. */
(function () {
  function T(l, min, ph) { return { k: "text", l: l, min: min || 8, ph: ph || "" }; }
  function LS(l, n, ph) { return { k: "list", l: l, n: n, ph: ph || "" }; }
  function CH(l, o, need) { return { k: "choice", l: l, o: o, need: need || null }; }
  function TM(l) { return { k: "time", l: l }; }
  function NU(l, u, min, max) { return { k: "num", l: l, u: u || "", min: min, max: max }; }
  function TR(s, l) { return { k: "timer", s: s, l: l }; }
  function CK(o) { return { k: "check", o: o }; }
  function AC(a, l) { return { k: "act", a: a, l: l }; }
  function TL(a, l, need, d) { return { k: "tool", a: a, l: l, need: need !== false, d: d || "" }; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function mins(hm) { var p = String(hm || "0:0").split(":"); return (+p[0]) * 60 + (+p[1]); }
  function hm(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + " h " + pad(m % 60) + " min"; }
  function range(list) { if (list.length < 2) return 0; var a = Math.min.apply(null, list), b = Math.max.apply(null, list); return b - a; }

  // Programas de deporte: una carrera por deporte (mismo esqueleto de 14 pasos, contenido propio)
  function sportProg(c) {
    return {
      id: c.id, n: c.n, tag: "Deporte", reminder: c.reminder || "17:00",
      intro: c.intro,
      q: "¿Qué tan bien sentís que rendís como " + c.rol + "?", lo: "Muy mal", hi: "Muy bien", better: "up",
      note: "Forma es una guía de organización y hábitos para deportistas. No reemplaza a tu entrenador, preparador físico, médico ni nutricionista. Si algo duele (no cansancio), pará y consultá.",
      log: [NU("Minutos de práctica o entrenamiento de hoy (0 si hoy descansás)", "min", 0, 600)], logKeys: ["min"],
      ml: "Práctica por día", up: true,
      metric: function (v) { return +v.min; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        // Nivel 1 · Punto de partida
        { t: "Tu punto de partida", a: c.d0a, w: "Para mejorar hay que saber desde dónde arrancás. En 14 pasos vas a comparar contra esto.", f: [T(c.d0l, 8, c.d0p), CH("Mi nivel hoy", c.niv)].concat(c.d0x ? [c.d0x] : []) },
        { t: "Tus tests físicos", a: "Abrí Tests físicos y hacé al menos un test de tu deporte (" + c.tests + "). Anotá el resultado: es tu línea de base. Antes, 5 minutos de entrada en calor.", w: "Lo que no se mide no se mejora. Vas a repetir los mismos tests en 4 a 6 semanas y ver cuánto cambiaste.", f: [TL("tests", "Tests físicos", true, "Cargá al menos un resultado de hoy.")] },
        { t: "Tu meta y tu foco", a: "Escribí una meta de resultado (" + c.metaEj + ") y una meta de proceso, que dependa solo de vos (por ejemplo: «fuerza 2 veces por semana» o «llegar 30 minutos antes a cada partido»). Después elegí UNA cosa de tu juego para trabajar 2 semanas. " + c.foco, w: "El resultado no lo controlás del todo; el proceso, sí. Los deportistas que mejoran combinan las dos y trabajan una cosa a la vez.", f: [T("Mi meta de resultado", 8, c.metaPh), T("Mi meta de proceso", 8, "Todas las semanas voy a…"), T("La única cosa que trabajo estas 2 semanas", 6, "Voy a mejorar…")] },
        // Nivel 2 · Primer cambio
        { t: "Activación de verdad", a: "Antes de entrenar o jugar, hacé la activación guiada de " + c.dep + ": " + c.actDesc + " Estirar quieto en frío no prepara el cuerpo; moverse progresivamente, sí.", w: "Una buena entrada en calor sube la temperatura del músculo, mejora la velocidad de reacción y baja el riesgo de lesión.", f: [AC(c.act, "Activación guiada de " + c.dep)] },
        { t: "Práctica con intención", a: "Abrí Desafíos de práctica, elegí uno que tenga que ver con lo que estás mejorando y anotá tu puntaje. " + c.prac, w: "Practicar con un objetivo medible rinde mucho más que repetir sin pensar: ves tu récord y sabés si mejoraste.", f: [TL("desafios", "Desafíos de práctica", true, "Anotá al menos un puntaje de hoy.")] },
        { t: "Fuerza que te protege", a: "Hacé la rutina «" + c.fuerzaN + "» en Mi rutina de entrenamiento, serie por serie. Si es tu primera vez, usá poco peso o solo el del cuerpo y aprendé bien cada movimiento (tocá cada ejercicio para ver cómo se hace).", w: "La fuerza " + c.fuerzaW + " Dos sesiones por semana de 30 a 40 minutos alcanzan para notarlo en 6 semanas.", f: [TL("entreno", "Mi rutina de entrenamiento", true, "Guardá la sesión al terminar.")] },
        // Nivel 3 · Hacerlo costumbre
        { t: "Tu semana de entrenamiento", a: "Armá tu semana tipo: " + c.semana + " Dejá al menos un día de descanso completo y no hagas fuerza pesada el día antes de un partido.", w: "El rendimiento sube cuando la carga está planificada: entrenar fuerte, recuperar y volver a entrenar. Sin descanso, el cuerpo no se adapta.", f: [T("Mi semana tipo", 12, c.semanaPh), CH("Días de descanso completo por semana", ["Ninguno", "1", "2"])] },
        { t: c.prevT, a: c.prevA, w: c.prevW, f: [TL("entreno", "Mi rutina de entrenamiento", true, "Hacé la rutina «" + c.prevN + "» y guardá la sesión.")] },
        { t: c.mentT, a: c.mentA, w: c.mentW, f: [LS(c.mentL, 4, c.mentPh), T("Mi frase de reseteo después de un error", 4, c.frasePh)] },
        // Nivel 4 · Subir un escalón
        { t: c.cardT, a: c.cardA, w: c.cardW, f: c.cardF },
        { t: "Tu plan de partido", a: "Abrí Plan de partido y armalo para tu próximo partido: " + c.planA, w: "Llegar con un plan simple te da algo concreto en qué pensar cuando suben los nervios, y te deja aprender de cada partido.", f: [TL("partido", "Plan de partido", true, "Guardá un plan hoy.")] },
        { t: "Visualizá el partido", a: "Hacé la visualización guiada: 5 minutos imaginando con detalle tu entrada en calor, tus primeros minutos y cómo respondés cuando algo sale mal.", w: "Ensayar en la cabeza activa los mismos circuitos que la acción real y llega con más confianza al momento difícil.", f: [AC("visualiza", "Visualización guiada")] },
        // Nivel 5 · Tu nueva rutina
        { t: "Después del partido", a: "Cargá en el Diario de partidos tu último partido o, si no jugaste, tu último entrenamiento con partido. Lo importante: qué funcionó, qué no y qué entrenás esta semana por eso.", w: "Revisar cada partido con preguntas fijas convierte las derrotas en información y las victorias en algo que podés repetir.", f: [TL("partidos", "Diario de partidos", true, "Guardá al menos un partido.")] },
        { t: "Recuperación y tu plan", a: "Repasá cómo te recuperás y elegí tus 3 claves para la temporada. Si pasaron 4 semanas o más desde tus tests, repetilos hoy en Tests físicos y compará.", w: "Se mejora cuando el cuerpo se recupera, no solo cuando entrena. Dormir 8 a 10 horas, hidratarte y comer después de entrenar es parte del entrenamiento.", f: [CK(["Duermo 8 horas o más la mayoría de los días", "Tomo agua durante el entrenamiento y orino claro", "Como algo con proteínas e hidratos después de entrenar", "Tengo al menos un día de descanso por semana"]), LS("Mis 3 claves para la temporada", 3, "Una clave"), TL("tests", "Repetir tus tests (cuando pasen 4 a 6 semanas)", false)] }
      ]
    };
  }

  var L = [
    {
      id: "dormir", n: "Dormir mejor", tag: "Sueño", reminder: "21:00",
      intro: "Subí de nivel para ordenar tu sueño. Cargás tus horarios, hacés un paso por día y al final ves tus datos reales: cuánto dormís y qué tan regular sos.",
      q: "¿Cómo dormiste esta última semana?", lo: "Muy mal", hi: "Muy bien", better: "up",
      note: "Si hace más de tres meses que dormís mal, roncás fuerte con pausas al respirar o estás muy cansado durante el día, consultá con un médico. Esto es un apoyo de hábitos y no reemplaza a un profesional.",
      log: [TM("¿A qué hora te acostaste anoche?"), TM("¿A qué hora te despertaste hoy?")], logKeys: ["bed", "wake"],
      ml: "Horas de sueño", up: true,
      metric: function (v) { var d = mins(v.wake) - mins(v.bed); if (d <= 0) d += 1440; return d / 60; }, fmt: hm,
      extra: function (it) {
        var b = Object.keys(it.lg || {}).sort().map(function (d) { var m = mins(it.lg[d].bed); return m < 720 ? m + 1440 : m; });
        if (b.length < 4) return []; var h = Math.floor(b.length / 2), r1 = range(b.slice(0, h)), r2 = range(b.slice(h));
        return ["Variación de tu hora de acostarte: " + hm(r1 / 60) + " → " + hm(r2 / 60)];
      },
      days: [
        { t: "Mirá cómo estás", a: "Cargá tus horarios reales de anoche. Todavía no cambies nada: primero hay que ver tu patrón.", w: "Para ordenar el sueño primero hay que ver cómo es hoy.", f: [TL("sueno", "Registro de sueño", false)] },
        { t: "Una hora fija para levantarte", a: "Elegí una hora de levantarte que puedas sostener todos los días, también el finde (con una hora de diferencia como máximo).", w: "La hora fija de despertar es lo que más ordena tu reloj interno.", f: [TM("Mi hora fija de levantarme")] },
        { t: "Luz de mañana", a: "Salí afuera o pegate a una ventana abierta durante 10 minutos, dentro de la primera hora del día.", w: "La luz de la mañana le marca al cuerpo cuándo empieza el día.", when: "am", f: [TR(600, "10 minutos de luz natural"), CK(["Estuve afuera o junto a una ventana abierta"])] },
        { t: "Hora de corte para la cafeína", a: "Elegí hasta qué hora tomás café, mate o energizantes. Regla simple: nada en las 8 horas antes de acostarte.", w: "La cafeína tarda muchas horas en irse del cuerpo, aunque te duermas igual.", f: [TM("Mi hora de corte"), CH("¿Cuántos tomaste hoy?", ["0", "1", "2", "3", "4 o más"])] },
        { t: "Cena liviana y temprana", a: "Cenà por lo menos 2 horas antes de acostarte, sin comidas muy pesadas ni alcohol.", w: "Digerir mucho y el alcohol fragmentan el sueño.", when: "pm", f: [TM("¿A qué hora cenaste?"), CH("¿Qué tan pesada fue?", ["Liviana", "Normal", "Muy pesada"]), CH("¿Tomaste alcohol?", ["No", "Sí"])] },
        { t: "Un cuarto para dormir", a: "Oscuro, fresco y silencioso. Hacé estos cambios hoy y marcá cada uno cuando esté hecho.", w: "Con poca luz y fresco te dormís más fácil y te despertás menos.", f: [CK(["Tapé o apagué las luces chicas", "Dejé el cuarto fresco y ventilado", "El celular carga lejos de la cama", "Sin tele en el cuarto"])] },
        { t: "45 minutos sin pantallas", a: "Dejá el celular lejos y la tele apagada durante 45 minutos antes de acostarte. Hacé algo tranquilo.", w: "La luz y el contenido te mantienen activo y atrasan el sueño.", when: "pm", f: [TR(2700, "45 minutos sin pantallas"), CH("¿Qué hiciste?", ["Leí", "Me bañé", "Estiré", "Hablé con alguien", "Otra cosa"])] },
        { t: "Descarga mental", a: "Escribí lo que te da vueltas y una cosa para mañana. Después cerrás la app y listo.", w: "Dejar lo pendiente escrito baja la cabeza que no para.", when: "pm", f: [LS("Lo que me da vueltas", 3, "Algo que me preocupa o tengo pendiente"), T("Una sola cosa para mañana", 5, "Mañana voy a…")] },
        { t: "Tu rutina de bajada", a: "Hacé la rutina guiada para bajar el ritmo. Repetila siempre a la misma hora.", w: "Repetir la misma secuencia le avisa al cuerpo que se acerca el sueño.", when: "pm", f: [AC("dormir", "Rutina guiada para dormir")] },
        { t: "Respirar para soltar", a: "Hacé la respiración guiada para calmar, ya con la luz baja.", w: "Soltar el aire más largo baja la activación del cuerpo.", when: "pm", f: [AC("calma", "Respiración para calmar")] },
        { t: "Plan para cuando no te dormís", a: "Escribí tu plan por si pasan 20 minutos y seguís despierto: a qué otro cuarto vas y qué hacés ahí hasta que te dé sueño (algo aburrido, luz tenue, sin celular).", w: "Tener el plan escrito evita dar vueltas en la cama.", f: [T("Mi plan", 20, "Me levanto y voy a… y hago…")] },
        { t: "Siesta con límite", a: "Si dormís siesta, que sea de menos de 30 minutos y antes de las 16.", w: "Una siesta larga o tarde le saca sueño a la noche.", f: [CH("¿Dormiste siesta hoy?", ["No", "Menos de 30 min y antes de las 16", "Más larga o más tarde"])] },
        { t: "Moverte de día", a: "Movete 20 minutos hoy, mejor antes del atardecer. Evitá el entrenamiento fuerte justo antes de dormir.", w: "Moverse de día mejora el sueño profundo.", f: [TR(1200, "20 minutos de movimiento"), CH("¿Qué hiciste?", ["Caminé", "Bici", "Entrené", "Bailé", "Otra cosa"])] },
        { t: "Tu propia rutina", a: "Elegí los 3 pasos que más te sirvieron. Esa es tu rutina para seguir.", w: "Lo que dura es lo que elegís vos, no la lista completa.", f: [LS("Mis 3 pasos para mantener", 3, "Un paso que me sirvió")] }
      ]
    },
    {
      id: "celular", n: "Usar menos el celular", tag: "Atención", reminder: "09:00",
      intro: "Subí de nivel para usar el celular vos y que no te use a vos. Cargás tu tiempo de pantalla cada día y al final ves cuánto lo bajaste.",
      q: "¿Cuánto control sentís que tenés sobre tu celular?", lo: "Nada", hi: "Mucho", better: "up",
      note: "Es un apoyo de hábitos. Si sentís que no podés controlar el uso aunque lo intentes y te afecta mucho, consultá con un profesional.",
      log: [NU("Minutos de pantalla de ayer (mirá Tiempo de uso o Bienestar digital)", "min", 0, 1000)], logKeys: ["scr"],
      ml: "Pantalla por día", up: false,
      metric: function (v) { return +v.scr; }, fmt: function (m) { return hm(m / 60); },
      days: [
        { t: "Medí sin cambiar nada", a: "Cargá tu tiempo de pantalla de ayer y anotá tus 3 apps más usadas.", w: "Lo que no se mide, se subestima.", f: [LS("Mis 3 apps más usadas", 3, "Nombre de la app"), TL("pantalla", "Registro de celular", false)] },
        { t: "¿Para qué lo usás?", a: "Mirá esas 3 apps y pensá cuáles te suman y cuáles son solo para pasar el rato.", w: "Saber qué querés sostener y qué querés soltar hace todo más fácil.", f: [T("¿Cuáles querés usar menos y por qué?", 15, "Quiero usar menos… porque…")] },
        { t: "Menos notificaciones", a: "Apagá las de redes y juegos. Dejá solo mensajes de personas, banco y calendario.", w: "Cada aviso te corta lo que estabas haciendo.", f: [NU("¿Cuántas apps tenías con notificaciones?", "apps", 0, 300), CK(["Apagué las notificaciones de redes y juegos", "Dejé solo las importantes"])] },
        { t: "Primera media hora libre", a: "Al despertar, no mires redes ni mails por 30 minutos. Primero agua y luz.", w: "Empezar el día reaccionando al celular te deja con la cabeza de otros.", f: [CH("¿Cuánto esperaste hoy para mirarlo?", ["Menos de 15 min", "15 a 30 min", "30 a 60 min", "Más de 1 hora"], [2, 3])] },
        { t: "Cargador fuera de la cama", a: "Cargá el celular lejos de la cama y usá un despertador común.", w: "Es de lo que más ayuda a dormir mejor y a no scrollear de noche.", f: [CK(["Cargué el celular lejos de la cama", "Usé un despertador común o lo dejé lejos"])] },
        { t: "Pantalla de inicio limpia", a: "Sacá redes y juegos de la primera pantalla y dejalos en una carpeta al fondo.", w: "Un poco de fricción alcanza para que no abras la app sin pensar.", f: [CK(["Saqué redes y juegos de la primera pantalla", "Los guardé en una carpeta al fondo"])] },
        { t: "Un límite realista", a: "Poné un límite diario a tu app más usada: 30% menos que tu promedio.", w: "Un límite alcanzable se sostiene; uno exagerado se abandona.", f: [T("¿Para qué app?", 2, "Nombre de la app"), NU("Límite diario que puse", "min", 5, 600)] },
        { t: "Una comida sin celular", a: "Comé al menos una comida sin el celular a la vista.", w: "Recupera tiempo de atención con los que tenés al lado.", f: [CH("¿Cómo te fue?", ["Toda la comida sin celular", "Una parte", "No pude"], [0, 1])] },
        { t: "Tus dos momentos", a: "Elegí dos momentos del día para las redes. Fuera de eso, solo lo necesario.", w: "Decidir cuándo, en lugar de abrir cada vez que podés.", f: [TM("Primer momento"), TM("Segundo momento")] },
        { t: "Cuando te dan ganas", a: "Cuando sientas ganas de agarrarlo sin motivo, respirá y preguntate qué necesitás. Hacé la respiración guiada y escribí tu respuesta.", w: "Entre las ganas y el gesto hay un espacio: lo estás entrenando.", f: [AC("respirar", "Respiración de un minuto"), T("¿Qué necesitaba en realidad?", 8, "Necesitaba…")] },
        { t: "Pantalla en blanco y negro", a: "Poné hoy la pantalla en escala de grises (en Accesibilidad).", w: "Sin colores, las apps resultan menos atractivas.", f: [CK(["Activé la escala de grises hoy"]), CH("¿Cómo se sintió?", ["Más aburrido", "Casi igual", "Me ayudó a soltarlo"])] },
        { t: "Un reemplazo", a: "Elegí tres cosas para hacer en los momentos de aburrimiento, en lugar de abrir el celular.", w: "Si solo sacás el hábito, queda un hueco. Hay que ponerle algo.", f: [LS("Cosas que puedo hacer", 3, "Por ejemplo: leer 5 páginas")] },
        { t: "Una hora sin celular", a: "Hacé algo que te guste durante una hora entera con el celular en otra habitación.", w: "Te muestra lo que se siente tener la atención entera.", f: [TR(3600, "1 hora sin celular"), T("¿Qué hiciste?", 4, "Hice…")] },
        { t: "Tus reglas", a: "Elegí 3 reglas que vas a mantener.", w: "Lo que elegís vos se mantiene.", f: [LS("Mis 3 reglas", 3, "Una regla")] }
      ]
    },
    {
      id: "calma", n: "Bajar la ansiedad", tag: "Calma", reminder: "20:00",
      intro: "Subí de nivel con herramientas simples para bajar la tensión de todos los días. Registrás cómo estás y armás tu propio kit.",
      q: "¿Cuánta tensión o ansiedad sentiste esta semana?", lo: "Poca", hi: "Mucha", better: "down",
      note: "Es un apoyo de bienestar y no reemplaza a un profesional de la salud mental. Si la ansiedad te impide hacer tu vida o sentís que no podés más, hablá con un profesional. Si estás en crisis, llamá gratis las 24 horas a la Línea Nacional de Salud Mental: 0800-999-0091. Si hay riesgo inmediato, llamá al 911.",
      log: [CH("¿Cuánta tensión sentiste hoy?", ["1 · Poca", "2", "3", "4", "5 · Mucha"])], logKeys: ["ten"],
      ml: "Tensión", up: false,
      metric: function (v) { return +v.ten + 1; }, fmt: function (m) { return (Math.round(m * 10) / 10) + " de 5"; },
      days: [
        { t: "Ponele nombre", a: "Anotá qué sentís y dónde lo notás en el cuerpo. Sin juzgarlo.", w: "Nombrar lo que pasa le baja intensidad.", f: [T("¿Qué siento?", 8, "Siento…"), CH("¿Dónde lo noto?", ["Pecho", "Panza", "Cuello y hombros", "Mandíbula", "Cabeza", "En ningún lado"]), TL("animo", "Registro de ánimo", false)] },
        { t: "Un minuto de respiración", a: "Hacé la respiración guiada de un minuto, lenta y cómoda.", w: "Es la herramienta más rápida que tenés a mano.", f: [AC("respirar", "Respiración de un minuto")] },
        { t: "Soltar el cuerpo", a: "Apretá fuerte los puños 5 segundos y soltá. Repetí con hombros, mandíbula y panza.", w: "Tensar y soltar enseña al cuerpo cómo se siente soltar.", f: [TR(120, "2 minutos de tensar y soltar"), CH("¿Cómo quedó tu cuerpo?", ["Más suelto", "Igual", "Más tenso"])] },
        { t: "5-4-3-2-1", a: "Nombrá 5 cosas que ves. Después 4 que tocás, 3 que escuchás, 2 que olés y 1 que saboreás. Anotá las 5 que ves.", w: "Te trae al presente cuando la cabeza se va adelante.", f: [LS("5 cosas que veo", 5, "Algo que veo")] },
        { t: "Escribí la preocupación", a: "Escribila y preguntate: ¿puedo hacer algo hoy? Si sí, anotá el primer paso. Si no, escribí «lo suelto».", w: "Separar lo que se puede hacer de lo que no baja la rumiación.", f: [T("Lo que me preocupa", 10, "Me preocupa…"), CH("¿Puedo hacer algo hoy?", ["Sí", "No"]), T("Mi primer paso, o «lo suelto»", 5, "")] },
        { t: "Caminar 10 minutos", a: "Caminá 10 minutos sin celular, mirando alrededor.", w: "Moverte baja la tensión acumulada.", f: [TR(600, "10 minutos caminando"), CH("¿Cómo te sentís?", ["Mejor", "Igual", "Peor"])] },
        { t: "Respiración larga", a: "Hacé la respiración guiada para calmar, de unos 3 minutos.", w: "Exhalar largo activa la parte del cuerpo que descansa.", f: [AC("calma", "Respiración para calmar")] },
        { t: "Mirá tu cafeína", a: "Fijate cuánta cafeína tomás hoy. Si estás tenso, probá con la mitad.", w: "Para algunas personas la cafeína sube la ansiedad.", f: [NU("Cafés, mates o energizantes que tomé hoy", "", 0, 20)] },
        { t: "Hablar con alguien", a: "Contale a una persona de confianza cómo te sentís, aunque sea en dos frases.", w: "Compartir descomprime.", f: [CH("¿Con quién hablaste?", ["Familia", "Pareja", "Un amigo o amiga", "Un profesional", "No pude hoy"], [0, 1, 2, 3])] },
        { t: "Un límite chico", a: "Decí que no a una cosa chica hoy o pedí un tiempo.", w: "Los límites chicos protegen tu energía.", f: [T("¿A qué le dije que no, o qué tiempo pedí?", 8, "Dije que no a…")] },
        { t: "Qué sí controlo", a: "Escribí 3 cosas de hoy que dependen de vos y una que no. Concentrate en las 3.", w: "Poner la energía donde se puede cambiar algo.", f: [LS("Dependen de mí", 3, "Algo que depende de mí"), T("Una que no depende de mí", 4, "No depende de mí…")] },
        { t: "Mirá tus pensamientos", a: "Abrí el Registro de pensamientos y anotá una situación de hoy que te puso tenso: qué pensaste, cuánto te afectó, qué pruebas hay a favor y en contra, y una forma más equilibrada de verlo.", w: "Muchas veces no nos tensa lo que pasa sino lo que nos decimos sobre eso. Ponerlo por escrito y revisarlo baja la intensidad y entrena una forma de pensar más justa con vos.", f: [TL("pensar", "Registro de pensamientos", true, "Guardá un registro de hoy.")] },
        { t: "Cerrar el día en calma", a: "Antes de dormir, 10 minutos sin pantallas. Hacé el cierre guiado.", w: "Un cierre tranquilo cambia cómo arrancás mañana.", when: "pm", f: [AC("cierre", "Cierre del día guiado")] },
        { t: "Tu kit", a: "Elegí tus 3 herramientas favoritas. Ese es tu kit para cuando llegue la tensión.", w: "Tener un plan a mano hace que cuesten menos los días difíciles.", f: [LS("Mi kit", 3, "Una herramienta que me sirvió")] }
      ]
    },
    {
      id: "estudio", n: "Estudiar y rendir mejor", tag: "Estudio", reminder: "17:00",
      intro: "Subí de nivel para estudiar mejor y rendir más. Aprendés técnicas que funcionan de verdad, las practicás dentro de la app y registrás cuánto estudiás de forma efectiva.",
      q: "¿Qué tan seguro te sentís con lo que estudiás?", lo: "Nada seguro", hi: "Muy seguro", better: "up",
      note: "Esto es un apoyo de hábitos de estudio. Si la ansiedad antes de rendir te afecta mucho, hablalo con un profesional o con tu institución.",
      log: [NU("Minutos de estudio efectivo hoy (sin celular)", "min", 0, 900)], logKeys: ["est"],
      ml: "Estudio por día", up: true,
      metric: function (v) { return +v.est; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        { t: "Mirá qué tenés por delante", a: "Anotá hasta 3 materias o exámenes que tenés que preparar. Todavía no cambies nada: primero ordenamos.", w: "Sin ver el panorama completo, se estudia lo que menos cuesta y no lo que más importa.", f: [LS("Materias o exámenes por delante", 3, "Materia o examen")] },
        { t: "Fechas a la vista", a: "Escribí la fecha de cada examen o entrega. Después elegí cuál es el primero.", w: "Una fecha clara convierte \u00abtengo que estudiar\u00bb en un plan.", f: [LS("Examen o entrega y su fecha", 3, "Materia, día/mes"), T("¿Cuál es el primero y qué tema es lo más urgente?", 8, "Lo primero es…"), TL("examen", "Plan de examen: te reparte los temas por día", false)] },
        { t: "Un lugar y una hora", a: "Elegí un horario fijo y un lugar donde estudiar. Dejá el celular fuera de tu vista.", w: "Con lugar y hora fijos, arrancar no requiere decidir.", f: [TM("Mi horario fijo de estudio"), CK(["Elegí mi lugar de estudio", "Dejé el celular lejos, fuera de la vista", "Tengo a mano lo que necesito"])] },
        { t: "25 minutos de foco", a: "Un bloque de 25 minutos con una sola materia. Cuando termina, anotá cuánto hiciste.", w: "Un tiempo corto y con final es más fácil de empezar y de sostener.", f: [AC("foco", "Bloque de foco guiado")] },
        { t: "Recordar sin mirar", a: "Estudiá un tema 15 minutos. Después cerrá el material y escribí todo lo que te acuerdes.", w: "Intentar recordar fija mucho más que releer.", f: [T("Tema que estudié", 4, "Tema"), TR(900, "15 minutos estudiando"), LS("Lo que recuerdo sin mirar", 3, "Algo que recuerdo"), CH("¿Cuánto recordaste?", ["Poco", "Bastante", "Casi todo"])] },
        { t: "Armá tus preguntas", a: "Escribí 5 preguntas que podrían tomarte sobre el tema de hoy. Respondelas sin mirar.", w: "Pensar como el que toma el examen te enseña qué importa.", f: [LS("Preguntas que podrían tomar", 5, "Una pregunta"), TL("tarjetas", "Pasalas a Tarjetas de repaso", false)] },
        { t: "Repasá lo de hace dos días", a: "Repasá hoy, sin releer todo, el tema que viste hace dos días. Mirá cuánto se te quedó.", w: "Repasar justo cuando empezás a olvidar es lo que más rinde.", f: [T("¿Qué tema repasé?", 4, "Tema"), CH("¿Cuánto se me quedó?", ["Poco", "Bastante", "Casi todo"]), CK(["Repasé sin mirar primero", "Anoté lo que no recordé"])] },
        { t: "Explicalo simple", a: "Explicá en 3 frases un tema como si se lo contaras a un amigo que no sabe nada.", w: "Si lo podés explicar simple, lo entendiste de verdad.", f: [T("Mi explicación en 3 frases", 40, "Se trata de…")] },
        { t: "Mezclá temas", a: "Hacé dos bloques de 25 minutos con dos temas distintos, uno después del otro.", w: "Alternar temas cuesta más pero se aprende mejor.", f: [CK(["Bloque del tema A (25 min)", "Pausa de 5 minutos", "Bloque del tema B (25 min)"]), T("Temas que mezclé", 6, "A y B")] },
        { t: "Un examen de práctica", a: "Resolvé ejercicios o un parcial anterior en 30 minutos, sin mirar el material.", w: "Practicar en condiciones de examen te saca los nervios y muestra tus huecos.", f: [TR(1800, "30 minutos de práctica"), LS("Lo que no supe resolver", 2, "Tema o ejercicio"), CH("¿Cómo te fue?", ["Mal", "Más o menos", "Bien"])] },
        { t: "Pausas de verdad", a: "Entre bloques, hacé una pausa de 5 minutos: caminar o tomar agua, sin celular.", w: "Descansar bien es parte de estudiar bien.", f: [AC("foco", "Bloque de foco guiado"), CK(["Hice una pausa real sin celular", "Me levanté y me moví"])] },
        { t: "Dormir antes de rendir", a: "Elegí a qué hora te acostás hoy. Dormir bien fija lo que estudiaste.", w: "El cerebro guarda lo aprendido mientras dormís.", when: "pm", f: [TM("¿A qué hora me acuesto hoy?"), CK(["Corté el estudio a tiempo", "Dejé todo listo para mañana"])] },
        { t: "Qué te distrae", a: "Anotá lo que más te distrae al estudiar y qué vas a hacer para evitarlo.", w: "Es más fácil sacar la distracción que resistirla.", f: [LS("Lo que más me distrae", 3, "Una distracción"), T("Lo que voy a hacer para evitarlo", 10, "Voy a…")] },
        { t: "Tu método", a: "Elegí las 3 técnicas que más te funcionaron. Ese es tu método para los próximos exámenes.", w: "Lo que te funciona a vos es lo que queda.", f: [LS("Mis 3 técnicas", 3, "Una técnica")] }
      ]
    },
    {
      id: "movimiento", n: "Moverme más", tag: "Cuerpo", reminder: "18:00",
      intro: "Subí de nivel para empezar a moverte de verdad, de a poco y sin lesionarte. Cargás cuántos minutos te movés cada día y al final ves cuánto subiste.",
      q: "¿Qué tan seguido te movés hoy?", lo: "Casi nada", hi: "Todos los días", better: "up",
      note: "Si hace mucho que no hacés actividad, tenés una lesión, una condición de salud o sentís dolor o mareos, consultá con un médico antes de empezar. Esto es una guía de hábitos y no reemplaza a un profesional.",
      log: [NU("Minutos que te moviste hoy (caminar, entrenar, bailar, lo que sea)", "min", 0, 600)], logKeys: ["min"],
      ml: "Movimiento por día", up: true,
      metric: function (v) { return +v.min; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        { t: "Tu punto de partida", a: "Sin juzgarte: contá cómo te movés hoy. Todo suma, aunque sea poco.", w: "Para avanzar primero hay que saber de dónde se sale.", f: [CH("Antes de empezar, me movía…", ["Casi nada", "Algo, sin constancia", "Bastante, quiero más"]), T("¿Qué es lo que más te frena hoy?", 8, "Me frena…")] },
        { t: "Elegí lo que te gusta", a: "El mejor movimiento es el que vas a repetir. Elegí 3 cosas que te darían ganas de hacer.", w: "Lo que disfrutás es lo que sostenés.", f: [LS("Movimientos que me gustan", 3, "Caminar, bici, bailar, gimnasio…")] },
        { t: "10 minutos caminando", a: "Salí a caminar 10 minutos a paso cómodo. Si podés, sin celular en la mano.", w: "Empezar chico evita el desgaste y las lesiones.", f: [TR(600, "10 minutos caminando"), CH("¿Cómo te sentiste?", ["Cansado", "Normal", "Con energía"])] },
        { t: "Movilidad para soltar", a: "Hacé la pausa de movimiento guiada. Prepara el cuerpo y no necesita equipamiento.", w: "Un cuerpo suelto se lesiona menos y se mueve con más ganas.", f: [AC("movimiento", "Pausa de movimiento guiada")] },
        { t: "Tu día y tu hora", a: "Elegí a qué hora te movés y en qué momento del día te queda más cómodo.", w: "Un horario fijo evita tener que decidirlo cada vez.", f: [TM("Mi hora para moverme"), CH("¿Qué momento te sirve más?", ["A la mañana", "A la tarde", "A la noche"])] },
        { t: "Fuerza básica en casa", a: "Hacé el circuito guiado de fuerza en casa: sentadillas, flexiones apoyando las manos donde te quede cómodo, puente de glúteos y plancha, con descansos. Frená si algo duele.", w: "Con la fuerza mejoran la postura, los dolores de espalda y la energía del día. Desde los 30 años se pierde músculo si no se usa.", f: [AC("fuerza", "Fuerza en casa guiada")] },
        { t: "Descanso activo", a: "Hoy no entrenes fuerte: caminá suave o estirá 10 minutos. Descansar también es parte del plan.", w: "El cuerpo se adapta mientras se recupera.", f: [TR(600, "10 minutos suaves"), CH("¿Cómo está tu cuerpo hoy?", ["Cansado", "Bien", "Con ganas de más"])] },
        { t: "Elegí tu camino", a: "Hoy hacés 15 minutos de lo que más te guste. Si querés empezar a correr, abrí el Plan de 0 a 5 km y hacé la sesión 1: alterna caminar y trotar suave. Si preferís fuerza, usá una rutina de Mi rutina de entrenamiento.", w: "Tener un plan con progresión es lo que hace que sigas: cada sesión es apenas un poco más que la anterior.", f: [CH("¿Qué elegiste?", ["Caminar más rápido", "Correr con el plan de 0 a 5 km", "Fuerza", "Otro deporte o baile"]), TR(900, "15 minutos de movimiento"), TL("correr", "Plan de 0 a 5 km (opcional)", false)] },
        { t: "Con alguien es más fácil", a: "Pensá a quién podés invitar o con quién contarle tu plan. Escribilo.", w: "Comprometerte con otro aumenta la constancia.", f: [T("Con quién o a quién se lo cuento", 6, "Le voy a decir a…")] },
        { t: "Tus excusas, resueltas", a: "Anotá lo que más te frena y qué vas a hacer cuando aparezca.", w: "Tener la respuesta lista saca el 'hoy no puedo'.", f: [LS("Lo que me frena", 3, "Una excusa real"), T("Lo que voy a hacer cuando aparezca", 10, "Si pasa, entonces…")] },
        { t: "Tu versión mínima", a: "Definí qué hacés los días de poca energía para no cortar la racha: 5 minutos alcanzan.", w: "Un mínimo siempre posible mantiene el hábito vivo.", f: [T("Mi versión mínima", 8, "En un mal día hago…")] },
        { t: "Una sesión completa", a: "Armá 20 minutos: 5 de entrada en calor, 10 de lo que elegiste, 5 de estirar.", w: "Es el formato de entrenamiento que podés repetir toda la vida.", f: [TR(1200, "20 minutos de sesión completa"), CH("¿Cómo te sentiste al terminar?", ["Cansado", "Bien", "Muy bien"]), CK(["Entré en calor", "Estiré al final"])] },
        { t: "Mirá lo que cambió", a: "Fijate cuánto te moviste estos días y anotá 3 cosas que notás distintas.", w: "Ver el cambio te da ganas de seguir.", f: [LS("Lo que noto distinto", 3, "Energía, sueño, ánimo…"), TL("mover", "Registro de movimiento", false)] },
        { t: "Tu rutina semanal", a: "Elegí tus 3 días y qué vas a hacer en cada uno. Esa es tu rutina para seguir.", w: "Lo que dura es lo que elegís vos.", f: [LS("Mis 3 momentos de la semana", 3, "Día + actividad")] }
      ]
    },
    {
      id: "plata", n: "Ordenar mi plata", tag: "Plata", reminder: "21:00",
      intro: "Subí de nivel para saber en qué gastás y armar un presupuesto simple. Cargás lo que gastás cada día y al final ves tu panorama real.",
      q: "¿Qué tan claro tenés adónde va tu plata?", lo: "Nada claro", hi: "Muy claro", better: "up",
      note: "Esto es organización personal, no asesoramiento financiero ni de inversión. Para decisiones importantes o deudas grandes, consultá con un profesional.",
      log: [NU("¿Cuánto gastaste hoy? (en pesos, sin contar gastos fijos)", "$", 0, 100000000)], logKeys: ["gasto"],
      ml: "Gasto por día", up: false,
      metric: function (v) { return +v.gasto; }, fmt: function (m) { return "$" + Math.round(m).toLocaleString("es-AR"); },
      days: [
        { t: "Anotá lo de hoy", a: "Hoy anotá todo lo que gastás. Cargá el total del día abajo.", w: "Lo que no se anota se subestima.", f: [LS("Lo que gasté hoy", 3, "Compra o gasto"), TL("gastos", "Registro de gastos", false)] },
        { t: "Cuánto entra", a: "Escribí cuánto dinero entra por mes: sueldo, changas, ayuda de alguien, lo que sea.", w: "Primero hay que saber con qué se cuenta.", f: [NU("Mis ingresos del mes", "$", 0, 1000000000)] },
        { t: "Tus gastos fijos", a: "Listá lo que pagás todos los meses sí o sí: alquiler, servicios, transporte, cuotas.", w: "Los fijos son la base del presupuesto.", f: [LS("Mis gastos fijos", 4, "Gasto fijo"), NU("Total de gastos fijos del mes", "$", 0, 1000000000), TL("fijos", "Gastos fijos y cuotas", false)] },
        { t: "Gastos hormiga", a: "Buscá los gastos chicos que se repiten (cafés, apps, delivery). Anotá cuáles son.", w: "Los gastos chicos suman más de lo que parece.", f: [LS("Mis gastos chicos que se repiten", 3, "Gasto chico"), NU("Calculo que gasto por mes en eso", "$", 0, 100000000)] },
        { t: "Poné nombre a cada gasto", a: "Elegí en qué categoría entra cada gasto: necesidad, gusto o ahorro.", w: "Separar necesidad de gusto aclara dónde ajustar.", f: [CH("Lo que más gasto es…", ["Necesidades", "Gustos", "Ni idea todavía"]), T("¿Qué te sorprendió?", 8, "Me sorprendió que…")] },
        { t: "Revisá el último mes", a: "Mirá los movimientos de tu cuenta o billetera del último mes y detectá los 3 gastos más grandes.", w: "Los gastos grandes pesan más que cualquier detalle.", f: [LS("Mis 3 gastos más grandes", 3, "Gasto grande")] },
        { t: "Un límite por semana", a: "Elegí cuánto podés gastar en gustos por semana, sin contar lo fijo.", w: "Un límite claro evita llegar a fin de mes sin saber qué pasó.", f: [NU("Mi límite semanal en gustos", "$", 0, 100000000)] },
        { t: "Presupuesto simple", a: "Repartí tus ingresos entre necesidades, gustos y ahorro. Una regla de partida: lo que se pueda para ahorro primero.", w: "Un presupuesto de tres partes es fácil de sostener.", f: [NU("Para necesidades", "$", 0, 1000000000), NU("Para gustos", "$", 0, 1000000000), NU("Para ahorro", "$", 0, 1000000000)] },
        { t: "Ahorrar primero", a: "Apartá un monto chico apenas cobrás, antes de gastar. Aunque sea poco.", w: "Lo que se aparta primero se ahorra; lo que sobra casi nunca.", f: [NU("Lo que aparto este mes", "$", 0, 1000000000), CK(["Lo aparté en un lugar separado"])] },
        { t: "Cuotas y deudas", a: "Listá lo que debés y cuándo vence. Sin culpa: solo ordenar.", w: "Ver las deudas por escrito baja la ansiedad.", f: [LS("Mis cuotas o deudas", 3, "Qué es y cuánto"), CH("¿Cómo estoy con eso?", ["Al día", "Ajustado", "Atrasado"])] },
        { t: "Fondo para imprevistos", a: "Pensá una meta chica para tener un colchón: por ejemplo, el equivalente a una semana de gastos.", w: "Un colchón evita que un imprevisto te desarme todo.", f: [NU("Meta de mi colchón", "$", 0, 1000000000), T("¿Cómo lo voy a juntar?", 8, "Voy a apartar…")] },
        { t: "Pausa antes de comprar", a: "Antes de una compra no necesaria, esperá 24 horas. Anotá qué pasó.", w: "Muchas compras impulsivas se van solas.", f: [CH("Después de esperar…", ["Ya no la quería", "La compré igual", "No tuve ninguna compra"]), T("¿Qué era?", 3, "Quería comprar…")] },
        { t: "Mirá tu panorama", a: "Mirá tu gráfico de gastos y anotá lo que ves: qué bajó, qué subió.", w: "Mirar los números cada tanto mantiene el control.", f: [LS("Lo que aprendí de mis gastos", 3, "Algo que noté")] },
        { t: "Tu sistema de plata", a: "Elegí las 3 reglas que más te sirvieron. Ese es tu sistema.", w: "Lo que dura es lo que elegís vos.", f: [LS("Mis 3 reglas", 3, "Una regla que me sirvió")] }
      ]
    },
    {
      id: "viajes", n: "Organizar un viaje", tag: "Viaje", reminder: "20:00",
      intro: "Subí de nivel para armar el viaje que querés, paso a paso: destino, presupuesto, itinerario, reservas y valija. Cargás cuánto fuiste ahorrando y tu viaje queda listo.",
      q: "¿Qué tan listo sentís tu viaje?", lo: "Nada", hi: "Totalmente", better: "up",
      note: "Chequeá siempre requisitos de ingreso, documentos y recomendaciones de salud en las fuentes oficiales del destino.",
      log: [NU("¿Cuánto tenés ahorrado para el viaje hasta hoy? (en pesos)", "$", 0, 1000000000)], logKeys: ["ah"],
      ml: "Ahorrado para el viaje", up: true,
      metric: function (v) { return +v.ah; }, fmt: function (m) { return "$" + Math.round(m).toLocaleString("es-AR"); },
      days: [
        { t: "Tu destino", a: "Escribí adónde querés ir y por qué. Si dudás entre dos, anotá los dos.", w: "Saber el motivo ayuda a decidir todo lo demás.", f: [T("Mi destino y por qué", 10, "Quiero ir a… porque…")] },
        { t: "Cuándo y cuántos días", a: "Elegí cuándo podrías viajar y cuántos días.", w: "Las fechas definen precios y logística.", f: [CH("¿Cuántos días?", ["Fin de semana", "3 a 5 días", "Una semana", "Más de una semana"]), T("Mi mejor momento", 4, "Me sirve ir en…")] },
        { t: "Con quién", a: "Anotá con quién viajás y qué tiene que gustarle a cada uno.", w: "Un viaje en grupo funciona cuando todos se escuchan.", f: [T("Con quién voy y qué busca cada uno", 8, "Voy con… y buscamos…")] },
        { t: "Presupuesto total", a: "Estimá cuánto querés gastar en total: transporte, alojamiento, comida y actividades.", w: "Un tope claro evita sorpresas.", f: [NU("Presupuesto total", "$", 0, 1000000000), TL("viaje", "Mi viaje: presupuesto por rubro", false)] },
        { t: "Cómo llegar", a: "Buscá 3 opciones para llegar y comparalas por precio y tiempo.", w: "Comparar antes de reservar ahorra plata.", f: [LS("Opciones para llegar", 3, "Opción, precio, duración"), CH("¿Cuál prefiero?", ["La más barata", "La más rápida", "La más cómoda"])] },
        { t: "Dónde dormir", a: "Buscá 3 opciones de alojamiento cerca de lo que querés conocer.", w: "El alojamiento define tu comodidad y tus traslados.", f: [LS("Opciones de alojamiento", 3, "Lugar y precio por noche")] },
        { t: "Qué ver: lo imperdible", a: "Anotá las 5 cosas que no querés perderte.", w: "Con una lista clara no se pierde tiempo el día del viaje.", f: [LS("Lo imperdible", 5, "Lugar o actividad")] },
        { t: "Un día por vez", a: "Armá el itinerario de tu primer día: lugares, horarios y cómo moverte.", w: "Un itinerario simple, con aire entre actividades, se disfruta más.", f: [LS("Mi día 1", 4, "Hora y actividad")] },
        { t: "El resto de los días", a: "Repartí lo demás en los otros días, agrupando lo que queda cerca.", w: "Agrupar por zona ahorra traslados.", f: [T("Mi itinerario general", 20, "Día 2: … Día 3: …")] },
        { t: "Plan de ahorro", a: "Calculá cuánto apartar por mes para llegar al presupuesto a tiempo.", w: "Un viaje se logra con un monto chico y constante.", f: [NU("Meses que faltan", "meses", 1, 60), NU("Lo que aparto por mes", "$", 0, 1000000000)] },
        { t: "Documentos y requisitos", a: "Revisá qué necesitás: documento, visa, seguro, vacunas. Tildá lo que ya está.", w: "Es lo que más complica si se deja para el final.", f: [CK(["Revisé si mi documento está vigente", "Revisé si necesito visa o permiso", "Revisé si necesito seguro de viaje", "Revisé requisitos de salud del destino"])] },
        { t: "Reservas", a: "Decidí qué reservás primero (transporte y alojamiento) y cuándo.", w: "Reservar a tiempo suele salir más barato.", f: [CK(["Definí qué reservo primero", "Comparé precios en más de un lugar", "Revisé la política de cancelación"]), T("Mi plan de reservas", 8, "Primero reservo…")] },
        { t: "Tu valija", a: "Armá la lista de lo que llevás, pensando en el clima y los días.", w: "Una lista evita olvidos y valijas pesadas.", f: [LS("Lo que llevo", 6, "Ropa, documentos, cargadores…"), TL("valija", "Valija", false)] },
        { t: "Plan B y listo", a: "Anotá qué hacés si algo sale mal y escribí un resumen de tu viaje.", w: "Con un plan B los imprevistos pesan menos.", f: [T("Mi plan B", 10, "Si pasa…, hago…"), T("Mi viaje en una frase", 8, "Voy a… del … al …")] }
      ]
    },
    {
      id: "laburo", n: "Buscar trabajo", tag: "Trabajo", reminder: "10:00",
      intro: "Subí de nivel para buscar trabajo con orden: CV, perfil, postulaciones y entrevistas. Cargás cuántas acciones de búsqueda hacés por día y ves tu avance.",
      q: "¿Qué tan preparado te sentís para buscar trabajo?", lo: "Nada", hi: "Muy preparado", better: "up",
      note: "Desconfiá de ofertas que piden dinero por adelantado o datos bancarios. Ninguna oferta seria te cobra por entrevistarte.",
      log: [NU("¿Cuántas acciones de búsqueda hiciste hoy? (postulaciones, mensajes, llamados)", "acciones", 0, 100)], logKeys: ["acc"],
      ml: "Acciones por día", up: true,
      metric: function (v) { return +v.acc; }, fmt: function (m) { return (Math.round(m * 10) / 10) + " acciones"; },
      days: [
        { t: "Qué trabajo buscás", a: "Escribí qué tipo de trabajo querés, en qué zona y con qué horarios.", w: "Quien sabe qué busca se postula mejor.", f: [T("El trabajo que busco", 10, "Busco trabajo de… en… "), CH("¿Qué disponibilidad tengo?", ["Part time", "Full time", "Por proyecto", "Flexible"])] },
        { t: "Tus fortalezas", a: "Anotá 3 cosas que hacés bien, aunque no las hayas puesto nunca en un CV.", w: "Lo que parece obvio para vos es valioso para otros.", f: [LS("Mis fortalezas", 3, "Algo que hago bien")] },
        { t: "Armá tu CV base", a: "Preparalo con datos de contacto, experiencia, estudios y habilidades. Una hoja alcanza.", w: "Un CV corto y claro se lee completo.", f: [CK(["Datos de contacto actualizados", "Experiencia ordenada de lo más reciente a lo más viejo", "Estudios", "Habilidades", "Una sola hoja"])] },
        { t: "Logros, no tareas", a: "Pasá 3 tareas de tu CV a logros, con números si podés.", w: "'Atendí 40 clientes por día' dice más que 'atención al cliente'.", f: [LS("Mis logros", 3, "Logré… (con números)")] },
        { t: "Tu perfil online", a: "Revisá tu perfil de LinkedIn o el portal que uses: foto clara, título y resumen.", w: "Muchos reclutadores buscan perfiles antes de llamar.", f: [CK(["Tengo una foto clara", "Mi título dice qué busco", "Escribí un resumen corto", "Cargué mi experiencia"])] },
        { t: "Dónde buscar", a: "Elegí 3 lugares para buscar: portales, empresas del rubro, conocidos.", w: "Buscar en pocos lugares con constancia rinde más que en muchos sin orden.", f: [LS("Mis 3 lugares de búsqueda", 3, "Portal, empresa o persona")] },
        { t: "Tu primera postulación", a: "Postulate a una oferta que te interese, adaptando el CV a lo que piden.", w: "Una postulación pensada vale más que diez en automático.", f: [NU("Postulaciones que hice hoy", "postulaciones", 1, 50), T("¿A qué puesto?", 4, "Puesto y empresa")] },
        { t: "Escribile a un contacto", a: "Escribile a alguien que conozca tu rubro y contale qué buscás.", w: "Muchos trabajos se consiguen por contactos.", f: [T("Mi mensaje", 20, "Hola…, estoy buscando…"), CK(["Lo envié"])] },
        { t: "Contame sobre vos", a: "Practicá en voz alta tu presentación de un minuto: quién sos, qué hacés y qué buscás.", w: "Es la primera pregunta de casi toda entrevista.", f: [TR(180, "3 minutos practicando en voz alta"), T("Mi presentación", 20, "Soy… y busco…")] },
        { t: "Preguntas difíciles", a: "Preparate para 3 preguntas incómodas: 'puntos débiles', 'por qué dejaste tu último trabajo', 'pretensión salarial'.", w: "Pensarlo antes evita improvisar nervioso.", f: [LS("Mis respuestas", 3, "Pregunta y respuesta corta")] },
        { t: "Planilla de seguimiento", a: "Cargá en Mis postulaciones cada búsqueda que hiciste: empresa, puesto, fecha y en qué estado está.", w: "Lo que no se anota se olvida: con todo a la vista sabés a quién volver a escribir y ves cuánto avanzaste.", f: [TL("postul", "Mis postulaciones", true, "Cargá al menos una postulación.")] },
        { t: "Entrevista de práctica", a: "Pedile a alguien que te haga una entrevista de prueba de 15 minutos.", w: "Practicar con otra persona baja los nervios.", f: [TR(900, "15 minutos de entrevista de práctica"), T("Lo que mejoraría", 10, "Tengo que mejorar…")] },
        { t: "Tu rutina de búsqueda", a: "Definí un horario fijo para buscar y cuántas acciones hacés por día.", w: "Buscar trabajo es un trabajo: necesita horario.", f: [TM("Mi hora de búsqueda"), NU("Acciones por día que me propongo", "acciones", 1, 30)] },
        { t: "Tu plan semanal", a: "Armá tu plan para la próxima semana: a quién escribís, dónde te postulás, qué practicás.", w: "Con un plan escrito se sigue buscando aunque cueste.", f: [LS("Mi plan de la semana", 3, "Acción concreta")] }
      ]
    },
    {
      id: "lectura", n: "Leer más", tag: "Hábitos", reminder: "22:00",
      intro: "Un camino para volver a leer o leer más: elegir bien el libro, un momento fijo, leer sin el celular y sostenerlo. Cargás tus minutos y ves tu avance.",
      q: "¿Qué tan seguido leés?", lo: "Casi nunca", hi: "Todos los días", better: "up",
      log: [NU("Minutos que leíste hoy", "min", 0, 600)], logKeys: ["min"], ml: "Lectura por día", up: true,
      metric: function (v) { return +v.min; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        { t: "Tu punto de partida", a: "Sin juzgarte: contá cuánto leés hoy y qué es lo que más te frena.", w: "Saber qué te frena (tiempo, cansancio, celular, no encontrar un libro) te dice por dónde empezar.", f: [CH("Hoy leo…", ["Casi nunca", "Algún libro al año", "Un libro cada tanto", "Leo seguido"]), T("¿Qué es lo que más te frena?", 6, "Me frena…")] },
        { t: "Un libro que te den ganas", a: "Elegí un libro que de verdad te dé ganas de leer, no el que «deberías». Sumalo a Mis libros con sus páginas. Regla: si a las 50 páginas no te engancha, cambialo sin culpa.", w: "El mejor libro para crear el hábito es el que no querés soltar. La culpa por abandonar libros es lo que más hace dejar de leer.", f: [TL("libros", "Mis libros", true, "Sumá tu libro.")] },
        { t: "10 minutos hoy", a: "Leé 10 minutos con el celular en otra habitación. Cuando termines, anotá en qué página quedaste en Mis libros.", w: "Empezar chico hace que lo repitas. Diez minutos por día son unos 15 libros por año.", f: [TR(600, "10 minutos de lectura"), TL("libros", "Anotar en Mis libros", false)] },
        { t: "Tu momento fijo", a: "Elegí un momento del día y engancharlo a algo que ya hacés: «después de cenar, leo» o «en el colectivo, leo».", w: "Un hábito se arma más fácil si va pegado a otro que ya tenés: no dependés de acordarte ni de las ganas.", f: [CH("¿Cuándo vas a leer?", ["Antes de dormir", "En el viaje", "Después de comer", "A la mañana", "Otro"]), T("Mi frase: después de ___, leo", 8, "Después de…, leo")] },
        { t: "El libro a mano", a: "Dejá el libro donde lo veas (la mesa de luz, la mochila) o descargá una app de lectura en el celular para los tiempos muertos.", w: "Lo que está a la vista se usa. Sacar fricción es más efectivo que ponerle fuerza de voluntad.", f: [CK(["Dejé el libro a la vista", "Lo llevo encima o lo tengo en el celular"])] },
        { t: "20 minutos sin interrupciones", a: "Leé 20 minutos con el celular en modo avión o en otra habitación.", w: "La lectura profunda necesita algunos minutos para arrancar. Cada notificación la corta y hay que volver a empezar.", f: [TR(1200, "20 minutos de lectura")] },
        { t: "Una idea que te llevás", a: "Anotá con tus palabras una idea, un dato o un momento del libro que te haya quedado.", w: "Escribir lo que leíste hace que lo recuerdes mucho más y que el libro te sirva, no solo te entretenga.", f: [T("Una idea que me llevo", 15, "Me quedo con…")] },
        { t: "Contalo", a: "Contale a alguien en 3 frases de qué va lo que estás leyendo (o escribilo como si se lo contaras).", w: "Explicar lo que leíste es la forma más rápida de entenderlo de verdad.", f: [T("Lo que le conté", 15, "Es sobre…")] },
        { t: "Tu meta realista", a: "Mirá cuántas páginas leés en 10 minutos y elegí una meta por día que puedas sostener aun en un día malo.", w: "Una meta chica que se cumple siempre gana a una meta grande que se abandona.", f: [NU("Páginas por día que me propongo", "pág", 1, 200), T("¿Cuándo lo vas a revisar?", 4, "El domingo…")] },
        { t: "Los tiempos muertos", a: "Hoy usá 5 minutos de espera (fila, colectivo, sala de espera) para leer en lugar de abrir redes.", w: "Los tiempos muertos suman casi una hora por día. Cambiar algunos por lectura multiplica lo que leés.", f: [CH("¿Lo hiciste?", ["Sí", "Lo intenté", "Hoy no pude"])] },
        { t: "Leer con alguien", a: "Buscá a una persona con quien leer el mismo libro o comentar lo que leen. Escribile hoy.", w: "Compartir la lectura la vuelve un plan, no una obligación, y te da ganas de seguir.", f: [T("Con quién y cómo", 6, "Con… vamos a…")] },
        { t: "Tu próxima pila", a: "Armá una lista de 3 libros para después del que estás leyendo. Pedí recomendaciones o mirá qué leen los que admirás.", w: "Saber qué sigue evita el bache entre un libro y otro, que es cuando más se abandona.", f: [LS("Mis próximos 3 libros", 3, "Un libro")] },
        { t: "Mirá cuánto leíste", a: "Abrí Mis libros, mirá tus minutos y páginas de estas semanas y anotá qué cambió.", w: "Ver el avance en números es lo que sostiene la motivación cuando bajan las ganas.", f: [TL("libros", "Mis libros", false), LS("Lo que noto distinto", 3, "Algo que cambió")] },
        { t: "Tu sistema de lectura", a: "Elegí tus 3 reglas para seguir leyendo: momento, lugar, meta, qué hacés cuando no tenés ganas.", w: "Lo que dura es lo que elegís vos.", f: [LS("Mis 3 reglas", 3, "Una regla")] }
      ]
    },
    {
      id: "idioma", n: "Aprender un idioma", tag: "Hábitos", reminder: "19:00",
      intro: "Un camino para avanzar con un idioma todos los días: una meta concreta, 15 minutos diarios, tarjetas con repaso espaciado, escuchar, hablar y escribir. Cargás tus minutos y ves tu avance.",
      q: "¿Qué tan cómodo te sentís con el idioma?", lo: "Nada", hi: "Muy cómodo", better: "up",
      note: "Forma no es un curso de idiomas: te ayuda a armar el hábito y a practicar con lo que uses (una app, un curso, series, libros).",
      log: [NU("Minutos de práctica del idioma hoy", "min", 0, 600)], logKeys: ["min"], ml: "Práctica por día", up: true,
      metric: function (v) { return +v.min; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        { t: "Tu punto de partida", a: "Escribí qué idioma, para qué lo querés (trabajo, viaje, estudio, gusto) y en qué nivel estás.", w: "El para qué define qué practicar: no es lo mismo prepararte para una entrevista que para viajar.", f: [T("Idioma y para qué", 8, "Inglés, para conseguir un trabajo remoto…"), CH("Mi nivel hoy", ["Empiezo de cero", "Básico", "Intermedio", "Avanzado"])] },
        { t: "Una meta concreta", a: "Elegí algo medible para dentro de 3 meses. Por ejemplo: tener una charla de 10 minutos, ver una serie sin subtítulos en español o rendir un examen.", w: "Una meta concreta te dice qué practicar cada día y te deja saber si avanzaste.", f: [T("Mi meta en 3 meses", 10, "En 3 meses quiero…")] },
        { t: "15 minutos hoy", a: "Practicá 15 minutos con lo que tengas: una app, un curso, un libro o un video. Anotá qué usaste.", w: "La constancia gana a la intensidad: 15 minutos por día rinden más que 2 horas el domingo.", f: [TR(900, "15 minutos de práctica"), T("¿Qué usaste?", 4, "Usé…")] },
        { t: "Tus primeras tarjetas", a: "Creá en Tarjetas de repaso un mazo con 15 palabras o frases que vas a necesitar para tu meta. De un lado en español, del otro en el idioma.", w: "Las tarjetas con repaso espaciado te muestran cada palabra justo antes de que la olvides: es la forma más eficiente de memorizar vocabulario.", f: [TL("tarjetas", "Tarjetas de repaso", true, "Creá o repasá un mazo hoy.")] },
        { t: "Escuchar todos los días", a: "Escuchá 10 minutos algo en el idioma con atención: un podcast, una canción con la letra, un video de algo que te guste.", w: "El oído se entrena escuchando mucho. Lo que te interesa se escucha más y mejor.", f: [TR(600, "10 minutos escuchando"), T("¿Qué escuchaste?", 4, "Escuché…")] },
        { t: "Repasá tus tarjetas", a: "Repasá tu mazo: respondé sin mirar y marcá con honestidad si lo sabías.", w: "Recordar sin mirar es lo que fija la memoria. Releer da la falsa sensación de saber.", f: [TL("tarjetas", "Tarjetas de repaso", true, "Repasá tu mazo hoy.")] },
        { t: "El idioma a tu alrededor", a: "Cambiá el idioma de tu celular o de una app que uses todos los días (Instagram, Spotify, un juego).", w: "Te expone al idioma muchas veces por día sin que te lleve tiempo extra.", f: [CK(["Cambié el idioma del celular o de una app"])] },
        { t: "Hablá en voz alta", a: "Durante 3 minutos contá tu día en voz alta en el idioma, o grabate en un audio. Se vale equivocarse.", w: "Hablar es lo que más se posterga y lo que más da miedo. Empezar solo y en voz alta baja la vergüenza.", f: [TR(180, "3 minutos hablando"), T("Una frase que me costó decir", 4, "Me costó…")] },
        { t: "Una serie en el idioma", a: "Mirá un capítulo con subtítulos en el mismo idioma y anotá 5 expresiones nuevas. Sumalas a tus tarjetas.", w: "Las series muestran cómo se habla de verdad. Con subtítulos en el mismo idioma unís lo que escuchás con lo que leés.", f: [LS("Expresiones nuevas", 5, "Una expresión")] },
        { t: "Escribí", a: "Escribí 5 frases sobre tu semana. Revisalas con un corrector o pedile a alguien que las corrija.", w: "Escribir te obliga a armar frases completas y te muestra exactamente qué te falta.", f: [T("Mis 5 frases", 40, "Esta semana…")] },
        { t: "Alguien con quien practicar", a: "Buscá con quién practicar: un intercambio de idiomas, un amigo, un grupo o una clase. Escribile o anotate hoy.", w: "Conversar con otra persona es lo que más acelera el aprendizaje y lo vuelve real.", f: [T("Con quién y cuándo", 6, "Con… el…")] },
        { t: "Pensá en el idioma", a: "Durante 5 minutos narrá mentalmente lo que estás haciendo en el idioma: «ahora abro la heladera, busco…».", w: "Pensar en el idioma, aunque sea con frases simples, es el paso entre traducir y hablar con fluidez.", f: [TR(300, "5 minutos pensando en el idioma")] },
        { t: "Mirá tu avance", a: "Compará con el paso 1: ¿qué podés hacer hoy que antes no podías? Anotá 3 cosas.", w: "En un idioma el avance es lento y no se nota día a día. Mirarlo cada tanto sostiene las ganas.", f: [LS("Lo que hoy puedo hacer", 3, "Puedo…")] },
        { t: "Tu rutina del idioma", a: "Elegí tus 3 hábitos fijos: cuándo practicás, qué usás y cuándo hablás con alguien.", w: "Lo que dura es lo que elegís vos.", f: [LS("Mis 3 hábitos", 3, "Un hábito")] }
      ]
    },
    sportProg({ id: "tenista", n: "Tenista de alto rendimiento", rol: "tenista", dep: "tenis", act: "acttenis",
      intro: "Un camino para tenistas que compiten en serio: tests físicos, práctica medible, fuerza y prevención de hombro y muñeca, rutina entre puntos, plan de partido y recuperación. Cargás tus minutos y ves tu avance.",
      d0a: "Escribí cómo es tu juego hoy: estilo, tu mejor golpe, qué te cuesta y en qué nivel competís.", d0l: "Mi juego hoy", d0p: "Juego de fondo agresivo, mi mejor golpe es el drive, me cuesta el revés alto, juego torneos…", niv: ["Torneos de club", "Torneos regionales", "Ranking nacional", "Circuito ITF o profesional"],
      tests: "por ejemplo, el 5-10-5, el salto en largo o la araña",
      metaEj: "por ejemplo: entrar al cuadro principal de un torneo o subir 50 puestos", metaPh: "Quiero lograr… antes de…", foco: "Por ejemplo: el segundo saque, la devolución profunda o el revés paralelo.",
      prac: "Por ejemplo: 10 saques a la T y contás cuántos entran, o golpes cruzados seguidos sin error.",
      actDesc: "trote, movilidad dinámica, desplazamientos, split step, aceleraciones y sombra de golpes, en 10 minutos.",
      fuerzaN: "Tenis · Fuerza tren inferior y core", fuerzaW: "te da más velocidad de piernas, más potencia en el saque y protege rodillas y espalda.",
      semana: "qué días tenés cancha, en qué 2 días hacés fuerza y prevención, y cuándo jugás torneo o partido.", semanaPh: "Lun: cancha + fuerza · Mar: cancha · Mié: prevención · Jue: cancha + fuerza · Vie: cancha suave · Sáb y dom: torneo",
      prevT: "Hombro, codo y muñeca", prevA: "Hacé la rutina «Tenis · Prevención de lesiones» (rotación externa con banda, Y-T-W, muñeca, glúteos y pantorrillas). Son 15 minutos; ideal 2 o 3 veces por semana.", prevW: "En el tenis las lesiones más comunes son por sobreuso en hombro, codo y muñeca. Fortalecerlos antes de que duelan es la mejor prevención.", prevN: "Tenis · Prevención de lesiones",
      mentT: "Entre punto y punto", mentA: "Tenés unos 20 segundos entre puntos. Armá tu rutina de 4 partes: 1) respuesta (soltá el punto anterior con un gesto), 2) relajación (respirá lento y mirá las cuerdas), 3) plan (decidí dónde sacás o qué buscás en el punto) y 4) ritual (picás la pelota igual siempre). Practicala hoy en cancha.", mentW: "Los mejores no juegan sin nervios: tienen una rutina que los devuelve al presente punto a punto.", mentL: "Mi rutina entre puntos", mentPh: "Una parte", frasePh: "Próximo punto. / Pies y pelota.",
      cardT: "Footwork y agilidad", cardA: "Hacé la rutina «Tenis · Footwork y agilidad» en Mi rutina de entrenamiento: araña, abanico, pasos cruzados y recuperación al centro. Llegar antes a la pelota te da tiempo para pegar mejor.", cardW: "La mayoría de los errores no son de brazo sino de llegar tarde o mal parado. Mejorar el primer paso cambia todo el juego.", cardF: [TL("entreno", "Mi rutina de entrenamiento", true, "Hacé «Tenis · Footwork y agilidad» y guardá la sesión.")],
      planA: "cómo juega el rival, tu plan A, tu plan B si no funciona y tus 3 claves (por ejemplo: primer saque adentro, jugar al revés del rival, paciencia en el peloteo)." }),
    sportProg({ id: "futbolista", n: "Futbolista profesional", rol: "futbolista", dep: "fútbol", act: "actfutbol",
      intro: "Un camino para futbolistas que quieren llegar o sostenerse en el profesionalismo: tests físicos, técnica medible, fuerza, prevención de isquios y aductores, resistencia, plan de partido y recuperación. Cargás tus minutos y ves tu avance.",
      d0a: "Escribí en qué puesto jugás, tu pierna hábil, cómo es tu juego hoy y en qué nivel estás.", d0l: "Mi puesto y mi juego", d0p: "Volante por derecha, diestro, buen pase largo, me falta intensidad sin pelota…", niv: ["Liga amateur o de barrio", "Inferiores o semiprofesional", "Reserva o primera", "Profesional"],
      d0x: CH("¿Cuánto estás jugando?", ["Titular", "Entro en los partidos", "Poco o nada"]),
      tests: "por ejemplo, el sprint de 30 metros, el salto en largo o el test de Cooper",
      metaEj: "por ejemplo: ganarte la titularidad, llegar a primera o quedar en una prueba", metaPh: "Quiero lograr… antes de…", foco: "Por ejemplo: la pierna menos hábil, el primer control orientado, el cabezazo o la definición.",
      prac: "Por ejemplo: pases a la pared con la pierna menos hábil en 30 segundos, o jueguitos seguidos.",
      actDesc: "carreras con variaciones, fuerza, saltos y aceleraciones, inspirada en el programa de prevención FIFA 11+, en 12 minutos.",
      fuerzaN: "Fútbol · Fuerza para la cancha", fuerzaW: "te hace más rápido en los primeros metros, ganás más duelos y protege isquios, aductores y rodillas.",
      semana: "qué días entrenás con el equipo, en qué 2 días hacés fuerza (lejos del partido), el día de recuperación después del partido y la activación del día anterior.", semanaPh: "Lun: recuperación · Mar: equipo + fuerza · Mié: equipo · Jue: equipo + fuerza liviana · Vie: activación · Sáb: partido · Dom: descanso",
      prevT: "Isquios y aductores", prevA: "Hacé la rutina «Fútbol · Prevención de lesiones», con curl nórdico y Copenhague. Arrancá con pocas repeticiones: al otro día puede haber dolor muscular, es normal. Ideal 2 veces por semana.", prevW: "Los desgarros de isquiotibiales y las lesiones de aductores son de las más comunes en el fútbol. Estos dos ejercicios tienen mucha evidencia para prevenirlas.", prevN: "Fútbol · Prevención de lesiones",
      mentT: "Tu rutina antes del partido", mentA: "Armá tu rutina de 4 partes para el día del partido: 1) qué comés y a qué hora (3 horas antes), 2) a qué hora llegás, 3) tu activación y 4) tu foco (una frase y qué vas a hacer en las primeras jugadas). Escribila y repetila siempre igual.", mentW: "Una rutina fija baja la ansiedad porque te da algo conocido para hacer, y te pone en el partido desde el primer minuto.", mentL: "Mi rutina del día del partido", mentPh: "Una parte", frasePh: "Siguiente jugada. / A presionar.",
      cardT: "Resistencia para los 90 minutos", cardA: "Hacé el entrenamiento guiado de intervalos: 4 series de 4 minutos fuerte (que te cueste hablar) con 3 minutos de trote suave entre series. Hacelo en un día sin partido ni fuerza pesada.", cardW: "Los intervalos de alta intensidad mejoran tu capacidad aeróbica, que es la que te deja repetir sprints y llegar entero al segundo tiempo.", cardF: [AC("intervalos", "Intervalos guiados 4×4")],
      planA: "cómo juega el rival, tu rol en el equipo, qué hacés cuando tu equipo pierde la pelota, qué hacés cuando la recupera y tus 3 claves." })
  ];
  var by = {}; L.forEach(function (p) { by[p.id] = p; });
  window.FormaProg = { list: L, byId: by, mins: mins };
})();
