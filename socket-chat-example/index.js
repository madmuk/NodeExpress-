const express = require('express');
const app = express();
const path = require('path');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Store messages in memory
const messages = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML form and message list
app.get('/', (req, res) => {
  let messageList = messages.map(msg => `<li>${msg}</li>`).join('');
  res.send(`
    <html>
      <body>
        <h1>Send a Message</h1>
        <form method="POST" action="/">
          <input type="text" name="message" placeholder="Type your message..." required>
          <button type="submit">Send</button>
        </form>
        <h2>Messages</h2>
        <ul>${messageList}</ul>
      </body>
    </html>
  `);
});

// Handle form submissions
app.post('/', (req, res) => {
  const { message } = req.body;
  if (message) {
    messages.push(message);
  }
  res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
