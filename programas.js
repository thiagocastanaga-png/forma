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
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function mins(hm) { var p = String(hm || "0:0").split(":"); return (+p[0]) * 60 + (+p[1]); }
  function hm(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + " h " + pad(m % 60) + " min"; }
  function range(list) { if (list.length < 2) return 0; var a = Math.min.apply(null, list), b = Math.max.apply(null, list); return b - a; }

  var L = [
    {
      id: "dormir", n: "Dormir de verdad", tag: "Sueño", reminder: "21:00",
      intro: "14 días para ordenar tu sueño. Cargás tus horarios, hacés un paso por día y al final ves tus datos reales: cuánto dormís y qué tan regular sos.",
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
        { t: "Mirá cómo estás", a: "Cargá tus horarios reales de anoche. Todavía no cambies nada: primero hay que ver tu patrón.", w: "Para ordenar el sueño primero hay que ver cómo es hoy.", f: [] },
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
      id: "celular", n: "Celular bajo control", tag: "Atención", reminder: "09:00",
      intro: "14 días para usar el celular vos y que no te use a vos. Cargás tu tiempo de pantalla cada día y al final ves cuánto lo bajaste.",
      q: "¿Cuánto control sentís que tenés sobre tu celular?", lo: "Nada", hi: "Mucho", better: "up",
      note: "Es un apoyo de hábitos. Si sentís que no podés controlar el uso aunque lo intentes y te afecta mucho, consultá con un profesional.",
      log: [NU("Minutos de pantalla de ayer (mirá Tiempo de uso o Bienestar digital)", "min", 0, 1000)], logKeys: ["scr"],
      ml: "Pantalla por día", up: false,
      metric: function (v) { return +v.scr; }, fmt: function (m) { return hm(m / 60); },
      days: [
        { t: "Medí sin cambiar nada", a: "Cargá tu tiempo de pantalla de ayer y anotá tus 3 apps más usadas.", w: "Lo que no se mide, se subestima.", f: [LS("Mis 3 apps más usadas", 3, "Nombre de la app")] },
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
      id: "arrancar", n: "Arrancar", tag: "Foco", reminder: "09:00",
      intro: "14 días para dejar de postergar. Pasos diminutos, foco de 25 minutos y un registro de cuánto lográs cada día.",
      q: "¿Qué tan fácil te resulta empezar lo que tenés que hacer?", lo: "Muy difícil", hi: "Muy fácil", better: "up",
      note: "Si postergar te viene acompañado de mucho malestar o de un cansancio que no se va, puede haber algo más y vale la pena consultarlo con un profesional.",
      log: [NU("Minutos que estuviste enfocado hoy en tu tarea más importante", "min", 0, 600)], logKeys: ["foco"],
      ml: "Foco por día", up: true,
      metric: function (v) { return +v.foco; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        { t: "Elegí una sola cosa", a: "Escribí lo que más venís postergando. Una sola.", w: "Con una lista larga no se empieza ninguna.", f: [T("Lo que vengo postergando", 8, "Tengo que…")] },
        { t: "Hacela diminuta", a: "Escribí el primer paso más chico posible, de menos de 2 minutos (abrir el archivo, juntar los papeles).", w: "El obstáculo suele ser empezar, no la tarea entera.", f: [T("Mi primer paso de 2 minutos", 8, "Abro… / Busco…")] },
        { t: "La regla de los 2 minutos", a: "Hacé ahora ese primer paso. Solo ese. Después podés parar.", w: "Cuando arrancás, seguir es mucho más fácil.", f: [TR(120, "2 minutos haciendo el primer paso"), CH("¿Seguiste después de los 2 minutos?", ["Sí, seguí un rato", "Paré, y está bien"])] },
        { t: "25 minutos de foco", a: "Un bloque de 25 minutos con una sola tarea y el celular lejos.", w: "Un tiempo corto y con final es más fácil de aceptar.", f: [AC("foco", "Bloque de foco guiado")] },
        { t: "Dejalo listo de noche", a: "Dejá preparado hoy lo de mañana: el archivo abierto, la ropa, los papeles.", w: "Menos decisiones a la mañana, menos excusas.", when: "pm", f: [CK(["Dejé listo lo de mañana"]), T("¿Qué dejé listo?", 5, "Dejé…")] },
        { t: "La prioridad del día", a: "Elegí UNA cosa que, si la hacés, el día valió la pena. Hacela primero.", w: "Primero lo importante, antes de que el día se llene.", f: [T("Mi prioridad de hoy", 5, "Hoy lo más importante es…"), CH("¿La hiciste?", ["Sí", "En parte"], [0, 1])] },
        { t: "Dividí lo grande", a: "Tomá una tarea grande y partila en pasos chicos que arranquen con un verbo: llamar, escribir, enviar.", w: "Un paso claro se puede hacer; una montaña no.", f: [LS("Los pasos", 3, "Verbo + algo concreto")] },
        { t: "Sacá las distracciones", a: "Antes de empezar, preparalo todo para no distraerte.", w: "Es más fácil sacar la distracción que resistirla.", f: [CK(["Cerré las pestañas que no uso", "Silencié el celular", "Puse agua al lado"])] },
        { t: "Si no tenés ganas", a: "Prometete 5 minutos. Si pasados los 5 querés parar, parás. Casi nunca pasa.", w: "La motivación suele llegar después de empezar, no antes.", f: [TR(300, "5 minutos con la tarea"), CH("Pasados los 5 minutos…", ["Seguí", "Paré"])] },
        { t: "Una hora fija", a: "Elegí un horario fijo para tu tarea más importante.", w: "Un horario fijo evita tener que decidirlo todos los días.", f: [TM("Mi hora para la tarea importante")] },
        { t: "Foco y pausa de verdad", a: "Hacé un bloque de foco y después una pausa real de 5 minutos: caminar o tomar agua, sin celular.", w: "Descansar bien es parte de rendir.", f: [AC("foco", "Bloque de foco guiado"), TR(300, "5 minutos de pausa sin celular")] },
        { t: "Terminá a medias", a: "Al cortar, dejá escrito cuál es el próximo paso para arrancar fácil mañana.", w: "Empezar desde algo ya empezado cuesta menos.", f: [T("Mi próximo paso", 8, "Mañana empiezo por…")] },
        { t: "Mirá lo hecho", a: "Anotá 3 cosas que hiciste hoy. Cuenta lo hecho, no lo que falta.", w: "Ver avance te da ganas de seguir.", f: [LS("Lo que hice hoy", 3, "Algo que hice")] },
        { t: "Tu sistema", a: "Elegí las 3 técnicas que más te funcionaron.", w: "Lo que funciona para vos es lo que queda.", f: [LS("Mis 3 técnicas", 3, "Una técnica")] }
      ]
    },
    {
      id: "calma", n: "Calmar la cabeza", tag: "Calma", reminder: "20:00",
      intro: "14 días con herramientas simples para bajar la tensión de todos los días. Registrás cómo estás y armás tu propio kit.",
      q: "¿Cuánta tensión o ansiedad sentiste esta semana?", lo: "Poca", hi: "Mucha", better: "down",
      note: "Es un apoyo de bienestar y no reemplaza a un profesional de la salud mental. Si la ansiedad te impide hacer tu vida o sentís que no podés más, hablá con un profesional. Si es una urgencia, llamá al 911.",
      log: [CH("¿Cuánta tensión sentiste hoy?", ["1 · Poca", "2", "3", "4", "5 · Mucha"])], logKeys: ["ten"],
      ml: "Tensión", up: false,
      metric: function (v) { return +v.ten + 1; }, fmt: function (m) { return (Math.round(m * 10) / 10) + " de 5"; },
      days: [
        { t: "Ponele nombre", a: "Anotá qué sentís y dónde lo notás en el cuerpo. Sin juzgarlo.", w: "Nombrar lo que pasa le baja intensidad.", f: [T("¿Qué siento?", 8, "Siento…"), CH("¿Dónde lo noto?", ["Pecho", "Panza", "Cuello y hombros", "Mandíbula", "Cabeza", "En ningún lado"])] },
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
        { t: "Dos pausas en el día", a: "Hacé dos pausas de 2 minutos para respirar. Una en la mañana o mediodía y otra a la tarde.", w: "Pausas cortas y repetidas evitan que la tensión se acumule.", f: [AC("respirar", "Una pausa guiada ahora"), CK(["Hice una pausa a la mañana o mediodía", "Hice otra a la tarde"])] },
        { t: "Cerrar el día en calma", a: "Antes de dormir, 10 minutos sin pantallas. Hacé el cierre guiado.", w: "Un cierre tranquilo cambia cómo arrancás mañana.", when: "pm", f: [AC("cierre", "Cierre del día guiado")] },
        { t: "Tu kit", a: "Elegí tus 3 herramientas favoritas. Ese es tu kit para cuando llegue la tensión.", w: "Tener un plan a mano hace que cuesten menos los días difíciles.", f: [LS("Mi kit", 3, "Una herramienta que me sirvió")] }
      ]
    },
    {
      id: "estudio", n: "Estudiar mejor", tag: "Estudio", reminder: "17:00",
      intro: "14 días para estudiar mejor y rendir más. Aprendés técnicas que funcionan de verdad, las practicás dentro de la app y registrás cuánto estudiás de forma efectiva.",
      q: "¿Qué tan seguro te sentís con lo que estudiás?", lo: "Nada seguro", hi: "Muy seguro", better: "up",
      note: "Esto es un apoyo de hábitos de estudio. Si la ansiedad antes de rendir te afecta mucho, hablalo con un profesional o con tu institución.",
      log: [NU("Minutos de estudio efectivo hoy (sin celular)", "min", 0, 900)], logKeys: ["est"],
      ml: "Estudio por día", up: true,
      metric: function (v) { return +v.est; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        { t: "Mirá qué tenés por delante", a: "Anotá hasta 3 materias o exámenes que tenés que preparar. Todavía no cambies nada: primero ordenamos.", w: "Sin ver el panorama completo, se estudia lo que menos cuesta y no lo que más importa.", f: [LS("Materias o exámenes por delante", 3, "Materia o examen")] },
        { t: "Fechas a la vista", a: "Escribí la fecha de cada examen o entrega. Después elegí cuál es el primero.", w: "Una fecha clara convierte \u00abtengo que estudiar\u00bb en un plan.", f: [LS("Examen o entrega y su fecha", 3, "Materia, día/mes"), T("¿Cuál es el primero y qué tema es lo más urgente?", 8, "Lo primero es…")] },
        { t: "Un lugar y una hora", a: "Elegí un horario fijo y un lugar donde estudiar. Dejá el celular fuera de tu vista.", w: "Con lugar y hora fijos, arrancar no requiere decidir.", f: [TM("Mi horario fijo de estudio"), CK(["Elegí mi lugar de estudio", "Dejé el celular lejos, fuera de la vista", "Tengo a mano lo que necesito"])] },
        { t: "25 minutos de foco", a: "Un bloque de 25 minutos con una sola materia. Cuando termina, anotá cuánto hiciste.", w: "Un tiempo corto y con final es más fácil de empezar y de sostener.", f: [AC("foco", "Bloque de foco guiado")] },
        { t: "Recordar sin mirar", a: "Estudiá un tema 15 minutos. Después cerrá el material y escribí todo lo que te acuerdes.", w: "Intentar recordar fija mucho más que releer.", f: [T("Tema que estudié", 4, "Tema"), TR(900, "15 minutos estudiando"), LS("Lo que recuerdo sin mirar", 3, "Algo que recuerdo"), CH("¿Cuánto recordaste?", ["Poco", "Bastante", "Casi todo"])] },
        { t: "Armá tus preguntas", a: "Escribí 5 preguntas que podrían tomarte sobre el tema de hoy. Respondelas sin mirar.", w: "Pensar como el que toma el examen te enseña qué importa.", f: [LS("Preguntas que podrían tomar", 5, "Una pregunta")] },
        { t: "Repasá lo de hace dos días", a: "Repasá hoy, sin releer todo, el tema que viste hace dos días. Mirá cuánto se te quedó.", w: "Repasar justo cuando empezás a olvidar es lo que más rinde.", f: [T("¿Qué tema repasé?", 4, "Tema"), CH("¿Cuánto se me quedó?", ["Poco", "Bastante", "Casi todo"]), CK(["Repasé sin mirar primero", "Anoté lo que no recordé"])] },
        { t: "Explicalo simple", a: "Explicá en 3 frases un tema como si se lo contaras a un amigo que no sabe nada.", w: "Si lo podés explicar simple, lo entendiste de verdad.", f: [T("Mi explicación en 3 frases", 40, "Se trata de…")] },
        { t: "Mezclá temas", a: "Hacé dos bloques de 25 minutos con dos temas distintos, uno después del otro.", w: "Alternar temas cuesta más pero se aprende mejor.", f: [CK(["Bloque del tema A (25 min)", "Pausa de 5 minutos", "Bloque del tema B (25 min)"]), T("Temas que mezclé", 6, "A y B")] },
        { t: "Un examen de práctica", a: "Resolvé ejercicios o un parcial anterior en 30 minutos, sin mirar el material.", w: "Practicar en condiciones de examen te saca los nervios y muestra tus huecos.", f: [TR(1800, "30 minutos de práctica"), LS("Lo que no supe resolver", 2, "Tema o ejercicio"), CH("¿Cómo te fue?", ["Mal", "Más o menos", "Bien"])] },
        { t: "Pausas de verdad", a: "Entre bloques, hacé una pausa de 5 minutos: caminar o tomar agua, sin celular.", w: "Descansar bien es parte de estudiar bien.", f: [AC("foco", "Bloque de foco guiado"), CK(["Hice una pausa real sin celular", "Me levanté y me moví"])] },
        { t: "Dormir antes de rendir", a: "Elegí a qué hora te acostás hoy. Dormir bien fija lo que estudiaste.", w: "El cerebro guarda lo aprendido mientras dormís.", when: "pm", f: [TM("¿A qué hora me acuesto hoy?"), CK(["Corté el estudio a tiempo", "Dejé todo listo para mañana"])] },
        { t: "Qué te distrae", a: "Anotá lo que más te distrae al estudiar y qué vas a hacer para evitarlo.", w: "Es más fácil sacar la distracción que resistirla.", f: [LS("Lo que más me distrae", 3, "Una distracción"), T("Lo que voy a hacer para evitarlo", 10, "Voy a…")] },
        { t: "Tu método", a: "Elegí las 3 técnicas que más te funcionaron. Ese es tu método para los próximos exámenes.", w: "Lo que te funciona a vos es lo que queda.", f: [LS("Mis 3 técnicas", 3, "Una técnica")] }
      ]
    }
  ];
  var by = {}; L.forEach(function (p) { by[p.id] = p; });
  window.FormaProg = { list: L, byId: by, mins: mins };
})();
