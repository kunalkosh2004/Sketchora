import hashlib

from app.ai.base import SketchAnalysis, VisionProvider

GARMENTS = ["Evening dress", "Cocktail dress", "Gown", "Blouse"]
SILHOUETTES = ["A-line", "Sheath", "Fit & flare", "Bias drape"]
NECKLINES = ["Sweetheart", "V-neck", "Halter", "Off-shoulder"]
SLEEVES = ["Sleeveless", "Cap", "Bell", "Puff"]
FABRICS = ["Silk satin", "Chiffon", "Crepe", "Linen"]
LENGTHS = ["Floor", "Midi", "Knee", "Maxi"]
COLORWAYS = ["Noir", "Oxblood", "Forest", "Midnight", "Champagne"]


class MockVisionProvider(VisionProvider):
    """Deterministic offline provider.

    Derives a plausible specification from a hash of the image bytes, so the
    same sketch always analyzes to the same spec — useful for tests and for
    developing without an API key.
    """

    def analyze_sketch(self, image: bytes, content_type: str) -> SketchAnalysis:
        digest = hashlib.sha256(image).hexdigest()
        picks = [
            GARMENTS[int(digest[0:2], 16) % len(GARMENTS)],
            SILHOUETTES[int(digest[2:4], 16) % len(SILHOUETTES)],
            NECKLINES[int(digest[4:6], 16) % len(NECKLINES)],
            SLEEVES[int(digest[6:8], 16) % len(SLEEVES)],
            FABRICS[int(digest[8:10], 16) % len(FABRICS)],
            LENGTHS[int(digest[10:12], 16) % len(LENGTHS)],
            COLORWAYS[int(digest[12:14], 16) % len(COLORWAYS)],
        ]
        garment, silhouette, neckline, sleeve, fabric, length, colorway = picks
        return SketchAnalysis(
            garment=garment,
            silhouette=silhouette,
            neckline=neckline,
            sleeve=sleeve,
            fabric=fabric,
            length=length,
            colorway=colorway,
            notes=(
                "Drafted from the uploaded sketch. Refine the specification "
                "before generating a visualization."
            ),
        )