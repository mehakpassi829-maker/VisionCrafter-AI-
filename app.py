"""
VisionCrafter — Flask backend
=================================
Run:
    pip install -r requirements.txt
    export HF_API_TOKEN=hf_xxx      # https://huggingface.co/settings/tokens
    python app.py
Then open http://localhost:5000
"""
import io
import os
import time
import uuid
from datetime import datetime

from flask import Flask, render_template, request, jsonify, send_from_directory

import config
from models.prompt_enhancer import enhance_prompt, random_prompt_idea
from models.diffusion import generate_images, DiffusionError

app = Flask(__name__)
os.makedirs(config.GENERATED_IMAGES_DIR, exist_ok=True)


@app.route("/")
def index():
    return render_template(
        "index.html",
        style_presets=list(config.STYLE_PRESETS.keys()),
        style_icons=config.STYLE_ICONS,
        size_presets=list(config.SIZE_PRESETS.keys()),
        quality_presets=list(config.QUALITY_PRESETS.keys()),
        default_negative_prompt=config.DEFAULT_NEGATIVE_PROMPT,
        model_id=config.HF_MODEL_ID,
        max_images=config.MAX_IMAGES_PER_REQUEST,
    )


@app.route("/api/enhance", methods=["POST"])
def api_enhance():
    data = request.get_json(force=True) or {}
    prompt = data.get("prompt", "")
    style = data.get("style", "none")
    result = enhance_prompt(prompt, style)
    return jsonify(result)


@app.route("/api/random-prompt", methods=["GET"])
def api_random_prompt():
    return jsonify({"prompt": random_prompt_idea()})


@app.route("/api/generate", methods=["POST"])
def api_generate():
    data = request.get_json(force=True) or {}

    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty."}), 400

    style = data.get("style", "none")
    negative_prompt = data.get("negative_prompt") or config.DEFAULT_NEGATIVE_PROMPT
    size_key = data.get("size", "512x512")
    width, height = config.SIZE_PRESETS.get(size_key, (512, 512))
    num_images = min(int(data.get("num_images", 1)), config.MAX_IMAGES_PER_REQUEST)
    quality = data.get("quality", "standard")
    q = config.QUALITY_PRESETS.get(quality, config.QUALITY_PRESETS["standard"])
    steps = int(data.get("steps") or q["steps"])
    cfg_scale = float(data.get("cfg_scale") or q["cfg_scale"])
    seed_raw = data.get("seed")
    seed = int(seed_raw) if seed_raw not in (None, "", "random") else None

    enhanced = enhance_prompt(prompt, style)
    final_prompt = enhanced["enhanced"]

    try:
        results = generate_images(
            prompt=final_prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_images=num_images,
            steps=steps,
            cfg_scale=cfg_scale,
            seed=seed,
        )
    except DiffusionError as exc:
        return jsonify({"error": str(exc)}), 502

    images_out = []
    gen_date = datetime.utcnow().isoformat() + "Z"
    for r in results:
        filename = f"{uuid.uuid4().hex}.png"
        filepath = os.path.join(config.GENERATED_IMAGES_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(r["image_bytes"])
        size_bytes = os.path.getsize(filepath)

        images_out.append({
            "url": f"/generated_images/{filename}",
            "filename": filename,
            "seed": r["seed"],
            "inference_time": r["inference_time"],
            "size_bytes": size_bytes,
            "metadata": {
                "prompt": prompt,
                "enhanced_prompt": final_prompt,
                "negative_prompt": negative_prompt,
                "model": config.HF_MODEL_ID,
                "size": f"{width}x{height}",
                "cfg_scale": cfg_scale,
                "steps": steps,
                "seed": r["seed"],
                "inference_time": r["inference_time"],
                "size_bytes": size_bytes,
                "style": style,
                "date": gen_date,
            },
        })

    return jsonify({
        "original_prompt": enhanced["original"],
        "enhanced_prompt": enhanced["enhanced"],
        "images": images_out,
    })


@app.route("/generated_images/<path:filename>")
def serve_generated_image(filename):
    return send_from_directory(config.GENERATED_IMAGES_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
