"""
Prompt Enhancer
================
A lightweight, rule-based prompt-engineering layer. It doesn't call an LLM —
it deterministically expands a user's short prompt with descriptive,
photography/art-direction language and the chosen style's keyword suffix,
demonstrating the core idea of prompt engineering for diffusion models
without adding another network dependency.

Swap `enhance_prompt` for an LLM-backed version later if you want fully
generative rewriting (e.g. call the HF Inference API against a text model).
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import STYLE_PRESETS, QUALITY_BOOSTERS

# Words that suggest the user already wrote a fairly descriptive prompt.
# If the prompt is already long/descriptive, we enhance more gently.
_DESCRIPTIVE_MARKERS = ("lighting", "detailed", "style", "render", "shot", "angle")


def enhance_prompt(raw_prompt: str, style: str = "none") -> dict:
    """
    Returns a dict: {"original": str, "enhanced": str}
    """
    raw_prompt = (raw_prompt or "").strip()
    if not raw_prompt:
        return {"original": "", "enhanced": ""}

    style_suffix = STYLE_PRESETS.get(style, "")
    word_count = len(raw_prompt.split())
    already_descriptive = word_count >= 12 or any(m in raw_prompt.lower() for m in _DESCRIPTIVE_MARKERS)

    parts = [raw_prompt]

    # Only add generic quality boosters if the prompt is short/sparse —
    # a long, already-crafted prompt shouldn't be diluted.
    if not already_descriptive:
        parts.append(QUALITY_BOOSTERS)

    if style_suffix:
        parts.append(style_suffix)

    enhanced = ", ".join(p for p in parts if p)

    return {"original": raw_prompt, "enhanced": enhanced}


def random_prompt_idea() -> str:
    """Returns a random creative prompt seed for users with 'no idea'."""
    import random
    ideas = [
        "a fantasy castle floating above the clouds at golden hour",
        "a sprawling space city built into the rings of a gas giant",
        "an ancient warrior standing before a burning battlefield",
        "a dragon coiled around a crumbling stone temple in the jungle",
        "a cyberpunk girl with neon tattoos walking through rain-soaked streets",
        "a bioluminescent alien forest under twin moons",
        "a steampunk airship docking at a cliffside harbor",
        "an underwater city glowing inside a giant glass dome",
        "a lone astronaut discovering ruins on a red desert planet",
        "a witch's cottage deep in a snow-covered enchanted forest",
    ]
    return random.choice(ideas)
