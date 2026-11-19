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
    },
    {
      id: "movimiento", n: "Moverme más", tag: "Cuerpo", reminder: "18:00",
      intro: "14 días para empezar a moverte de verdad, de a poco y sin lesionarte. Cargás cuántos minutos te movés cada día y al final ves cuánto subiste.",
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
        { t: "Fuerza básica en casa", a: "Hacé 2 rondas suaves: 10 sentadillas, 10 flexiones apoyando las manos en la pared o una mesa, y 20 segundos de plancha. Frená si algo duele.", w: "Un poco de fuerza protege articulaciones y mejora todo lo demás.", f: [TR(600, "10 minutos de fuerza suave"), CK(["Hice las sentadillas", "Hice las flexiones adaptadas", "Hice la plancha", "No sentí dolor, solo esfuerzo"])] },
        { t: "Descanso activo", a: "Hoy no entrenes fuerte: caminá suave o estirá 10 minutos. Descansar también es parte del plan.", w: "El cuerpo se adapta mientras se recupera.", f: [TR(600, "10 minutos suaves"), CH("¿Cómo está tu cuerpo hoy?", ["Cansado", "Bien", "Con ganas de más"])] },
        { t: "Subí un escalón", a: "Hacé 15 minutos de lo que elegiste, un poco más que antes pero sin agotarte.", w: "Subir de a poco es lo que se mantiene en el tiempo.", f: [TR(900, "15 minutos de movimiento"), CH("¿Qué hiciste?", ["Caminé rápido", "Bici", "Entrené", "Bailé", "Otra cosa"]), CH("Esfuerzo percibido", ["Muy suave", "Cómodo", "Exigente"])] },
        { t: "Con alguien es más fácil", a: "Pensá a quién podés invitar o con quién contarle tu plan. Escribilo.", w: "Comprometerte con otro aumenta la constancia.", f: [T("Con quién o a quién se lo cuento", 6, "Le voy a decir a…")] },
        { t: "Tus excusas, resueltas", a: "Anotá lo que más te frena y qué vas a hacer cuando aparezca.", w: "Tener la respuesta lista saca el 'hoy no puedo'.", f: [LS("Lo que me frena", 3, "Una excusa real"), T("Lo que voy a hacer cuando aparezca", 10, "Si pasa, entonces…")] },
        { t: "Tu versión mínima", a: "Definí qué hacés los días de poca energía para no cortar la racha: 5 minutos alcanzan.", w: "Un mínimo siempre posible mantiene el hábito vivo.", f: [T("Mi versión mínima", 8, "En un mal día hago…")] },
        { t: "Una sesión completa", a: "Armá 20 minutos: 5 de entrada en calor, 10 de lo que elegiste, 5 de estirar.", w: "Es el formato de entrenamiento que podés repetir toda la vida.", f: [TR(1200, "20 minutos de sesión completa"), CH("¿Cómo te sentiste al terminar?", ["Cansado", "Bien", "Muy bien"]), CK(["Entré en calor", "Estiré al final"])] },
        { t: "Mirá lo que cambió", a: "Fijate cuánto te moviste estos días y anotá 3 cosas que notás distintas.", w: "Ver el cambio te da ganas de seguir.", f: [LS("Lo que noto distinto", 3, "Energía, sueño, ánimo…")] },
        { t: "Tu rutina semanal", a: "Elegí tus 3 días y qué vas a hacer en cada uno. Esa es tu rutina para seguir.", w: "Lo que dura es lo que elegís vos.", f: [LS("Mis 3 momentos de la semana", 3, "Día + actividad")] }
      ]
    },
    {
      id: "comer", n: "Comer ordenado", tag: "Comida", reminder: "19:00",
      intro: "14 días para ordenar tus comidas sin dietas raras: horarios, compras y un plan simple. Cargás cuántas comidas te salieron ordenadas cada día.",
      q: "¿Qué tan ordenadas son tus comidas hoy?", lo: "Nada", hi: "Muy ordenadas", better: "up",
      note: "Esto es organización, no una dieta ni un plan nutricional. Si tenés una condición de salud, tomás medicación o tu relación con la comida te preocupa, consultá con un profesional de la salud.",
      log: [NU("¿Cuántas comidas del día salieron como las planeaste?", "comidas", 0, 8)], logKeys: ["ok"],
      ml: "Comidas ordenadas por día", up: true,
      metric: function (v) { return +v.ok; }, fmt: function (m) { return (Math.round(m * 10) / 10) + " comidas"; },
      days: [
        { t: "Mirá cómo comés", a: "Sin cambiar nada, anotá lo que comiste hoy y cómo te sentiste.", w: "Primero se mira, después se ordena.", f: [LS("Lo que comí hoy", 3, "Desayuno, almuerzo, cena…"), CH("¿Cómo me sentí con lo que comí?", ["Mal", "Normal", "Bien"])] },
        { t: "Horarios de comida", a: "Elegí a qué hora querés comer. Horarios parecidos todos los días ordenan el hambre.", w: "El cuerpo se acostumbra a lo que se repite.", f: [TM("Mi hora de almuerzo"), TM("Mi hora de cena")] },
        { t: "Tomar agua", a: "Llená una botella y tomala a lo largo del día. Anotá cuántos vasos tomaste.", w: "A veces la sed se confunde con hambre.", f: [NU("Vasos de agua que tomé", "vasos", 0, 20), CK(["Llevé una botella conmigo"])] },
        { t: "Un plato simple", a: "Armá hoy un plato con tres cosas: algo de verdura o fruta, algo de proteína y algo de energía (arroz, pan, papa).", w: "Una regla simple se cumple mejor que una dieta complicada.", f: [CK(["Había verdura o fruta", "Había una proteína", "Había algo que da energía"])] },
        { t: "Planificá mañana", a: "Elegí qué vas a comer mañana en cada comida, antes de que llegue el hambre.", w: "Decidir con hambre sale mal; decidir antes sale bien.", when: "pm", f: [LS("Mi menú de mañana", 3, "Comida o plato")] },
        { t: "Lista de compras", a: "Armá una lista con lo que necesitás para varios días.", w: "Comprar con lista ahorra plata, tiempo y malas decisiones.", f: [LS("Mi lista de compras", 5, "Algo que necesito")] },
        { t: "Una base para la semana", a: "Elegí una cosa que cocinás en cantidad y que usás en varias comidas: arroz, legumbres, pollo, verduras.", w: "Cocinar una vez para varios días te salva en los días complicados.", f: [T("Lo que voy a cocinar de más", 6, "Voy a cocinar…"), CK(["Lo cociné", "Lo guardé para otros días"])] },
        { t: "Comer sin pantalla", a: "Comé una comida entera sin celular ni tele, en 20 minutos.", w: "Sin distracciones notás cuándo estás satisfecho.", when: "pm", f: [TR(1200, "20 minutos comiendo sin pantallas"), CH("¿Cómo fue?", ["Difícil", "Normal", "Me gustó"])] },
        { t: "Hambre real o ganas", a: "Antes de comer algo fuera de hora, preguntate qué sentís. Anotá qué fue.", w: "Distinguir hambre de aburrimiento o cansancio cambia las decisiones.", f: [CH("Hoy sentí…", ["Hambre física", "Ganas o aburrimiento", "Estrés o cansancio", "No me pasó"]), T("¿Qué hice?", 4, "Hice…")] },
        { t: "Colaciones que sirven", a: "Elegí 3 opciones simples para cuando tenés hambre entre comidas.", w: "Tener opciones a mano evita ir a lo primero que aparece.", f: [LS("Mis colaciones", 3, "Fruta, frutos secos, yogur…")] },
        { t: "Plan para los días locos", a: "Pensá qué comés cuando no tenés tiempo ni ganas de cocinar.", w: "Un plan B evita pedir comida por inercia.", f: [T("Mi plan B", 10, "Cuando no tengo tiempo, como…")] },
        { t: "Salidas y fin de semana", a: "Pensá cómo disfrutar sin descontrolarte: qué vas a priorizar y qué vas a dejar pasar.", w: "Se trata de equilibrio, no de prohibir.", f: [T("Mi regla para salidas y fines de semana", 10, "Cuando salgo…")] },
        { t: "Mirá lo que lograste", a: "Fijate cuántas comidas ordenadas tuviste y anotá 3 cosas que cambiaron.", w: "Ver avance sostiene el hábito.", f: [LS("Lo que cambió", 3, "Energía, gastos, orden…")] },
        { t: "Tu sistema de comidas", a: "Elegí los 3 hábitos que más te sirvieron. Ese es tu sistema.", w: "Lo que dura es lo que elegís vos.", f: [LS("Mis 3 hábitos", 3, "Un hábito que me sirvió")] }
      ]
    },
    {
      id: "plata", n: "Plata en orden", tag: "Plata", reminder: "21:00",
      intro: "14 días para saber en qué gastás y armar un presupuesto simple. Cargás lo que gastás cada día y al final ves tu panorama real.",
      q: "¿Qué tan claro tenés adónde va tu plata?", lo: "Nada claro", hi: "Muy claro", better: "up",
      note: "Esto es organización personal, no asesoramiento financiero ni de inversión. Para decisiones importantes o deudas grandes, consultá con un profesional.",
      log: [NU("¿Cuánto gastaste hoy? (en pesos, sin contar gastos fijos)", "$", 0, 100000000)], logKeys: ["gasto"],
      ml: "Gasto por día", up: false,
      metric: function (v) { return +v.gasto; }, fmt: function (m) { return "$" + Math.round(m).toLocaleString("es-AR"); },
      days: [
        { t: "Anotá lo de hoy", a: "Hoy anotá todo lo que gastás. Cargá el total del día abajo.", w: "Lo que no se anota se subestima.", f: [LS("Lo que gasté hoy", 3, "Compra o gasto")] },
        { t: "Cuánto entra", a: "Escribí cuánto dinero entra por mes: sueldo, changas, ayuda de alguien, lo que sea.", w: "Primero hay que saber con qué se cuenta.", f: [NU("Mis ingresos del mes", "$", 0, 1000000000)] },
        { t: "Tus gastos fijos", a: "Listá lo que pagás todos los meses sí o sí: alquiler, servicios, transporte, cuotas.", w: "Los fijos son la base del presupuesto.", f: [LS("Mis gastos fijos", 4, "Gasto fijo"), NU("Total de gastos fijos del mes", "$", 0, 1000000000)] },
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
      id: "viajes", n: "Armá tu viaje", tag: "Viaje", reminder: "20:00",
      intro: "14 días para armar el viaje que querés, paso a paso: destino, presupuesto, itinerario, reservas y valija. Cargás cuánto fuiste ahorrando y tu viaje queda listo.",
      q: "¿Qué tan listo sentís tu viaje?", lo: "Nada", hi: "Totalmente", better: "up",
      note: "Chequeá siempre requisitos de ingreso, documentos y recomendaciones de salud en las fuentes oficiales del destino.",
      log: [NU("¿Cuánto tenés ahorrado para el viaje hasta hoy? (en pesos)", "$", 0, 1000000000)], logKeys: ["ah"],
      ml: "Ahorrado para el viaje", up: true,
      metric: function (v) { return +v.ah; }, fmt: function (m) { return "$" + Math.round(m).toLocaleString("es-AR"); },
      days: [
        { t: "Tu destino", a: "Escribí adónde querés ir y por qué. Si dudás entre dos, anotá los dos.", w: "Saber el motivo ayuda a decidir todo lo demás.", f: [T("Mi destino y por qué", 10, "Quiero ir a… porque…")] },
        { t: "Cuándo y cuántos días", a: "Elegí cuándo podrías viajar y cuántos días.", w: "Las fechas definen precios y logística.", f: [CH("¿Cuántos días?", ["Fin de semana", "3 a 5 días", "Una semana", "Más de una semana"]), T("Mi mejor momento", 4, "Me sirve ir en…")] },
        { t: "Con quién", a: "Anotá con quién viajás y qué tiene que gustarle a cada uno.", w: "Un viaje en grupo funciona cuando todos se escuchan.", f: [T("Con quién voy y qué busca cada uno", 8, "Voy con… y buscamos…")] },
        { t: "Presupuesto total", a: "Estimá cuánto querés gastar en total: transporte, alojamiento, comida y actividades.", w: "Un tope claro evita sorpresas.", f: [NU("Presupuesto total", "$", 0, 1000000000)] },
        { t: "Cómo llegar", a: "Buscá 3 opciones para llegar y comparalas por precio y tiempo.", w: "Comparar antes de reservar ahorra plata.", f: [LS("Opciones para llegar", 3, "Opción, precio, duración"), CH("¿Cuál prefiero?", ["La más barata", "La más rápida", "La más cómoda"])] },
        { t: "Dónde dormir", a: "Buscá 3 opciones de alojamiento cerca de lo que querés conocer.", w: "El alojamiento define tu comodidad y tus traslados.", f: [LS("Opciones de alojamiento", 3, "Lugar y precio por noche")] },
        { t: "Qué ver: lo imperdible", a: "Anotá las 5 cosas que no querés perderte.", w: "Con una lista clara no se pierde tiempo el día del viaje.", f: [LS("Lo imperdible", 5, "Lugar o actividad")] },
        { t: "Un día por vez", a: "Armá el itinerario de tu primer día: lugares, horarios y cómo moverte.", w: "Un itinerario simple, con aire entre actividades, se disfruta más.", f: [LS("Mi día 1", 4, "Hora y actividad")] },
        { t: "El resto de los días", a: "Repartí lo demás en los otros días, agrupando lo que queda cerca.", w: "Agrupar por zona ahorra traslados.", f: [T("Mi itinerario general", 20, "Día 2: … Día 3: …")] },
        { t: "Plan de ahorro", a: "Calculá cuánto apartar por mes para llegar al presupuesto a tiempo.", w: "Un viaje se logra con un monto chico y constante.", f: [NU("Meses que faltan", "meses", 1, 60), NU("Lo que aparto por mes", "$", 0, 1000000000)] },
        { t: "Documentos y requisitos", a: "Revisá qué necesitás: documento, visa, seguro, vacunas. Tildá lo que ya está.", w: "Es lo que más complica si se deja para el final.", f: [CK(["Revisé si mi documento está vigente", "Revisé si necesito visa o permiso", "Revisé si necesito seguro de viaje", "Revisé requisitos de salud del destino"])] },
        { t: "Reservas", a: "Decidí qué reservás primero (transporte y alojamiento) y cuándo.", w: "Reservar a tiempo suele salir más barato.", f: [CK(["Definí qué reservo primero", "Comparé precios en más de un lugar", "Revisé la política de cancelación"]), T("Mi plan de reservas", 8, "Primero reservo…")] },
        { t: "Tu valija", a: "Armá la lista de lo que llevás, pensando en el clima y los días.", w: "Una lista evita olvidos y valijas pesadas.", f: [LS("Lo que llevo", 6, "Ropa, documentos, cargadores…")] },
        { t: "Plan B y listo", a: "Anotá qué hacés si algo sale mal y escribí un resumen de tu viaje.", w: "Con un plan B los imprevistos pesan menos.", f: [T("Mi plan B", 10, "Si pasa…, hago…"), T("Mi viaje en una frase", 8, "Voy a… del … al …")] }
      ]
    },
    {
      id: "laburo", n: "Buscar trabajo", tag: "Trabajo", reminder: "10:00",
      intro: "14 días para buscar trabajo con orden: CV, perfil, postulaciones y entrevistas. Cargás cuántas acciones de búsqueda hacés por día y ves tu avance.",
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
        { t: "Planilla de seguimiento", a: "Armá una lista con empresa, puesto, fecha y estado de cada postulación.", w: "Sin seguimiento se pierden oportunidades.", f: [CK(["Armé mi lista de postulaciones", "Anoté fechas de seguimiento"]), NU("Postulaciones que llevo", "postulaciones", 0, 500)] },
        { t: "Entrevista de práctica", a: "Pedile a alguien que te haga una entrevista de prueba de 15 minutos.", w: "Practicar con otra persona baja los nervios.", f: [TR(900, "15 minutos de entrevista de práctica"), T("Lo que mejoraría", 10, "Tengo que mejorar…")] },
        { t: "Tu rutina de búsqueda", a: "Definí un horario fijo para buscar y cuántas acciones hacés por día.", w: "Buscar trabajo es un trabajo: necesita horario.", f: [TM("Mi hora de búsqueda"), NU("Acciones por día que me propongo", "acciones", 1, 30)] },
        { t: "Tu plan semanal", a: "Armá tu plan para la próxima semana: a quién escribís, dónde te postulás, qué practicás.", w: "Con un plan escrito se sigue buscando aunque cueste.", f: [LS("Mi plan de la semana", 3, "Acción concreta")] }
      ]
    },
    {
      id: "deporte", n: "Mejorar en mi deporte", tag: "Deporte", reminder: "17:00",
      intro: "14 días para rendir más en tu deporte: una meta, práctica con intención, la cabeza y la recuperación. Cargás tus minutos de práctica y ves tu avance.",
      q: "¿Qué tan bien sentís que rendís en tu deporte?", lo: "Muy mal", hi: "Muy bien", better: "up",
      note: "Si tenés dolor o una lesión, consultá con un profesional antes de entrenar más. Esto es una guía de organización y hábitos.",
      log: [NU("Minutos de práctica o entrenamiento de hoy", "min", 0, 600)], logKeys: ["min"],
      ml: "Práctica por día", up: true,
      metric: function (v) { return +v.min; }, fmt: function (m) { return Math.round(m) + " min"; },
      days: [
        { t: "Tu deporte y tu nivel", a: "Escribí qué deporte practicás y en qué nivel estás hoy.", w: "Para mejorar hay que saber desde dónde.", f: [T("Mi deporte y mi nivel", 8, "Juego… hace…"), CH("Mi nivel hoy", ["Recién empiezo", "Recreativo", "Competitivo", "Alto rendimiento"])] },
        { t: "Tu meta de la temporada", a: "Elegí una meta concreta para los próximos meses.", w: "Una meta clara ordena todo el entrenamiento.", f: [T("Mi meta", 10, "Quiero lograr…")] },
        { t: "Fortalezas y puntos a mejorar", a: "Anotá 3 cosas en las que sos bueno y 3 a mejorar.", w: "Conocerte te dice dónde poner el tiempo.", f: [LS("Mis fortalezas", 3, "Algo que hago bien"), LS("A mejorar", 3, "Algo que quiero mejorar")] },
        { t: "Una sola cosa", a: "Elegí UNA cosa para mejorar en estas dos semanas.", w: "Mejorar una cosa a la vez da resultados.", f: [T("Lo que voy a mejorar", 8, "Voy a mejorar…")] },
        { t: "Entrada en calor", a: "Hacé la pausa de movimiento guiada como entrada en calor antes de entrenar.", w: "Prepararte bien baja el riesgo de lesión y mejora el rendimiento.", f: [AC("movimiento", "Pausa de movimiento guiada")] },
        { t: "Práctica con intención", a: "20 minutos trabajando solo esa cosa, con repeticiones y atención en lo que hacés.", w: "Practicar con intención rinde más que muchas horas distraído.", f: [TR(1200, "20 minutos de práctica enfocada"), CH("¿Cómo salió?", ["Mal", "Más o menos", "Bien"])] },
        { t: "Visualizá", a: "Cerrá los ojos 5 minutos e imaginá la jugada o el movimiento que querés mejorar, saliendo bien.", w: "Imaginar con detalle entrena el cerebro como el cuerpo.", f: [TR(300, "5 minutos visualizando"), T("Lo que imaginé", 8, "Me vi…")] },
        { t: "Respirá antes de rendir", a: "Hacé la respiración guiada para bajar los nervios antes de competir o entrenar fuerte.", w: "La respiración lenta baja la tensión.", f: [AC("calma", "Respiración para calmar")] },
        { t: "Tu rutina previa", a: "Armá tu rutina de 4 pasos antes de entrenar o competir y repetila siempre.", w: "Una rutina fija te da seguridad.", f: [LS("Mi rutina previa", 4, "Un paso")] },
        { t: "Recuperación", a: "Anotá cómo te recuperás: sueño, comida, hidratación y estiramiento.", w: "Se mejora cuando el cuerpo se recupera, no solo cuando entrena.", f: [CK(["Dormí lo que necesito", "Tomé agua", "Comí después de entrenar", "Estiré"])] },
        { t: "Anotá cómo te fue", a: "Después de entrenar o jugar, anotá qué salió bien y qué no.", w: "Lo que no se anota se olvida.", f: [CH("Hoy me sentí…", ["Flojo", "Normal", "Muy bien"]), T("Lo que salió bien", 6, "Me salió bien…"), T("Lo que quiero ajustar", 6, "Quiero ajustar…")] },
        { t: "Manejá el error", a: "Elegí una frase y un gesto para resetear después de un error y seguir.", w: "Cómo respondés al error pesa más que el error.", f: [T("Mi frase y mi gesto de reseteo", 8, "Cuando fallo, me digo…")] },
        { t: "Mirá tu avance", a: "Mirá tu gráfico y anotá 3 cosas que mejoraron.", w: "Ver el avance sostiene la motivación.", f: [LS("Lo que mejoró", 3, "Algo que noto mejor")] },
        { t: "Tu plan de entrenamiento", a: "Elegí tus 3 prácticas clave de la semana. Ese es tu plan para seguir.", w: "Lo que dura es lo que elegís vos.", f: [LS("Mis 3 prácticas clave", 3, "Una práctica")] }
      ]
    }
  ];
  var by = {}; L.forEach(function (p) { by[p.id] = p; });
  window.FormaProg = { list: L, byId: by, mins: mins };
})();
