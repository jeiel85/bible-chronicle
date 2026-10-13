#!/usr/bin/env python3
"""Makes illustrations with an external image agent from a list of jobs (the ripple-garden method).

A job file is a JSON list of {"id", "kind": "scene"|"sheet", "prompt", "refs": [image paths]}.
- scene: an opaque painterly widescreen scene (Historic Moments, place backgrounds).
- sheet: a character or costume reference sheet on a plain parchment background, used as the
  reference ("refs") for later scenes so faces and clothing stay the same between pictures.
Each job runs one `codex exec` (Codex CLI image generation) and the picture it generates is copied to
OUT/<id>.png. A job whose OUT/<id>.png already exists is skipped, so a run can be repeated.

When Codex cannot draw (its 24-hour image limit, or no picture came back) the job falls back to the
Antigravity CLI (`agy -p`, Gemini image generation). `--backend agy` skips Codex.

Rules learnt in ripple-garden (tools/codex_images.py there):
- stdin is always closed: `codex exec` waits for piped input when it inherits an open stdin.
- Codex' own sandboxed shell fails on this PC, so the picture is read from the path Codex prints.
- References are expensive (about 45 000 tokens each): give ONE small reference picture per job,
  several references side by side in one picture if needed.
- agy keeps pictures under ~/.gemini/antigravity-cli/brain where other sessions may draw at the same time,
  so only the path agy prints for this job is used.

Generated pictures are drafts: they get `historicalAccuracyStatus: not_verified` until reviewed
(docs/17_ART_PIPELINE.md).

    python tools/codex_images.py JOBS.json OUT_DIR [workers] [--backend codex|agy]
"""
import json
import os
import re
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Optional

from PIL import Image

MODEL = "gpt-5.6-luna"
EFFORT = "low"
AGY_MODEL = "gemini-3.8-flash-low"

# The shared style (docs/07_ART_DIRECTION.md, docs/17_ART_PIPELINE.md). Kept here so every job gets the same.
STYLE = ("ORIGINAL painterly 2D historical educational illustration of the ancient Near East, "
         "warm natural light, sandstone / ochre / indigo / deep teal / parchment palette, "
         "people with ancient Near Eastern (Semitic, Mesopotamian, Egyptian as the scene requires) appearance, "
         "period-plausible clothing and architecture, no modern objects, no halos, "
         "no text, no letters, no captions, no watermark, no UI, not a video game screenshot. ")
KIND = {
    "scene": ("Use the image generation tool to draw ONE image. A cinematic widescreen LANDSCAPE panorama "
              "in 16:9 aspect ratio (wider than tall, not an ultra-wide strip) with a low horizon, full-bleed with no border, frame or torn-paper edge; keep the "
              "main subject inside the central third so the picture can also be cropped to 4:5 portrait. " + STYLE),
    "sheet": ("Use the image generation tool to draw ONE image. A character reference sheet on a plain flat "
              "parchment background: the same person shown full body front, three-quarter and side, plus a "
              "head close-up, consistent face and clothing in every view, even lighting. " + STYLE),
}
LIMIT_WORDS = ("usage limit", "usage_limit", "rate limit", "429", "한도")
# A picture path agy prints: plain or inside a file:// link, Windows or POSIX.
AGY_PATH_RE = re.compile(r"(?<![A-Za-z/])((?:[A-Za-z]:[\\/]|/)[^\s()\[\]\"'`]*antigravity-cli[\\/]brain[\\/][^\s()\[\]\"'`]+\.(?:png|jpe?g|webp))")


def generated_path(stdout: str) -> Optional[Path]:
    for line in reversed(stdout.splitlines()):
        text = line.strip().strip("`").strip('"').strip("'")
        if text.endswith(".png") and "generated_images" in text and Path(text).exists():
            return Path(text)
    return None


def agy_paths(stdout: str) -> list[str]:
    """The picture paths in agy's output, file:// links turned into plain paths."""
    text = re.sub(r"file:///([A-Za-z]:)", lambda match: match.group(1), stdout).replace("file://", "")
    return [os.path.normpath(match) for match in AGY_PATH_RE.findall(text)]


def prompt_for(job: dict) -> str:
    kind = job.get("kind", "scene")
    if kind not in KIND:
        raise ValueError(f"{job['id']}: unknown kind {kind!r} (scene|sheet)")
    return KIND[kind] + job["prompt"]


def run_agy(job: dict, dest: Path, work: Path) -> str:
    refs = [Path(ref).resolve() for ref in job.get("refs", [])]
    prompt = prompt_for(job) + " Do not save or move any file; reply with the generated file path."
    for ref in refs:
        prompt += f" Reference image (same people, clothing and style): {ref}"
    cmd = ["agy", "-p", prompt, "--model", AGY_MODEL, "--print-timeout", "540s"]
    for ref in refs:
        cmd += ["--add-dir", str(ref.parent)]
    try:
        result = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=600, cwd=work,
                                shell=(os.name == "nt"), encoding="utf-8", errors="replace")
    except subprocess.TimeoutExpired:
        return "FAILED agy timeout"
    paths = [p for p in agy_paths(result.stdout) if Path(p).exists()]
    if not paths:
        return "FAILED agy: " + result.stdout[-200:]
    Image.open(paths[-1]).convert("RGB").save(dest)
    return "ok (agy)"


def run(job: dict, out: Path, backend: str = "codex") -> tuple[str, str]:
    dest = out / f"{job['id']}.png"
    if dest.exists():
        return job["id"], "exists"
    work = out / "_work"
    work.mkdir(exist_ok=True)
    if backend == "agy":
        return job["id"], run_agy(job, dest, work)
    cmd = ["codex", "exec", "--skip-git-repo-check", "-s", "workspace-write", "-C", str(work),
           "-m", MODEL, "-c", f'model_reasoning_effort="{EFFORT}"']
    for ref in job.get("refs", []):
        cmd += ["-i", str(ref)]
    cmd += ["--", prompt_for(job) + " Reply with only the generated file path."]
    last = ""
    for _ in range(2):  # one retry
        try:
            result = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=600,
                                    shell=(os.name == "nt"), encoding="utf-8", errors="replace")
        except subprocess.TimeoutExpired:
            last = "timeout"
            continue
        picture = generated_path(result.stdout)
        if picture is not None:
            shutil.copy(picture, dest)
            return job["id"], "ok"
        # Codex prints its own errors (the usage limit among them) on stderr, not stdout.
        output = result.stdout + result.stderr
        last = output[-200:]
        if any(word in output.lower() for word in LIMIT_WORDS):
            break  # Codex' usage or image limit: retrying will not help
    return job["id"], run_agy(job, dest, work) + f" after codex failed ({last.strip()[-80:]})"


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("jobs")
    parser.add_argument("out")
    parser.add_argument("workers", nargs="?", type=int, default=3)
    parser.add_argument("--backend", choices=["codex", "agy"], default="codex")
    options = parser.parse_args()
    jobs = json.loads(Path(options.jobs).read_text(encoding="utf-8"))
    for job in jobs:
        prompt_for(job)  # fail on a bad kind before any picture is drawn
    out = Path(options.out)
    out.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(options.workers) as pool:
        for job_id, status in pool.map(lambda job: run(job, out, options.backend), jobs):
            print(job_id, status, flush=True)


if __name__ == "__main__":
    main()
