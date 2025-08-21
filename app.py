import os
import base64
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API with your key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

app = Flask(__name__)

# Prompts for Gemini API
MATH_PROMPT_TEXT = """
You are a brilliant math tutor. Analyze the math problem provided in the text.
Provide a clear, step-by-step solution.
Use LaTeX for all mathematical expressions to ensure clarity.
"""

MATH_PROMPT_IMAGE = """
You are a brilliant math tutor. Analyze the math problem in the image.
Provide a clear, step-by-step solution.
Use LaTeX for all mathematical expressions to ensure clarity.
"""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve_math_problem():
    try:
        data = request.get_json()
        
        if 'image' in data:
            image_data = data['image'].split(',')[1]
            image_bytes = base64.b64decode(image_data)
            model = genai.GenerativeModel('gemini-1.5-flash')
            image_part = {"mime_type": "image/jpeg", "data": image_bytes}
            response = model.generate_content([MATH_PROMPT_IMAGE, image_part])
        elif 'text' in data:
            text_input = data['text']
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content([MATH_PROMPT_TEXT, text_input])
        else:
            return jsonify({'error': 'No input data provided'}), 400

        solution = response.text
        return jsonify({'solution': solution})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)