"""Download the official, pinned Qwen VoiceDesign weights; no voice/API service."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
import time
import urllib.request
import argparse
import shutil

ROOT = Path(__file__).resolve().parents[1]
REPO = "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"
REVISION = "5ecdb67327fd37bb2e042aab12ff7391903235d3"
MODEL = ROOT / ".local/qwen/model"


def sha256(file):
    checksum = hashlib.sha256()
    with file.open("rb") as source:
        for chunk in iter(lambda: source.read(8 * 1024 * 1024), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def main():
    global REPO, REVISION, MODEL
    parser=argparse.ArgumentParser()
    parser.add_argument('--base-small',action='store_true')
    args=parser.parse_args()
    if args.base_small:
        REPO='Qwen/Qwen3-TTS-12Hz-0.6B-Base'
        REVISION='5d83992436eae1d760afd27aff78a71d676296fc'
        MODEL=ROOT/'.local/qwen/base-model'
    MODEL.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(f"https://huggingface.co/api/models/{REPO}/revision/{REVISION}?blobs=true")
    with urllib.request.urlopen(request, timeout=60) as response:
        info = json.load(response)
    if info["sha"] != REVISION:
        raise RuntimeError("The repository revision did not match the pinned source.")
    files = [file for file in info["siblings"] if file["rfilename"] != ".gitattributes"]

    def download(file):
        name = file["rfilename"]
        target = MODEL / name
        target.parent.mkdir(parents=True, exist_ok=True)
        expected = file.get("lfs", {}).get("sha256")
        existing=ROOT/'.local/qwen/model'/name
        if args.base_small and not target.exists() and expected and existing.exists() and sha256(existing)==expected:
            shutil.copyfile(existing,target)
        if target.exists() and target.stat().st_size == file["size"] and (not expected or sha256(target) == expected):
            print(f"CACHED {name}", flush=True)
        else:
            partial = target.with_suffix(target.suffix + ".part")
            for attempt in range(4):
                offset = partial.stat().st_size if partial.exists() else 0
                headers = {"User-Agent": "DoctorChart-Tutorial-Qwen-Setup", "Cache-Control": "no-cache"}
                if offset:
                    headers["Range"] = f"bytes={offset}-"
                url = f"https://huggingface.co/{REPO}/resolve/{REVISION}/{name}?download=true&request_time={int(time.time())}"
                try:
                    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=90) as response:
                        if response.status != 206:
                            offset = 0
                        elif not response.headers.get("Content-Range", "").startswith(f"bytes {offset}-"):
                            raise RuntimeError("Unexpected resumed byte range")
                        print(f"DOWNLOAD {name} {offset}/{file['size']}", flush=True)
                        progress = time.monotonic()
                        with partial.open("ab" if offset else "wb") as output:
                            while True:
                                chunk = response.read(4 * 1024 * 1024)
                                if not chunk:
                                    break
                                output.write(chunk)
                                offset += len(chunk)
                                if time.monotonic() - progress > 15:
                                    print(f"PROGRESS {name} {offset}/{file['size']} ({offset/file['size']:.0%})", flush=True)
                                    progress = time.monotonic()
                            output.flush()
                            os.fsync(output.fileno())
                    if partial.stat().st_size != file["size"]:
                        raise RuntimeError("Incomplete model file")
                    if expected and sha256(partial) != expected:
                        raise RuntimeError("Model checksum mismatch; the partial file was retained for inspection")
                    partial.replace(target)
                    print(f"VERIFIED {name}", flush=True)
                    break
                except Exception as error:
                    print(f"RETRY {name} attempt={attempt+1} error={type(error).__name__}", flush=True)
                    if attempt == 3:
                        raise RuntimeError(f"Could not download/verify {name}") from None
                    time.sleep(2)
        return {"file": name, "bytes": target.stat().st_size, "sha256": sha256(target)}

    with ThreadPoolExecutor(max_workers=2) as pool:
        verified = list(pool.map(download, files))
    provenance = {"repo_id": REPO, "revision": REVISION, "license": "Apache-2.0", "source": f"https://huggingface.co/{REPO}", "files": verified, "speech_service": None, "user_voice_reference": None}
    (ROOT / ("docs/qwen-base-provenance.json" if args.base_small else "docs/qwen-provenance.json")).write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print("MODEL_READY " + str(MODEL), flush=True)


if __name__ == "__main__":
    main()
