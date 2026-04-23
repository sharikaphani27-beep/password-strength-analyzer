import re
import hashlib
import random
import string
import pickle
import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

DB_FILE = "password_db.pkl"

def load_database():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "rb") as f:
            return pickle.load(f)
    return set()

def save_database(db):
    with open(DB_FILE, "wb") as f:
        pickle.dump(db, f)

password_db = load_database()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def check_strength(password):
    score = 0
    remarks = []
    
    if len(password) >= 12:
        score += 2
    elif len(password) >= 8:
        score += 1
    else:
        remarks.append("Password too short")
    
    if re.search(r"[A-Z]", password):
        score += 1
    else:
        remarks.append("Add uppercase letters")
    
    if re.search(r"[a-z]", password):
        score += 1
    else:
        remarks.append("Add lowercase letters")
    
    if re.search(r"\d", password):
        score += 1
    else:
        remarks.append("Add numbers")
    
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        score += 1
    else:
        remarks.append("Add special characters")
    
    if score >= 6:
        strength = "Strong"
    elif score >= 4:
        strength = "Medium"
    else:
        strength = "Weak"
    
    return strength, remarks, score

def is_unique(password):
    hashed = hash_password(password)
    return hashed not in password_db

def generate_password(length=12):
    all_chars = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(random.choice(all_chars) for _ in range(length))

def store_password(password):
    hashed = hash_password(password)
    password_db.add(hashed)
    save_database(password_db)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    password = data.get('password', '')
    
    strength, remarks, score = check_strength(password)
    unique = is_unique(password)
    suggested = generate_password() if strength != "Strong" else None
    
    if unique:
        store_password(password)
    
    return jsonify({
        'strength': strength,
        'remarks': remarks,
        'unique': unique,
        'score': score,
        'suggested': suggested
    })

if __name__ == '__main__':
    app.run(debug=True)