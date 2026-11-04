/* Forma · programas de 14 días (contenido). Cada paso: t = título, a = qué hacer, w = por qué sirve, tool = actividad guiada opcional. */
(function () {
  var L = [
    {
      id: "dormir", n: "Dormir de verdad", tag: "Sueño",
      intro: "14 días para ordenar tu sueño con un cambio chico por día. No hace falta hacerlo perfecto: cada paso se suma al anterior.",
      q: "¿Cómo dormiste esta última semana?", lo: "Muy mal", hi: "Muy bien", better: "up",
      note: "Si hace más de tres meses que dormís mal, roncás fuerte con pausas al respirar o estás muy cansado durante el día, consultá con un médico. Esto es un apoyo de hábitos y no reemplaza a un profesional.",
      days: [
        { t: "Mirá cómo estás", a: "Anotá a qué hora te acostaste y a qué hora te despertaste hoy. Todavía no cambies nada.", w: "Para ordenar el sueño primero hay que ver tu patrón real." },
        { t: "Una hora fija para levantarte", a: "Elegí una hora de levantarte que puedas sostener todos los días, también el finde (con una hora de diferencia como máximo).", w: "La hora fija de despertar es lo que más ordena tu reloj interno." },
        { t: "Luz de mañana", a: "En la primera hora después de levantarte, salí 10 minutos afuera o pegate a una ventana.", w: "La luz de la mañana le marca al cuerpo cuándo empieza el día y ayuda a que de noche te dé sueño." },
        { t: "Hora de corte para la cafeína", a: "Elegí hasta qué hora tomás café, mate o energizantes. Una regla simple: nada en las 8 horas antes de acostarte.", w: "La cafeína tarda muchas horas en irse del cuerpo, aunque te duermas igual." },
        { t: "Cena liviana y temprana", a: "Cená por lo menos 2 horas antes de acostarte, sin comidas muy pesadas ni alcohol.", w: "Digerir mucho y tomar alcohol fragmentan el sueño y te despiertan de madrugada." },
        { t: "Un cuarto para dormir", a: "Oscuro, fresco y silencioso: tapá las luces chicas, bajá la temperatura y sacá el celular de la cama.", w: "El cuarto cuenta: con poca luz y fresco te dormís más fácil y te despertás menos." },
        { t: "45 minutos sin pantallas", a: "Esta noche, 45 minutos antes de acostarte dejá el celular lejos y apagá la tele. Hacé algo tranquilo: ducha, leer, estirar.", w: "La luz y el contenido te mantienen activo y te atrasan el sueño." },
        { t: "Descarga mental", a: "Antes de dormir, escribí en papel todo lo que te da vueltas y UNA cosa para mañana. Cerrá la libreta.", w: "Dejar lo pendiente escrito baja la cabeza que no para.", tool: "cierre" },
        { t: "Tu rutina de bajada", a: "Hacé la rutina guiada para bajar el ritmo y repetila siempre a la misma hora.", w: "Repetir la misma secuencia le avisa al cuerpo que se acerca el sueño.", tool: "dormir" },
        { t: "Respirar para soltar", a: "Ya acostado, respirá lento durante 3 minutos: inhalá 4 segundos y soltá 6.", w: "Soltar el aire más largo baja la activación del cuerpo.", tool: "calma" },
        { t: "Si no te dormís", a: "Si pasaron unos 20 minutos y seguís despierto, levantate y andá a otro cuarto con luz tenue. Hacé algo aburrido hasta que te dé sueño. No mires la hora ni el celular.", w: "Para que la cama quede asociada a dormir y no a dar vueltas." },
        { t: "Siesta con límite", a: "Si dormís siesta, que sea de menos de 30 minutos y antes de las 16. Si no la necesitás, mejor.", w: "Una siesta larga o tarde le saca sueño a la noche." },
        { t: "Moverte de día", a: "Hoy movete al menos 20 minutos (una caminata alcanza), mejor antes del atardecer. Evitá el entrenamiento fuerte justo antes de dormir.", w: "Moverse de día mejora el sueño profundo.", tool: "movimiento" },
        { t: "Tu propia rutina", a: "Mirá qué pasos te sirvieron y elegí tus 3 favoritos para mantener. Anotalos donde los veas.", w: "Lo que dura es lo que elegís vos, no la lista completa." }
      ]
    },
    {
      id: "celular", n: "Celular bajo control", tag: "Atención",
      intro: "14 días para usar el celular vos y que no te use a vos. Cambios chicos, uno por día, sin prohibirte nada.",
      q: "¿Cuánto control sentís que tenés sobre tu celular?", lo: "Nada", hi: "Mucho", better: "up",
      note: "Es un apoyo de hábitos. Si sentís que no podés controlar el uso aunque lo intentes y te afecta mucho, consultá con un profesional.",
      days: [
        { t: "Medí sin cambiar nada", a: "Abrí el tiempo de pantalla de tu celular (Tiempo de uso o Bienestar digital) y anotá tu promedio diario y tus 3 apps más usadas.", w: "Lo que no se mide, se subestima." },
        { t: "¿Para qué lo usás?", a: "Mirá esas 3 apps y marcá cuáles te suman y cuáles son solo para pasar el rato.", w: "Saber qué querés sostener y qué querés soltar hace todo más fácil." },
        { t: "Menos notificaciones", a: "Apagá las notificaciones de todo, salvo personas y cosas importantes (mensajes, banco, calendario).", w: "Cada aviso te corta lo que estabas haciendo." },
        { t: "Primera media hora libre", a: "Al despertar, no mires redes ni mails por 30 minutos. Primero agua y luz.", w: "Empezar el día reaccionando al celular te deja con la cabeza de otros." },
        { t: "Cargador fuera de la cama", a: "Cargá el celular lejos de la cama y usá un despertador común.", w: "Es de lo que más ayuda a dormir mejor y a no scrollear de noche." },
        { t: "Pantalla de inicio limpia", a: "Sacá redes y juegos de la primera pantalla y dejalos en una carpeta al fondo.", w: "Un poco de fricción alcanza para que no abras la app sin pensar." },
        { t: "Un límite realista", a: "Poné un límite diario a tu app más usada, 30% menos que tu promedio actual.", w: "Un límite alcanzable se sostiene; uno exagerado se abandona." },
        { t: "Una comida sin celular", a: "Hoy comé al menos una comida sin el celular a la vista.", w: "Recupera tiempo de atención con los que tenés al lado." },
        { t: "Tus dos momentos", a: "Elegí dos momentos del día para las redes (por ejemplo 13 y 20 hs). Fuera de eso, solo lo necesario.", w: "Decidir cuándo, en lugar de abrir cada vez que podés." },
        { t: "Cuando te dan ganas", a: "Cuando sientas ganas de agarrarlo sin motivo, respirá tres veces y preguntate qué necesitás ahora. Después decidí.", w: "Entre las ganas y el gesto hay un espacio: lo estás entrenando.", tool: "respirar" },
        { t: "Pantalla en blanco y negro", a: "Poné hoy la pantalla en escala de grises (en Accesibilidad).", w: "Sin colores, las apps resultan menos atractivas." },
        { t: "Un reemplazo", a: "Elegí algo para hacer en los momentos de aburrimiento: leer 5 páginas, caminar o llamar a alguien.", w: "Si solo sacás el hábito, queda un hueco. Hay que ponerle algo." },
        { t: "Una hora sin celular", a: "Hacé algo que te guste durante una hora entera con el celular en otra habitación.", w: "Te muestra lo que se siente tener la atención entera." },
        { t: "Tus reglas", a: "Elegí 3 reglas que vas a mantener y volvé a mirar tu tiempo de pantalla para comparar con el día 1.", w: "Lo que elegís vos se mantiene." }
      ]
    },
    {
      id: "arrancar", n: "Arrancar", tag: "Foco",
      intro: "14 días para dejar de postergar. Empezás con pasos tan chicos que no dan excusa, y construís desde ahí.",
      q: "¿Qué tan fácil te resulta empezar lo que tenés que hacer?", lo: "Muy difícil", hi: "Muy fácil", better: "up",
      note: "Si postergar te viene acompañado de mucho malestar o de un cansancio que no se va, puede haber algo más y vale la pena consultarlo con un profesional.",
      days: [
        { t: "Elegí una sola cosa", a: "Escribí la cosa que más venís postergando. Una sola.", w: "Con una lista larga no se empieza ninguna." },
        { t: "Hacela diminuta", a: "Escribí el primer paso más chico posible, de menos de 2 minutos (abrir el archivo, juntar los papeles).", w: "El obstáculo suele ser empezar, no la tarea entera." },
        { t: "La regla de los 2 minutos", a: "Hacé ahora ese primer paso. Solo ese. Después podés parar.", w: "Cuando arrancás, seguir es mucho más fácil." },
        { t: "25 minutos de foco", a: "Un bloque de 25 minutos con una sola tarea y el celular lejos.", w: "Un tiempo corto y con final es más fácil de aceptar.", tool: "foco" },
        { t: "Dejalo listo de noche", a: "Dejá preparado hoy lo de mañana: el archivo abierto, la ropa, los papeles.", w: "Menos decisiones a la mañana, menos excusas." },
        { t: "La prioridad del día", a: "Al empezar el día elegí UNA cosa que, si la hacés, el día valió la pena. Hacela primero.", w: "Primero lo importante, antes de que el día se llene." },
        { t: "Dividí lo grande", a: "Tomá una tarea grande y partila en 3 a 5 pasos chicos que arranquen con un verbo: llamar, escribir, enviar.", w: "Un paso claro se puede hacer; una montaña no." },
        { t: "Sacá las distracciones", a: "Antes de empezar, cerrá pestañas, silenciá el celular y poné agua al lado.", w: "Es más fácil sacar la distracción que resistirla." },
        { t: "Si no tenés ganas", a: "Prometete 5 minutos. Si pasados los 5 querés parar, parás. Casi nunca pasa.", w: "La motivación suele llegar después de empezar, no antes." },
        { t: "Una hora para lo importante", a: "Elegí un horario fijo para tu tarea más importante y ponelo en el calendario.", w: "Un horario fijo evita tener que decidirlo todos los días." },
        { t: "Foco y pausa de verdad", a: "Hacé 25 minutos de foco y después una pausa de 5 minutos real: caminar o tomar agua, sin celular.", w: "Descansar bien es parte de rendir.", tool: "foco" },
        { t: "Terminá a medias", a: "Al cortar, dejá escrito cuál es el próximo paso para arrancar fácil mañana.", w: "Empezar desde algo ya empezado cuesta menos." },
        { t: "Mirá lo hecho", a: "Anotá 3 cosas que hiciste hoy. Cuenta lo hecho, no lo que falta.", w: "Ver avance te da ganas de seguir." },
        { t: "Tu sistema", a: "Elegí las 3 técnicas que más te funcionaron y anotalas donde las veas.", w: "Lo que funciona para vos es lo que queda." }
      ]
    },
    {
      id: "calma", n: "Calmar la cabeza", tag: "Calma",
      intro: "14 días con herramientas simples para bajar la tensión cotidiana. Probás, te quedás con lo que te sirve y armás tu propio kit.",
      q: "¿Cuánta tensión o ansiedad sentiste esta semana?", lo: "Poca", hi: "Mucha", better: "down",
      note: "Es un apoyo de bienestar y no reemplaza a un profesional de la salud mental. Si la ansiedad te impide hacer tu vida o sentís que no podés más, hablá con un profesional. Si es una urgencia, llamá al 911.",
      days: [
        { t: "Ponele nombre", a: "Anotá qué sentís y dónde lo notás en el cuerpo (pecho, panza, mandíbula). Sin juzgarlo.", w: "Nombrar lo que pasa le baja intensidad." },
        { t: "Un minuto de respiración", a: "Hacé la respiración guiada de un minuto, de manera lenta y cómoda.", w: "Es la herramienta más rápida que tenés a mano.", tool: "respirar" },
        { t: "Soltar el cuerpo", a: "Apretá fuerte los puños 5 segundos y soltá. Repetí con hombros, mandíbula y panza.", w: "Tensar y soltar enseña al cuerpo cómo se siente soltar." },
        { t: "5-4-3-2-1", a: "Nombrá 5 cosas que ves, 4 que tocás, 3 que escuchás, 2 que olés y 1 que saboreás.", w: "Te trae al presente cuando la cabeza se va adelante." },
        { t: "Escribí la preocupación", a: "Escribila en una hoja y preguntate: ¿puedo hacer algo hoy? Si sí, anotá el primer paso. Si no, dejala escrita y soltala.", w: "Separar lo que se puede hacer de lo que no baja la rumiación." },
        { t: "Caminar 10 minutos", a: "Caminá 10 minutos sin celular, mirando alrededor.", w: "Moverte baja la tensión acumulada.", tool: "movimiento" },
        { t: "Respiración larga", a: "Hacé la respiración guiada para calmar, de unos 3 minutos.", w: "Exhalar largo activa la parte del cuerpo que descansa.", tool: "calma" },
        { t: "Mirá tu cafeína", a: "Fijate cuánta cafeína tomás hoy. Si estás tenso, probá con la mitad.", w: "Para algunas personas la cafeína sube la ansiedad." },
        { t: "Hablar con alguien", a: "Contale a una persona de confianza cómo te sentís, aunque sea en dos frases.", w: "Compartir descomprime." },
        { t: "Un límite chico", a: "Decí que no a una cosa chica hoy o pedí un tiempo.", w: "Los límites chicos protegen tu energía." },
        { t: "Qué sí controlo", a: "Escribí 3 cosas de hoy que dependen de vos y una que no. Concentrate en las 3.", w: "Poner la energía donde se puede cambiar algo." },
        { t: "Dos pausas en el día", a: "Poné dos pausas de 2 minutos en tu día solo para respirar.", w: "Pausas cortas y repetidas evitan que la tensión se acumule.", tool: "respirar" },
        { t: "Cerrar el día en calma", a: "Antes de dormir, 10 minutos sin pantallas haciendo algo que te tranquilice.", w: "Un cierre tranquilo cambia cómo arrancás mañana.", tool: "cierre" },
        { t: "Tu kit", a: "Elegí tus 3 herramientas favoritas y anotalas: ese es tu kit para cuando llegue la tensión.", w: "Tener un plan a mano hace que cuesten menos los días difíciles." }
      ]
    }
  ];
  var by = {}; L.forEach(function (p) { by[p.id] = p; });
  window.FormaProg = { list: L, byId: by };
})();
