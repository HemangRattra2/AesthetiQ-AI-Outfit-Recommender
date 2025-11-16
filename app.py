import json
import urllib.request
import base64
from flask import Flask, request, jsonify, render_template


def http_post(url, headers, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as res:
        body = res.read().decode("utf-8")
        return json.loads(body)

def get_fashion_advice(file_bytes, mime_type):
    file_b64 = base64.b64encode(file_bytes).decode("utf-8")
    
    prompt_text = """
     You are an expert fashion, beauty, and physique analysis assistant.

Analyze the person in the uploaded image and provide the following in clear sections:

1. **SKIN TONE**
   - Identify approximate skin tone category (e.g., fair, light, medium, tan, deep)
   - Identify undertone (cool / warm / neutral / olive)
   - Explain how you determined this from the image.

2. **BODY TYPE & PROPORTIONS**
   - Identify approximate body type (ectomorph / mesomorph / endomorph or standard body shapes)
   - Describe proportions: shoulders, waist, hips, torso length, leg length
   - Mention what features stand out visually.

3. **FACE SHAPE**
   - Identify face shape (oval, round, square, heart, oblong, diamond)
   - Explain the reasoning briefly.

4. **STYLE & FASHION RECOMMENDATIONS**
   - Give highly personalized clothing suggestions based on skin tone, body proportions, and face shape:
        - Best colors for clothing
        - Best fits (slim/relaxed/oversized)
        - Best types of tops, bottoms, footwear
        - Patterns or textures that suit them
        - Items to avoid (with reasons)

5. **HAIRSTYLE SUGGESTIONS**
   - Suggest hairstyles that suit their face shape and proportions.

6. **OVERALL AESTHETIC VIBE**
   - Describe what fashion/aesthetic styles the person would look great in  
     (e.g., minimal streetwear, casual classic, Korean aesthetic, clean fit, athleisure, dark academia).

7. **CONFIDENCE SCORE**
   - Give a 0–100 confidence score on accuracy.
   - Mention limitations if the image is low-light, blurred, or partially visible.

Be respectful and body-positive. The goal is to help the person improve their style, not judge them.
    """
    
    payload = {
        "contents": [{"parts": [
            {"text": prompt_text},
            {"inline_data": {"mime_type": mime_type, "data": file_b64}}
        ]}]
    }
    
    model = "gemini-2.5-flash"
    GEMINI_API_KEY = "AIzaSyC63sJtnHr-tKO-rqXzGWtXqfJcyxjaj_A"
    
    if not GEMINI_API_KEY:
        return "ERROR: API key not set."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    result = http_post(url, headers, payload)
    
    try:
        output_text = result["candidates"][0]["content"]["parts"][0]["text"]
        return output_text
    except Exception as e:
        return f"Error parsing response: {e}"

# --- (The Flask App) ---
app = Flask(__name__)

# Route 1: Serve your friend's HTML page
@app.route("/")
def index():
    # This will look for a file named "index.html" in a folder
    # named "templates".
    return render_template("index.html")

# Route 2: This is the endpoint the website will call
@app.route("/process-image", methods=["POST"])
def handle_image_upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Read the file's bytes and get its mime type
        file_bytes = file.read()
        mime_type = file.mimetype
        
        # Get the advice!
        advice_text = get_fashion_advice(file_bytes, mime_type)
        
        # Send the advice back to the website as JSON
        return jsonify({"advice": advice_text})

# --- (This runs the app) ---
if __name__ == "__main__":
    # Before running, set your API key in the terminal!
    # set GEMINI_API_KEY="your_key_here"
    app.run(debug=True, port=5000)
