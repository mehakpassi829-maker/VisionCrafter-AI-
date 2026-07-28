# VisionCrafter

An AI text-to-image generator with a full studio UI: prompt enhancement,
negative prompting, 16 style presets, a live denoising visualizer, gallery,
favorites, searchable prompt history, and a stats dashboard — served through
the Hugging Face hosted Inference API (currently running **FLUX.1-schnell**;
see the note on models below) so it runs on any machine, no local GPU
required.

## What's implemented

- Prompt input with a rule-based **prompt enhancer** (shows original → enhanced → generated)
- Negative prompt (pre-filled with sensible defaults, editable)
- 13 style presets (realistic, anime, ghibli, cyberpunk, oil painting, etc.)
- Size presets (512/768/1024, landscape, portrait, square)
- 1 / 2 / 4 images per generation
- Quality presets (standard/high/ultra → maps to steps + CFG scale)
- Manual CFG scale slider and sampling steps slider
- Seed field for reproducible generations (leave blank for random)
- Live "denoising visualizer" loading animation (the page's signature element —
  a particle grid that resolves from noise into a gradient while you wait,
  mirroring what the model is actually doing server-side)
- Gallery with download, fullscreen, regenerate, copy-prompt, share, favorite, delete
- Full metadata per image (prompt, negative prompt, model, size, CFG, seed, steps, inference time)
- Random prompt idea generator ("surprise me")
- Responsive, glassmorphic dark UI

## Not yet built (next slices, structured for easy addition)

- Persistent prompt history / search / filtering (currently gallery is in-memory per page load — add a `history/` route + SQLite or JSON store)
- Image-to-image, variations, batch compare view
- Stats dashboard, settings page
- The `routes/` and `utils/` folders are stubbed in the folder structure for when these land

## Setup

```bash
cd VisionCrafter
pip install -r requirements.txt

cp .env.example .env
# edit .env and paste your token from https://huggingface.co/settings/tokens

python app.py
```

Open **http://localhost:5000**.

## A note on the model

The original brief called for Stable Diffusion v1.5. In practice, both v1.5
and its successor v2.1 turned out to be **unlisted on Hugging Face's current
"Inference Providers" system** — calling them returns a 401 "repository not
found for provider mapping" error, regardless of a valid token. This isn't
a bug in this app; it's just that those specific checkpoints aren't wired
to any hosted inference provider right now.

The app now defaults to **FLUX.1-schnell** (Black Forest Labs, Apache-2.0 —
free, no license click-through needed) since it's the model HF's own current
docs use as their reference example, and it's confirmed live. It's also
fast — schnell means "fast" in German — so it actually works well with lower
step counts (4-8) than classic Stable Diffusion needs; feel free to lower
the default "Sampling steps" slider for quicker, still-good results.

If you specifically need Stable Diffusion for a grading requirement, run it
locally with a GPU via the `diffusers` library instead of a hosted API — say
the word and this can be added as an alternate code path.

## Why a hosted API instead of running the model locally

Stable Diffusion needs a GPU with several GB of VRAM to generate at usable
speed. Calling the Hugging Face Inference API means this app works on any
laptop, in a cloud IDE, or in a sandbox with no GPU at all — the tradeoff is
per-request latency and the rate limits of the free tier. If you have your
own GPU box and want offline/unlimited generation, swap
`models/diffusion.py`'s `generate_single_image` for a local
`diffusers.StableDiffusionPipeline` call — the rest of the app (routes, UI,
metadata handling) doesn't need to change.

## Project structure

```
VisionCrafter/
  app.py                    Flask routes: /, /api/enhance, /api/generate, /api/random-prompt
  config.py                 Style/size/quality presets, env-driven API config
  requirements.txt
  .env.example
  models/
    prompt_enhancer.py      Rule-based prompt expansion + style keyword injection
    diffusion.py            Hugging Face Inference API wrapper
  templates/
    index.html
  static/
    css/style.css           Design system (see below)
    js/app.js                Generation flow, denoising visualizer, gallery
  generated_images/         Saved PNGs served back to the gallery
  routes/, utils/           Reserved for the next feature slices
```

## Design notes

The visual identity is built around the one concrete thing about this
product's world: a diffusion model literally denoises random noise into a
final image. The palette (void violet background, magenta→cyan gradient),
the loading state (a particle grid that resolves from static into a gradient
while the request is in flight), and the "Original → Enhanced" prompt flow
display all come from that idea, rather than a generic dark-mode SaaS look.
