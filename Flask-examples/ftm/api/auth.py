from flask import Blueprint, request, render_template, redirect, url_for,flash, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp =Blueprint('api',__name__)

def get_db_connection():
    return sqlite3.connect('database.db')

def init_db():
    conn = get_db_connection()
    c = conn.cursor()

    # Create users table if it doesn't exist
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@auth_bp.route('/register', methods=['GET','POST'])
def register():
    if request.method =='POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password)
        conn = get_db_connection()
        c = conn.cursor()

        try:
            c.execute("INSERT INTO users (username, password) VALUES (?,?)", (username, hashed_password))
            conn.commit()
            flash("Registration successful! Please log in.", "success")
            return redirect(url_for('api.login'))
        except sqlite3.IntegrityError:
            flash("Username already exits. Try a different one,", "danger")
        finally:
            conn.close()
    
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = c.fetchone()
        conn.close()

        if user and check_password_hash(user[2], password):
            session['user_id'] = user[0]
            session['username'] = user[1]
            flash("Logged in successfully!", "success")
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid username or password", "danger")

    return render_template('login.html')


@auth_bp.route('/logout')
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for('api.login'))