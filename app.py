from flask import Flask, request, jsonify, render_template
import pickle
import re

app = Flask(__name__)

try:
    with open("password_model.pkl", "rb") as file:
        password_model = pickle.load(file)
except FileNotFoundError:
    password_model = {
        "min_length": 8,
        "require_upper": True,
        "require_lower": True,
        "require_digit": True,
        "require_special": True,
        "special_chars": "@#$%^&*",
        "common_passwords": ["123456", "password", "qwerty", "12345678"]
    }

def analyze_password(password):
    score = 0
    feedback = []
    checks = {}
    
    if len(password) >= password_model["min_length"]:
        score += 1
        checks["length"] = True
    else:
        checks["length"] = False
        feedback.append(f"Password should be at least {password_model['min_length']} characters long")
    
    if re.search("[A-Z]", password):
        score += 1
        checks["uppercase"] = True
    else:
        checks["uppercase"] = False
        feedback.append("Add at least one uppercase letter")
    
    if re.search("[a-z]", password):
        score += 1
        checks["lowercase"] = True
    else:
        checks["lowercase"] = False
        feedback.append("Add at least one lowercase letter")
    
    if re.search("[0-9]", password):
        score += 1
        checks["digit"] = True
    else:
        checks["digit"] = False
        feedback.append("Add at least one number")
    
    special_chars = password_model.get("special_chars", "@#$%^&*")
    if re.search(f"[{re.escape(special_chars)}]", password):
        score += 1
        checks["special"] = True
    else:
        checks["special"] = False
        feedback.append("Add at least one special character")
    
    if password.lower() in [p.lower() for p in password_model.get("common_passwords", [])]:
        score = max(0, score - 2)
        feedback.append("This password is very common and unsafe")
    
    if score <= 2:
        strength = "Weak"
    elif score <= 4:
        strength = "Medium"
    else:
        strength = "Strong"
    
    return {
        "score": score,
        "max_score": 5,
        "strength": strength,
        "feedback": feedback,
        "checks": checks
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    password = data.get("password", "")
    
    if not password:
        return jsonify({"error": "Password is required"}), 400
    
    result = analyze_password(password)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)