const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory item storage
let items = [];
let nextId = 1;

// Route to show HTML form and item list
app.get('/', (req, res) => {
  const listHtml = items.map(item => `<li>${item.name}</li>`).join('');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Items</title>
      </head>
      <body>
        <h1>My Items</h1>
        <form method="POST" action="/items">
          <input name="name" placeholder="Item name" required />
          <button type="submit">Add</button>
        </form>
        <ul>${listHtml}</ul>
      </body>
    </html>
  `);
});

// Route to handle form submissions (add item)
app.post('/items', (req, res) => {
  const { name } = req.body;
  if (name && name.trim() !== '') {
    items.push({ id: nextId++, name: name.trim() });
    console.log('Item added:', name);
  } else {
    console.log('Invalid name received.');
  }
  res.redirect('/');
});

// API route to get all items as JSON
app.get('/api/items', (req, res) => {
  res.json(items);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
