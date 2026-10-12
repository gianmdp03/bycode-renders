import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';

const root = path.resolve(import.meta.dirname, '..');
const css = fs.readFileSync(path.join(root, 'public/fonts/google-sans-source.css'), 'utf8');
for (const match of css.matchAll(/font-weight: (\d+);[\s\S]*?url\(([^)]+)\)/g)) {
  const res = await fetch(match[2]);
  if (!res.ok) throw new Error(`Font download failed: ${res.status}`);
  fs.writeFileSync(path.join(root, `public/fonts/google-sans-${match[1]}.ttf`), Buffer.from(await res.arrayBuffer()));
}
const qr = await QRCode.toString('https://pointly.example/join/1', {type: 'svg', errorCorrectionLevel: 'H', margin: 2, width: 360, color: {dark: '#1F1F1F', light: '#FFFFFF'}});
fs.writeFileSync(path.join(root, 'public/qr-demo.svg'), qr);
console.log('Local fonts and a demo-only QR prepared.');
