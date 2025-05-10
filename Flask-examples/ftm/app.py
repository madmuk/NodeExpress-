from flask import Flask, session, redirect, url_for, render_template
from api.auth import auth_bp
from api.tasks import tasks_bp
import sqlite3

app = Flask(__name__)
app.secret_key = 'my_secret_key'

app.register_blueprint(auth_bp)
app.register_blueprint(tasks_bp)

def get_db_connection():
    return sqlite3.connect('database.db')

@app.route('/')
def home():
    return redirect(url_for('api.login'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('api.login'))

    user_id = session['user_id']
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM tasks WHERE user_id = ?', (user_id,))
    tasks = c.fetchall()
    conn.close()

    return render_template('dashboard.html', username=session['username'], tasks=tasks)

if __name__ == '__main__':
    app.run(debug=True)
