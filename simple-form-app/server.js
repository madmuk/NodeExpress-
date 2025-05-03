const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app=express();
const PORT =3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({extended: true}))

// Server static files
app.use(express.static(path.join(__dirname, 'public')));

//In memory store
const submissions =[];

//Handle form POST
app.post('/submit', (req, res) => {
    const username = req.body.username;
    if (username) {
        submissions.push(username);
        res.send(`<h3>Thanks, ${username}! </h3><a href="/"></a>`)
    } else {
        res.status(400).send('Name is required. ');
    }

});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})