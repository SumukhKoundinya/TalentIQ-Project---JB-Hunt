#!/usr/bin/env python3
"""Prepare the supplied laptop's hinge-only sprite; Pillow is an offline dev tool."""
import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SIZE = (1055, 792)
HINGE_X, HINGE_Y = 519, 494
PERSPECTIVE = 2100
HINGES = ((250, 469, 308, 508), (728, 469, 788, 508))
CROP = (48, 16, 992, 784)
FRAME_SIZE = (320, 260)
FRAME_COUNT = 19
CLOSED_ANGLE = 111


def project_point(x, y, angle):
    """Rotate just the lid forward, then project about the stationary hinge."""
    radians = math.radians(angle)
    depth = (HINGE_Y - y) * math.sin(radians)
    scale = PERSPECTIVE / (PERSPECTIVE - depth)
    return (HINGE_X + (x - HINGE_X) * scale,
            HINGE_Y + (y - HINGE_Y) * math.cos(radians) * scale)


def project_lid(lid, angle):
    """Inverse homography for Pillow, sampled without smoothing the pixel art."""
    if angle == 0:
        return lid.copy()
    radians = math.radians(angle)
    sine, cosine = math.sin(radians), math.cos(radians)
    denominator = cosine * PERSPECTIVE + HINGE_Y * sine
    coefficients = (
        cosine * PERSPECTIVE / denominator,
        -HINGE_X * sine / denominator,
        HINGE_X * HINGE_Y * sine / denominator,
        0,
        (PERSPECTIVE - HINGE_Y * sine) / denominator,
        (HINGE_Y * cosine * PERSPECTIVE + HINGE_Y ** 2 * sine - HINGE_Y * PERSPECTIVE) / denominator,
        0,
        -sine / denominator,
    )
    return lid.transform(SOURCE_SIZE, Image.Transform.PERSPECTIVE, coefficients,
                         resample=Image.Resampling.NEAREST)


def make_outer_lid():
    """The unseen back uses the source's purple, shade, white and black palette.

    No alternate artwork is substituted for the original front screen. The
    stepped shell provides a tangible outer lid when the screen faces down.
    """
    lid = Image.new("RGBA", SOURCE_SIZE)
    draw = ImageDraw.Draw(lid)
    outline = (2, 1, 6, 255)
    purple = (141, 124, 194, 255)
    shade = (106, 93, 147, 255)
    white = (255, 255, 255, 255)
    draw.polygon([(202, 28), (834, 28), (834, 36), (850, 36), (850, 48),
                  (862, 48), (862, 64), (874, 64), (874, 478),
                  (862, 478), (862, 494), (174, 494), (174, 482),
                  (160, 482), (160, 78), (172, 78), (172, 60),
                  (184, 60), (184, 48), (202, 48)], fill=outline)
    draw.polygon([(208, 48), (826, 48), (826, 56), (842, 56), (842, 68),
                  (854, 68), (854, 472), (182, 472), (182, 80),
                  (194, 80), (194, 64), (208, 64)], fill=white)
    draw.polygon([(214, 56), (820, 56), (820, 64), (836, 64), (836, 76),
                  (846, 76), (846, 462), (190, 462), (190, 86),
                  (202, 86), (202, 72), (214, 72)], fill=purple)
    draw.rectangle((182, 474, 853, 482), fill=shade)
    return lid


def generate_frames(source):
    if source.size != SOURCE_SIZE:
        raise ValueError("Hinge coordinates require the original 1055 × 792 PNG")
    if source.getchannel("A").getextrema()[0] != 0:
        raise ValueError("Expected the supplied transparent PNG; do not erase interior black pixels")

    base, screen, hinges = [Image.new("RGBA", SOURCE_SIZE) for _ in range(3)]
    base.paste(source.crop((0, HINGE_Y, 1055, 792)), (0, HINGE_Y))
    screen.paste(source.crop((0, 0, 1055, HINGE_Y)), (0, 0))
    for box in HINGES:
        hinges.paste(source.crop(box), box[:2])
        ImageDraw.Draw(base).rectangle((box[0], box[1], box[2] - 1, box[3] - 1), fill=(0, 0, 0, 0))
        ImageDraw.Draw(screen).rectangle((box[0], box[1], box[2] - 1, box[3] - 1), fill=(0, 0, 0, 0))
    outer_lid = make_outer_lid()
    frames = []
    for index in range(FRAME_COUNT):
        angle = CLOSED_ANGLE * index / (FRAME_COUNT - 1)
        # Front turns away past 90 degrees; the outside shell becomes visible.
        lid = project_lid(screen if angle < 90 else outer_lid, angle)
        frame = Image.alpha_composite(Image.alpha_composite(base, lid), hinges)
        frames.append(frame)
    return frames


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "hoghacksLaptop.png")
    parser.add_argument("--output", type=Path, default=ROOT / "assets/hoghacks/laptop-sprite.png")
    args = parser.parse_args()
    source = Image.open(args.source).convert("RGBA")
    frames = generate_frames(source)
    sprite = Image.new("RGBA", (FRAME_SIZE[0] * FRAME_COUNT, FRAME_SIZE[1]))
    for index, frame in enumerate(frames):
        sprite.paste(frame.crop(CROP).resize(FRAME_SIZE, Image.Resampling.NEAREST),
                     (FRAME_SIZE[0] * index, 0))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sprite.save(args.output, optimize=True)
    print(f"Saved {args.output}: {sprite.width} × {sprite.height}, {args.output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
