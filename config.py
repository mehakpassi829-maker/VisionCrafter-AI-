"""
Central configuration for VisionCrafter.

All secrets are read from environment variables — never hard-code a token here.
Create a `.env` file (see .env.example) or export HF_API_TOKEN in your shell.
"""
import os
from dotenv import load_dotenv

load_dotenv()  # reads .env in the project root if present

# --- Hugging Face Inference API -------------------------------------------------
# NOTE: Stable Diffusion v1.5 AND 2.1 both turned out to be unlisted for
# Hugging Face's current "Inference Providers" system (401 / repository-not-found
# on the provider-mapping lookup) — this isn't a token problem, those specific
# checkpoints simply aren't wired to any hosted provider right now. FLUX.1-schnell
# is Black Forest Labs' fast, Apache-2.0 (fully free, no license click-through)
# model that HF's own docs use as the reference example, and it works.
# Override via HF_MODEL_ID in .env if you get access to something else.
HF_API_TOKEN = os.environ.get("HF_API_TOKEN", "")
HF_MODEL_ID = os.environ.get("HF_MODEL_ID", "black-forest-labs/FLUX.1-schnell")

# --- App -------------------------------------------------------------------------
GENERATED_IMAGES_DIR = os.path.join(os.path.dirname(__file__), "generated_images")
MAX_IMAGES_PER_REQUEST = 4
REQUEST_TIMEOUT_SECONDS = 120  # cold-start on free HF inference tier can be slow

# --- Style presets -----------------------------------------------------------
# Matches the 16-tile style grid: label, keyword suffix, icon, and an accent
# color for that tile's icon badge.
STYLE_PRESETS = {
    "realistic":    "photorealistic, natural lighting, high detail, DSLR photography",
    "anime":        "anime style, cel shaded, vibrant colors, studio quality anime art",
    "ghibli":       "studio ghibli style, hand-painted, soft pastel colors, whimsical",
    "fantasy":      "epic fantasy art, dramatic lighting, intricate detail, concept art",
    "cyberpunk":    "cyberpunk style, neon lighting, futuristic, high-tech dystopia, rain-slicked streets",
    "pixar":        "pixar-style 3d animation, vibrant colors, character design, studio animation still",
    "oil_painting": "oil painting, visible brush strokes, canvas texture, fine art",
    "watercolor":   "watercolor painting, soft edges, flowing pigment, paper texture",
    "sketch":       "pencil sketch, hand-drawn, cross-hatching, monochrome line art",
    "low_poly":     "low poly 3d art, geometric facets, minimalist stylized render",
    "3d_render":    "3d render, octane render, subsurface scattering, studio lighting",
    "pixel_art":    "pixel art, 16-bit, retro game aesthetic, crisp pixels",
    "cinematic":    "cinematic still, dramatic lighting, film grain, movie scene composition",
    "portrait":     "portrait photography, shallow depth of field, studio lighting, sharp focus on eyes",
    "concept_art":  "concept art, matte painting, environment design, professional illustration",
    "digital_art":  "digital art, trending on artstation, concept artist, detailed illustration",
}

# Icon + accent color per style, for the icon-grid picker in the UI.
STYLE_ICONS = {
    "realistic":    {"icon": "📷", "color": "#6B7280"},
    "anime":        {"icon": "🌸", "color": "#EC4899"},
    "ghibli":       {"icon": "🍃", "color": "#10B981"},
    "fantasy":      {"icon": "✨", "color": "#8B5CF6"},
    "cyberpunk":    {"icon": "⚡", "color": "#3B82F6"},
    "pixar":        {"icon": "🎬", "color": "#F97316"},
    "oil_painting": {"icon": "🎨", "color": "#D97706"},
    "watercolor":   {"icon": "💧", "color": "#0EA5E9"},
    "sketch":       {"icon": "✏️", "color": "#6B7280"},
    "low_poly":     {"icon": "🔷", "color": "#6366F1"},
    "3d_render":    {"icon": "🧊", "color": "#A855F7"},
    "pixel_art":    {"icon": "🕹️", "color": "#EC4899"},
    "cinematic":    {"icon": "🎥", "color": "#EF4444"},
    "portrait":     {"icon": "🖼️", "color": "#F472B6"},
    "concept_art":  {"icon": "🖌️", "color": "#8B5CF6"},
    "digital_art":  {"icon": "💻", "color": "#14B8A6"},
}

# --- Quality presets -> (steps, cfg_scale) baseline nudges ----------------------
QUALITY_PRESETS = {
    "standard": {"steps": 20, "cfg_scale": 7.0},
    "high":     {"steps": 35, "cfg_scale": 8.5},
    "ultra":    {"steps": 50, "cfg_scale": 10.0},
}

# --- Size presets -> (width, height), matching the 1:1 / 16:9 / 9:16 toggle
# in the UI rather than a resolution dropdown.
SIZE_PRESETS = {
    "1:1":   (768, 768),
    "16:9":  (1024, 576),
    "9:16":  (576, 1024),
}

DEFAULT_NEGATIVE_PROMPT = (
    "low quality, blurry, extra fingers, bad anatomy, duplicate, watermark, "
    "cropped, distorted, low resolution, text, logo, deformed, disfigured, "
    "poorly drawn, out of frame"
)

QUALITY_BOOSTERS = "highly detailed, masterpiece, best quality, sharp focus, 8k"
