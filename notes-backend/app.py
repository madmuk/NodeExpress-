from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase_key.json")  # Ensure this file exists
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running."})

# Helper to verify Firebase ID token
def verify_token(id_token):
    if not id_token:
        return None
    if id_token.startswith("Bearer "):
        id_token = id_token[7:]
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded["uid"]
    except Exception as e:
        print("Token verification error:", e)
        return None

# 🔐 Sign up route to store user info in Firestore
@app.route("/signup", methods=["POST"])
def signup():
    id_token = request.headers.get("Authorization")
    uid = verify_token(id_token)
    if not uid:
        return jsonify({"error": "Invalid token"}), 401

    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400

    # Store basic user info
    db.collection("users").document(uid).set({
        "email": email
    })

    return jsonify({"success": True})

# ➕ Add a new note
@app.route("/add_note", methods=["POST"])
def add_note():
    id_token = request.headers.get("Authorization")
    uid = verify_token(id_token)
    if not uid:
        return jsonify({"error": "Invalid token"}), 401

    data = request.json
    note_text = data.get("text")  # use 'text' since that's used in frontend
    if not note_text:
        return jsonify({"error": "Note required"}), 400

    db.collection("users").document(uid).collection("notes").add({
        "text": note_text
    })
    return jsonify({"success": True})

# 📄 Get all notes for the logged-in user
@app.route("/notes", methods=["GET"])
def get_notes():
    id_token = request.headers.get("Authorization")
    uid = verify_token(id_token)
    if not uid:
        return jsonify({"error": "Invalid token"}), 401

    notes_ref = db.collection("users").document(uid).collection("notes")
    notes = [doc.to_dict() for doc in notes_ref.stream()]
    return jsonify({"notes": notes})

if __name__ == "__main__":
    app.run(debug=True)
