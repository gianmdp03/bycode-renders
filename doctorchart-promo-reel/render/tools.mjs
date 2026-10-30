import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const compositor=path.dirname(require.resolve('@remotion/compositor-win32-x64-msvc/package.json'));
export const ffmpeg=process.env.FFMPEG_PATH??path.join(root,'.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe');
export const ffprobe=process.env.FFPROBE_PATH??path.join(compositor,'ffprobe.exe');
export const python=process.env.REEL_PYTHON??path.join(root,'.local/voice-venv/Scripts/python.exe');
