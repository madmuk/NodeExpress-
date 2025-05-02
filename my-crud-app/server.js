const express = require('express');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');  // Add this line
const app = express();
const PORT = 3000;

// Session setup
app.use(session({
  secret: 'your-secret-key', // Change this to a secure, random string
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash()); // Initialize flash messages

let items = [];
let nextId = 1;

// Render EJS template
app.get('/', (req, res) => {
  res.render('index', { items, message: req.flash('message') });
});

// Add Item
app.post('/items', (req, res) => {
  const { name } = req.body;
  if (name) {
    items.push({ id: nextId++, name });
    req.flash('message', 'Item added successfully!');
  }
  res.redirect('/');
});

// Update Item
app.post('/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(i => i.id === id);
  if (item) {
    item.name = req.body.name;
    req.flash('message', 'Item updated successfully!');
  }
  res.redirect('/');
});

// Delete Item
app.post('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  items = items.filter(i => i.id !== id);
  req.flash('message', 'Item deleted successfully!');
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
