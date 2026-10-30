"""Generate a short, locally designed Spanish voice; preserve the tutorial montage."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import subprocess
import threading
import time

ROOT = Path(__file__).resolve().parents[1]
os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

TEXT = (
    "DoctorChart, de Bycode, te ayuda a organizar la atención de tus pacientes. "
    "Para empezar, abrimos Nuevo paciente y completamos los datos obligatorios. "
    "Antes de guardar, revisamos el nombre, el documento y la fecha de nacimiento. "
    "Después, desde la ficha, podemos registrar la primera consulta, cargar las mediciones "
    "y consultar la evolución. Todo queda asociado al paciente para encontrarlo cuando lo necesites."
)
SPOKEN_TEXT = TEXT.replace("DoctorChart", "Doctor Chart").replace("Bycode", "baicode")
STYLES = {
    "masculina": "A native Latin American Spanish male speaker in his thirties with a natural Argentine accent. Warm, clear mid-range voice. He explains medical software to a colleague in a relaxed, conversational and confident way. Fluid connected sentences with natural varied intonation, small meaningful pauses and a brisk but comfortable pace. Clean close-microphone studio sound.",
    "femenina": "A native Latin American Spanish female speaker in her thirties with a natural Argentine accent. Warm, clear mid-range voice. She explains medical software to a colleague in a relaxed, conversational and confident way. Fluid connected sentences with natural varied intonation, small meaningful pauses and a brisk but comfortable pace. Clean close-microphone studio sound.",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", choices=list(STYLES), default="masculina")
    parser.add_argument("--smoke", action="store_true")
    parser.add_argument("--seed", type=int, default=20261030)
    parser.add_argument("--job-file", type=Path)
    args = parser.parse_args()
    print("Importando el generador local...", flush=True)
    import numpy as np
    import soundfile as sf
    import torch
    from qwen_tts import Qwen3TTSModel

    if not torch.cuda.is_available():
        raise RuntimeError("PyTorch no encuentra CUDA. No se inició una generación lenta en CPU.")
    torch.set_num_threads(4)
    torch.manual_seed(args.seed)
    torch.cuda.manual_seed_all(args.seed)
    torch.cuda.reset_peak_memory_stats()
    model_dir = ROOT / ".local/qwen/model"
    job = json.loads(args.job_file.read_text(encoding="utf-8")) if args.job_file else None
    if job:
        args.voice = job["voice"]
        if args.voice not in STYLES or not isinstance(job["text"], str) or len(job["text"]) > 2000:
            raise RuntimeError("Invalid isolated voice job.")
    display_text = job["text"] if job else TEXT
    text = display_text.replace("DoctorChart", "Doctor Chart").replace("Bycode", "baicode").replace("bycode", "baicode")
    if args.smoke:
        text = "Doctor Chart, de baicode. Abrimos la ficha del paciente y revisamos sus datos."
    output_stem = "qwen-prueba-corta" if args.smoke else "qwen-voz-" + args.voice
    output = Path(job["output"]) if job else ROOT / "qa" / (output_stem + ".wav")
    output.parent.mkdir(exist_ok=True)
    raw_dir = ROOT / ".local/qwen/outputs"
    raw_dir.mkdir(exist_ok=True)
    run_id = time.strftime("%Y%m%d-%H%M%S")
    raw_path = raw_dir / f"{output_stem}-{run_id}.wav"
    print(json.dumps({"gpu": torch.cuda.get_device_name(0), "torch": torch.__version__, "cuda": torch.version.cuda, "free_vram_mib": round(torch.cuda.mem_get_info()[0]/1024**2), "voice": args.voice}, ensure_ascii=False), flush=True)
    started = time.monotonic()
    model = Qwen3TTSModel.from_pretrained(str(model_dir), device_map="cuda:0", dtype=torch.bfloat16, attn_implementation="sdpa", local_files_only=True)
    load_seconds = time.monotonic() - started
    print(f"Modelo cargado en {load_seconds:.1f} s. Generando la muestra...", flush=True)
    finished = threading.Event()

    def heartbeat():
        while not finished.wait(15):
            print(f"GENERANDO {time.monotonic()-started-load_seconds:.0f}s · VRAM asignada {torch.cuda.memory_allocated()/1024**2:.0f} MiB", flush=True)

    thread = threading.Thread(target=heartbeat, daemon=True)
    thread.start()
    synthesis_start = time.monotonic()
    token_limit = min(2048,max(384,len(text.split())*9)) if job else 768 if not args.smoke else 256
    try:
        with torch.inference_mode():
            wavs, sample_rate = model.generate_voice_design(text=text, language="Spanish", instruct=STYLES[args.voice], non_streaming_mode=True, max_new_tokens=token_limit)
        torch.cuda.synchronize()
    finally:
        finished.set()
    synthesis_seconds = time.monotonic() - synthesis_start
    waveform = np.asarray(wavs[0], dtype=np.float32)
    if not np.isfinite(waveform).all() or waveform.size < sample_rate or float(np.max(np.abs(waveform))) < .005:
        raise RuntimeError("El generador no produjo audio válido; no se reemplazó ninguna muestra.")
    if len(waveform)/sample_rate >= token_limit*.08-.3:
        raise RuntimeError("La generación alcanzó su límite. Revisá o dividí ese guion antes de guardar una toma posiblemente incompleta.")
    sf.write(raw_path, waveform, sample_rate, subtype="FLOAT")
    ffmpeg = next((ROOT / ".local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries").glob("*.exe"))
    normalized = raw_dir / f"{output_stem}-{run_id}-48k.wav"
    subprocess.run([str(ffmpeg), "-v", "error", "-y", "-i", str(raw_path), "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(normalized)], check=True, timeout=90)
    if output.exists():
        prior = raw_dir / f"{output_stem}-previous-{run_id}.wav"
        output.replace(prior)
    output.write_bytes(normalized.read_bytes())
    audio, rate = sf.read(output, always_2d=True)
    rms = float(np.sqrt(np.mean(audio**2)))
    report = {
        "status": "TECHNICAL_PASS_LISTENING_REVIEW_PENDING", "engine": "Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        "voice": args.voice, "designed_voice": True, "user_voice_reference": None, "external_speech_api": None,
        "text": text, "display_text": display_text if not args.smoke else text, "voice_instruction": STYLES[args.voice], "seed": args.seed,
        "gpu": torch.cuda.get_device_name(0), "torch": torch.__version__, "cuda": torch.version.cuda,
        "attention": "sdpa", "precision": "bfloat16", "load_seconds": round(load_seconds,2), "synthesis_seconds": round(synthesis_seconds,2),
        "peak_vram_allocated_mib": round(torch.cuda.max_memory_allocated()/1024**2), "peak_vram_reserved_mib": round(torch.cuda.max_memory_reserved()/1024**2),
        "duration_seconds": round(len(audio)/rate,3), "sample_rate": rate, "channels": audio.shape[1], "rms_dbfs": round(20*np.log10(max(rms,1e-12)),2), "sample_peak_dbfs": round(20*np.log10(max(float(np.max(np.abs(audio))),1e-12)),2),
        "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "output": str(output.relative_to(ROOT)), "raw_output": str(raw_path.relative_to(ROOT)),
        "review": "La naturalidad, el acento y la pronunciación requieren escuchar esta muestra. No se reemplazó el audio ni el guion del montaje."
    }
    output.with_suffix('.json').write_text(json.dumps(report, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
