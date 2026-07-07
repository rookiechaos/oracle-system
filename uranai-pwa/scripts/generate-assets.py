#!/usr/bin/env python3
"""
Generate PWA icons for 占いAI.
Requires: pip install Pillow
Output: public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
"""

import os, math
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not found. Installing...")
    os.system("pip3 install Pillow -q")
    from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent.parent / "public"
OUT.mkdir(exist_ok=True)

BG      = (5, 0, 16)
CYAN    = (0, 229, 255)
MAGENTA = (255, 0, 221)

def make_icon(size: int, path: Path):
    img  = Image.new("RGBA", (size, size), BG + (255,))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2
    r      = int(size * 0.38)

    # Outer ring — cyan
    lw = max(2, size // 60)
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=CYAN, width=lw)

    # Inner ring — magenta
    r2 = int(r * 0.72)
    draw.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], outline=MAGENTA, width=lw)

    # Kanji 占 in centre
    char_size = int(size * 0.38)
    try:
        # Try system Japanese fonts in order
        for fp in [
            "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",
            "/System/Library/Fonts/Hiragino Sans GB.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
            "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
        ]:
            if os.path.exists(fp):
                font = ImageFont.truetype(fp, char_size)
                break
        else:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    text = "占"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw   = bbox[2] - bbox[0]
    th   = bbox[3] - bbox[1]
    draw.text((cx - tw // 2, cy - th // 2 - bbox[1]), text, font=font, fill=CYAN)

    img.save(path, "PNG")
    print(f"  ✓ {path.name} ({size}×{size})")

print("Generating PWA icons...")
make_icon(192, OUT / "icon-192.png")
make_icon(512, OUT / "icon-512.png")
make_icon(180, OUT / "apple-touch-icon.png")
print("Done! Icons saved to public/")
