from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def iter_images(folder: Path, recursive: bool) -> Iterable[Path]:
    pattern = "**/*" if recursive else "*"
    for path in folder.glob(pattern):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def maybe_resize(img: Image.Image, max_width: int) -> Image.Image:
    if img.width <= max_width:
        return img
    new_height = round(img.height * (max_width / img.width))
    return img.resize((max_width, new_height), Image.Resampling.LANCZOS)


def format_kb(byte_count: int) -> str:
    return f"{byte_count / 1024:.1f} KB"


def optimize_image(path: Path, max_width: int, jpg_quality: int, dry_run: bool) -> tuple[int, int, str]:
    before_size = path.stat().st_size

    with Image.open(path) as source:
        img = ImageOps.exif_transpose(source)
        img = maybe_resize(img, max_width)

        suffix = path.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            img = img.convert("RGB")
            save_kwargs = {
                "format": "JPEG",
                "quality": jpg_quality,
                "optimize": True,
                "progressive": True,
            }
            output_format = "JPEG"
        elif suffix == ".png":
            if img.mode not in {"RGB", "RGBA"}:
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            save_kwargs = {
                "format": "PNG",
                "optimize": True,
                "compress_level": 9,
            }
            output_format = "PNG"
        else:
            if img.mode not in {"RGB", "RGBA"}:
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            save_kwargs = {
                "format": "WEBP",
                "quality": jpg_quality,
                "method": 6,
            }
            output_format = "WEBP"

        if not dry_run:
            img.save(path, **save_kwargs)

    after_size = before_size if dry_run else path.stat().st_size
    return before_size, after_size, output_format


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compress and resize images in a folder for faster web loading."
    )
    parser.add_argument(
        "--folder",
        type=Path,
        default=Path("public/images"),
        help="Image folder path (default: public/images)",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=1600,
        help="Resize images wider than this width (default: 1600)",
    )
    parser.add_argument(
        "--jpg-quality",
        type=int,
        default=95,
        help="JPEG/WEBP quality 1-100 (default: 95)",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Include nested folders.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview results without writing files.",
    )

    args = parser.parse_args()
    folder = args.folder.resolve()

    if not folder.exists() or not folder.is_dir():
        raise SystemExit(f"Folder not found: {folder}")

    if args.jpg_quality < 1 or args.jpg_quality > 100:
        raise SystemExit("--jpg-quality must be between 1 and 100")

    images = list(iter_images(folder, args.recursive))
    if not images:
        print(f"No supported images found in {folder}")
        return

    total_before = 0
    total_after = 0

    print(f"Processing {len(images)} image(s) in {folder}")
    for image_path in images:
        before, after, fmt = optimize_image(
            image_path,
            max_width=args.max_width,
            jpg_quality=args.jpg_quality,
            dry_run=args.dry_run,
        )
        total_before += before
        total_after += after
        delta = before - after
        delta_label = f"saved {format_kb(delta)}" if delta >= 0 else f"grew {format_kb(-delta)}"
        print(
            f"- {image_path.name} [{fmt}] {format_kb(before)} -> {format_kb(after)} ({delta_label})"
        )

    saved = total_before - total_after
    print("\nSummary")
    print(f"- Total before: {format_kb(total_before)}")
    print(f"- Total after:  {format_kb(total_after)}")
    if saved >= 0:
        print(f"- Total saved:  {format_kb(saved)}")
    else:
        print(f"- Net growth:   {format_kb(-saved)}")
    if args.dry_run:
        print("- Dry run only. No files were changed.")


if __name__ == "__main__":
    main()
