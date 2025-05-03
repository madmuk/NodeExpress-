const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const app=express();
const PORT =3000;
const bcrypt = require('bcrypt');
// Middleware to parse form data
app.use(bodyParser.urlencoded({extended: true}))

// Server static files
app.use(express.static(path.join(__dirname, 'public')));

// Setup SQLite DB
const db= new sqlite3.Database('./form_data.db');
app.use(session({
    secret: 'secret-key', // In real apps, use an environment variable
    resave: false,
    saveUninitialized: true
  }));

// // Create table if not exists
// db.run(`CREATE TABLE IF NOT EXISTS submissions (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT NOT NULL
//   );`);

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );`);
  
// Handle form POST and storein database
app.post('/submit', (req, res) => {
    const username = req.body.username;
    if (username) {
      db.run(`INSERT INTO submissions (username) VALUES (?)`, [username], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).send('Database error');
        }
        res.send(`<h3>Thanks, ${username}!</h3><a href="/">Go back</a>`);
      });
    } else {
      res.status(400).send('Name is required.');
    }
  });
  // Show submitted names
// Show submitted names with delete button
app.get('/submissions', (req, res) => {
    db.all(`SELECT * FROM submissions`, [], (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Database error');
      }
  
      let html = '<h2>Submitted Names:</h2><ul>';
      rows.forEach(row => {
        html += `
          <li>
            ${row.username}
            <form action="/delete/${row.id}" method="POST" style="display:inline;">
              <button type="submit">Delete</button>
            </form>
          </li>`;
      });
      html += '</ul><a href="/">Go back</a>';
      res.send(html);
    });
  });
  
// Delete by ID
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM submissions WHERE id = ?`, [id], (err) => {
      if (err) {
        return res.status(500).send('Delete failed.');
      }
      res.redirect('/submissions');
    });
  });
  app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], (err) => {
      if (err) {
        return res.status(400).send("Username already taken.");
      }
      res.send(`<h3>Signup successful!</h3><a href="/login.html">Login here</a>`);
    });
  });

app.post('/login', (req,res) =>{
    const {username, password} = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
      if(err || !user){
        return res.status(400).send("Invalid username");
      }

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = user.username;
        res.send(`<h3> Welcome, ${user.username}!</h3><a href="/"'>Go To Home </a> `)
      } else {
        res.status(401).send("Incorrect Password")
      }
    })
})
//In memory store
//const submissions =[];

//Handle form POST and stored in in-memory
// app.post('/submit', (req, res) => {
//     const username = req.body.username;
//     if (username) {
//         submissions.push(username);
//         res.send(`<h3>Thanks, ${username}! </h3><a href="/">Go Back</a>`)
//     } else {
//         res.status(400).send('Name is required. ');
//     }

// });
//Handle form POST and stored in in-memory file 
// app.post('/submit', (req,res) => {
//     const username = req.body.username;
//     if (username){
//         const entry = `${username}\n`;
//         fs.appendFile('data.txt', entry, (err) => {
//             if(err) {
//                 console.error('Failed to write to file;', err);
//                 return res.status(500).send('Something went wrong');
//             }
//             res.send(`<h3>Thanks, ${username}! </h3><a href="/">Go Back</a>`)
//         });
//     } else {
//         res.status(400).send('Name is required');
//     }
    
// });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})