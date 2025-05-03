const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app=express();
const PORT =3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({extended: true}))

// Server static files
app.use(express.static(path.join(__dirname, 'public')));

// Setup SQLite DB
const db= new sqlite3.Database('./form_data.db');

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL
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
app.get('/submissions', (req, res) => {
    db.all(`SELECT * FROM submissions`, [], (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Database error');
      }
  
      let html = '<h2>Submitted Names:</h2><ul>';
      rows.forEach(row => {
        html += `<li>${row.username}</li>`;
      });
      html += '</ul><a href="/">Go back</a>';
      res.send(html);
    });
  });
  
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