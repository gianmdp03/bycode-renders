import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

for (const weight of ['400', '500', '700']) {
  loadFont({family: 'Google Sans', url: staticFile(`fonts/google-sans-${weight}.ttf`), weight});
}

export const T = {
  blue: '#1A73E8', blueHover: '#1557B0', pale: '#E8F0FE', ink: '#1F1F1F',
  secondary: '#5F6368', line: '#E2E8F0', strongLine: '#C4C7C5', white: '#FFFFFF',
  canvas: '#F8F9FA', green: '#13865B', greenPale: '#ECF8F1', gold: '#9B6B10',
  goldPale: '#FFF6D9', silver: '#566575', silverPale: '#F0F3F6',
  bronze: '#99582D', bronzePale: '#FFF1E7', dark: '#131314',
  font: '"Google Sans", "Inter", sans-serif',
  border: '1.5px solid #E2E8F0', shadow: '0 12px 40px rgba(31,47,68,0.07)',
};
