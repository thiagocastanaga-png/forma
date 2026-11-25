#!/bin/sh
# Copia la app web a www/ y sincroniza con Android/iOS
set -e
cd "$(dirname "$0")"
rm -rf www && mkdir www
SRC=..
for f in miforma.html herramientas.js miforma.js miforma.css dia.js programas.js frases.js config.js icon-192.png icon-512.png privacidad.html terminos.html arrepentimiento.html eliminar-cuenta.html style.css common.js manifest.webmanifest; do cp "$SRC/$f" www/ ; done
cp www/miforma.html www/index.html
npx cap sync
