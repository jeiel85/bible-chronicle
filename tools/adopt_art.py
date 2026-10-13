#!/usr/bin/env python3
"""Adopts a reviewed generated picture into the game (docs/17_ART_PIPELINE.md §4).

Converts art_out/<batch>/<id>.png to art/<category>/<id>.webp (at most 1920 px wide) and records it in
art/manifest.json with the prompt and references it was made from, taken from the request file. A picture
is adopted only after a person reviewed it against docs/17 §3; the manifest keeps it `not_verified` for
history and `usage_terms_check_required` for rights until those reviews are done.

    python tools/adopt_art.py REQUESTS.json ID CATEGORY GENERATOR [--subject EVENT_OR_MOMENT_ID] [--note TEXT]
"""
import argparse
import json
from datetime import date
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "art" / "manifest.json"
CATEGORIES = ("moments", "places", "characters", "community")
MAX_WIDTH = 1920
QUALITY = 82


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("requests", type=Path)
    parser.add_argument("id")
    parser.add_argument("category", choices=CATEGORIES)
    parser.add_argument("generator", choices=("codex", "agy"))
    parser.add_argument("--subject", help="the moment or episode id the picture shows")
    parser.add_argument("--note", default="", help="what the review found")
    options = parser.parse_args()

    job = next((job for job in json.loads(options.requests.read_text(encoding="utf-8")) if job["id"] == options.id), None)
    if job is None:
        raise SystemExit(f"{options.id} is not in {options.requests}")
    source = ROOT / "art_out" / options.requests.stem.removesuffix("_sheets").removesuffix("_moments") / f"{options.id}.png"
    if not source.exists():
        matches = list((ROOT / "art_out").glob(f"*/{options.id}.png"))
        if len(matches) != 1:
            raise SystemExit(f"cannot find the generated picture for {options.id} under art_out/")
        source = matches[0]

    picture = Image.open(source).convert("RGB")
    if picture.width > MAX_WIDTH:
        picture = picture.resize((MAX_WIDTH, round(picture.height * MAX_WIDTH / picture.width)), Image.LANCZOS)
    dest = ROOT / "art" / options.category / f"{options.id}.webp"
    dest.parent.mkdir(parents=True, exist_ok=True)
    picture.save(dest, "WEBP", quality=QUALITY, method=6)

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {"assets": []}
    manifest["assets"] = [asset for asset in manifest["assets"] if asset["assetId"] != options.id]
    manifest["assets"].append({
        "assetId": options.id,
        "category": options.category,
        "file": dest.relative_to(ROOT).as_posix(),
        "pixelSize": [picture.width, picture.height],
        "subjectId": options.subject,
        "kind": job.get("kind", "scene"),
        "createdWithAI": True,
        "generator": options.generator,
        "prompt": job["prompt"],
        "refs": job.get("refs", []),
        "reviewNote": options.note,
        "adoptedAt": date.today().isoformat(),
        "historicalAccuracyStatus": "not_verified",
        "rightsStatus": "usage_terms_check_required",
    })
    manifest["assets"].sort(key=lambda asset: (asset["category"], asset["assetId"]))
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"{dest.relative_to(ROOT).as_posix()} {picture.width}x{picture.height} {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
