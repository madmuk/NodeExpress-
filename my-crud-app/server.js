const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Load and Save Functions
function loadItems() {
  try {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveItems(items) {
  fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2));
}

// Initial counter
let nextId = Date.now();

// Routes
app.get('/', (req, res) => {
  const items = loadItems();
  res.render('index', { items });
});

app.post('/items', (req, res) => {
  const { name } = req.body;
  if (name) {
    const items = loadItems();
    items.push({ id: nextId++, name });
    saveItems(items);
  }
  res.redirect('/');
});

app.post('/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const items = loadItems();
  const item = items.find(i => i.id === id);
  if (item) {
    item.name = req.body.name;
    saveItems(items);
  }
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let items = loadItems();
  items = items.filter(i => i.id !== id);
  saveItems(items);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
