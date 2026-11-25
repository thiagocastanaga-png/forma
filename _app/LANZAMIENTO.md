# Forma · apps de Android y iPhone

La app nativa es la misma app web (`miforma`) dentro de Capacitor, más dos cosas nativas:
- **Avisos del celular**: cada momento del día, el paso del objetivo, racha en peligro, cierre del día y vencimiento de Pro. Se programan en el propio celular (no hace falta servidor) para los próximos 3 días, y se vuelven a programar cada vez que se abre la app.
- **Widget de Android** (`FormaWidgetProvider`): muestra el momento actual, lo que sigue, tu paso del día y tu racha. Se actualiza solo cuando cambia el momento del día.
- **Sensación de app**: el botón "atrás" de Android cierra lo que está abierto, vuelve dentro de cada herramienta y recién en Hoy minimiza la app; vibración suave al tocar y al completar un paso; sin zoom ni selección de texto en botones.

## Compilar (en una compu con Node y Android Studio)
1. `cd _app && npm install`
2. `./sync.sh` (copia la web desde la raíz del repo a `www/` y sincroniza Android e iOS)
3. Android: `npx cap open android` → Build → Generate Signed App Bundle.

## Antes de subir a Google Play
1. Cuenta de Google Play Console (pago único USD 25).
2. Crear la clave de firma (keystore) y guardarla en dos lugares. Si se pierde, no se puede actualizar la app.
3. Cuentas personales nuevas: Google exige una prueba cerrada con 12 personas durante 14 días antes de publicar.
4. En cada versión nueva, subir `versionCode` en `android/app/build.gradle`.
5. Compras: Google exige su propio sistema de cobro para contenido digital. Por eso la app nativa no vende Forma Pro: quien ya lo tiene inicia sesión y se le activa solo.

## iPhone
- Hace falta una Mac con Xcode y una cuenta de Apple Developer (USD 99 por año).
- El widget de iPhone todavía no está hecho: hay que sumar una extensión de WidgetKit en Xcode.
- Apple pide su propio sistema de cobro para vender Pro dentro de la app.
