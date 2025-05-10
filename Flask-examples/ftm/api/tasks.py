from flask import Blueprint, request, render_template, redirect, url_for, flash, session
import sqlite3

tasks_bp = Blueprint('tasks',__name__)

def get_db_connection():
    return sqlite3.connect('database.db')

@tasks_bp.route('/tasks')
def tasks():
    user_id = session.get('user_id')
    if not user_id:
        flash("Please log in first", "danger")
        return redirect(url_for('api.login'))
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM tasks WHERE user_id = ?', (user_id,))
    tasks = c.fetchall()
    conn.close()

    return render_template('tasks.html', tasks=tasks)

@tasks_bp.route('/tasks/add', methods=['GET','POST'])
def add_task():
    user_id = session['user_id']
    if not user_id:
        flash("Please log in first.", "danger")
        return redirect(url_for('api.login'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']

        conn = get_db_connection()
        c = conn.cursor()
        c.execute('INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
                  (user_id, title, description))
        conn.commit()
        conn.close()

        flash("Task added succesfully!", "sucess")
        return redirect(url_for('tasks.tasks'))
    
    return render_template('add_task.html')

@tasks_bp.route('/tasks/delete/<int:task_id>')
def delete_task(task_id):
    user_id = session.get('user_id')
    if not user_id:
        flash("Please Log in first,", "danger")
        return redirect(url_for('api.login'))
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', (task_id, user_id))
    flash("Successfully Deleted ", "success")
    conn.commit()
    conn.close()
    
    flash("Task deleted successfully","success")
    return redirect(url_for('tasks.tasks'))