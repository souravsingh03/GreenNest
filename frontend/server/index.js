const express = require('express');
const app = express();
const port = 5000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files (optional, for CSS, images, etc.)
app.use(express.static('public'));

// Define a basic route
app.get('/', (req, res) => {
  res.render('index', { title: 'My Website' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
