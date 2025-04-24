// Ein einfaches Node.js-Skript, um Platzhalter-Icons zu generieren
// Sie können dieses Skript mit 'node generate_icons.js' ausführen

const fs = require('fs');
const { createCanvas } = require('canvas');

// Funktion zum Erstellen eines einfachen Icons
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Asana-ähnliche Blaufarbe
  ctx.fillStyle = '#4573D5';
  ctx.fillRect(0, 0, size, size);
  
  // Weißer Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', size/2, size/2);
  
  // Als PNG speichern
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon${size}.png`, buffer);
  console.log(`Icon mit Größe ${size}x${size} erstellt`);
}

// Alle erforderlichen Icon-Größen erstellen
createIcon(16);
createIcon(48);
createIcon(128);

console.log('Alle Icons wurden erstellt. Sie können diese Dateien in das images-Verzeichnis kopieren.');