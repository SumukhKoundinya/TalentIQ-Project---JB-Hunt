"""Asset geometry/source-integrity checks. Run with Python + Pillow (see asset README)."""
import importlib.util
import sys
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True


class LaptopAssets(unittest.TestCase):
    def test_source_artwork_and_hinge_projection(self):
        script = ROOT / "scripts/generate-hoghacks-laptop.py"
        self.assertTrue(script.exists(), "the source-preserving sprite generator exists")
        spec = importlib.util.spec_from_file_location("laptop_assets", script)
        assets = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(assets)
        source = Image.open(ROOT / "hoghacksLaptop.png").convert("RGBA")
        self.assertEqual(source.getpixel((0, 0))[3], 0, "source exterior is already transparent")
        self.assertEqual(source.getpixel((500, 100))[3], 255, "black screen is opaque")
        frames = assets.generate_frames(source)
        self.assertEqual(len(frames), 19)
        self.assertEqual(frames[0].tobytes(), source.tobytes(), "open frame preserves every original RGBA pixel")
        strip = source.crop((0, 730, 1055, 792)).tobytes()
        for frame in frames:
            self.assertEqual(frame.crop((0, 730, 1055, 792)).tobytes(), strip, "exposed base and ports never move")
        for angle in [0, 30, 80, 100, 111]:
            self.assertEqual(assets.project_point(519, 494, angle), (519, 494), "the hinge center never moves")
            self.assertEqual(assets.project_point(200, 494, angle), (200, 494), "the entire hinge line is fixed")
        x, y = assets.project_point(200, 28, 111)
        self.assertLess(x, 200, "closed lid follows the base's perspective toward the front")
        self.assertGreater(y, 494, "closed lid covers the keyboard rather than disappearing")
        self.assertLess(y, 730, "closed lid leaves the stationary front edge exposed")


if __name__ == "__main__":
    unittest.main()
