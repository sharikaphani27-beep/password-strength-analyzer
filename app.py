import pickle
import re
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

def load_model():
    try:
        with open("password_model.pkl", "rb") as file:
            return pickle.load(file)
    except:
        return {
            "min_length": 8,
            "require_upper": True,
            "require_lower": True,
            "require_digit": True,
            "require_special": True,
            "special_chars": "@#$%^&*",
            "common_passwords": ["123456", "password", "qwerty", "12345678"]
        }

def analyze_password(password):
    model = load_model()
    score = 0
    feedback = []
    
    if len(password) >= model["min_length"]:
        score += 1
    else:
        feedback.append(f"Password should be at least {model['min_length']} characters long")
    
    if re.search("[A-Z]", password):
        score += 1
    else:
        feedback.append("Add at least one uppercase letter")
    
    if re.search("[a-z]", password):
        score += 1
    else:
        feedback.append("Add at least one lowercase letter")
    
    if re.search("[0-9]", password):
        score += 1
    else:
        feedback.append("Add at least one number")
    
    if re.search(f"[{re.escape(model['special_chars'])}]", password):
        score += 1
    else:
        feedback.append(f"Add at least one special character ({model['special_chars']})")
    
    if password.lower() in model["common_passwords"]:
        feedback.append("This password is very common and unsafe")
        score = max(0, score - 2)
    
    max_score = 5
    if score <= 2:
        strength = "Weak"
    elif score <= 4:
        strength = "Medium"
    else:
        strength = "Strong"
    
    return {
        "score": score,
        "max_score": max_score,
        "strength": strength,
        "feedback": feedback
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    password = data.get("password", "")
    result = analyze_password(password)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)