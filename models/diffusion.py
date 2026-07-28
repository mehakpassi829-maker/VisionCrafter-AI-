"""
Diffusion Pipeline Wrapper
===========================
Wraps calls to Hugging Face's current "Inference Providers" system (the
huggingface_hub InferenceClient), so the rest of the app never talks to the
network directly.

A note on the model: the original brief asked for Stable Diffusion v1.5.
As of this writing, HF's hosted serverless API has deprecated SD v1.5 —
it's no longer served through the free hosted tier, regardless of a valid
token (this produced the broken-image / silent-failure behavior). We use
Stable Diffusion 2.1 here instead — the direct successor, same interface,
still actively served — and it's a one-line config change
(HF_MODEL_ID in .env) if you get access to a provider that still hosts v1.5,
e.g. via a paid Inference Endpoint you deploy yourself.

Why a hosted API instead of loading the model locally?
    Stable Diffusion needs a GPU with several GB of VRAM to run at usable
    speed. Hitting a hosted inference endpoint means this app runs anywhere
    (including machines with no GPU at all) at the cost of per-request
    latency and a rate-limited free tier. Swap `generate_single_image` for a
    local `diffusers.StableDiffusionPipeline` call if you have a GPU box and
    want offline/unlimited generation.
"""
import io
import random
import sys
import os
import time

from huggingface_hub import InferenceClient
from huggingface_hub.errors import HfHubHTTPError

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import HF_MODEL_ID, HF_API_TOKEN, REQUEST_TIMEOUT_SECONDS


class DiffusionError(Exception):
    pass


def _client():
    if not HF_API_TOKEN or HF_API_TOKEN == "hf_your_token_here":
        raise DiffusionError(
            "No valid HF_API_TOKEN configured. Set it in your .env file — "
            "get a free token at https://huggingface.co/settings/tokens"
        )
    return InferenceClient(api_key=HF_API_TOKEN, timeout=REQUEST_TIMEOUT_SECONDS)


def generate_single_image(prompt, negative_prompt, width, height, steps, cfg_scale, seed=None):
    """
    Calls the Inference Providers API once and returns
    (image_bytes, used_seed, elapsed_seconds).

    Note: seed reproducibility isn't guaranteed across every third-party
    provider Inference Providers might route to — we always report back
    whatever seed we *intended* to use so the UI stays consistent even if
    the backend ignores it.
    """
    if seed is None:
        seed = random.randint(0, 2_147_483_647)

    client = _client()
    start = time.time()
    try:
        image = client.text_to_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            model=HF_MODEL_ID,
            width=int(width),
            height=int(height),
            num_inference_steps=int(steps),
            guidance_scale=float(cfg_scale),
            seed=int(seed),
        )
    except HfHubHTTPError as exc:
        raise DiffusionError(f"Inference API error: {exc}") from exc
    except Exception as exc:  # noqa: BLE001 — surface any provider/network issue clearly
        raise DiffusionError(f"Error contacting inference API: {exc}") from exc

    elapsed = round(time.time() - start, 2)

    # image is a PIL.Image — encode to PNG bytes for the rest of the app
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    return buf.getvalue(), seed, elapsed


def generate_images(prompt, negative_prompt, width, height, num_images, steps, cfg_scale, seed=None):
    """
    Generates `num_images` images. Each call gets its own seed (derived from
    the base seed if one was supplied, otherwise fully random) so a batch
    produces genuine variations rather than identical copies.
    """
    results = []
    for i in range(num_images):
        this_seed = None
        if seed is not None:
            this_seed = int(seed) + i
        image_bytes, used_seed, elapsed = generate_single_image(
            prompt, negative_prompt, width, height, steps, cfg_scale, this_seed
        )
        results.append({"image_bytes": image_bytes, "seed": used_seed, "inference_time": elapsed})
    return results
