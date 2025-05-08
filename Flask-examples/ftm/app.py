from flask import Flask, session, redirect, url_for
from api.auth import auth_bp
app = Flask(__name__)
app.secret_key= 'my_secret_key'
app.register_blueprint(auth_bp)


@app.route('/')
def home():
    return redirect(url_for('api.login'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('api.login'))
    return f"Welcome {session['username']}! <br><a href='/logout'>Logout</a>"

if __name__ == '__main__':
    app.run(debug=True)