const express = require('express');
const cors = require('cors');
const path = require('path');
const { analyzeWebsite } = require('./utils/analyzeWebsite');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await analyzeWebsite(url, { rejectUnauthorized: false });
    res.json(result);
  } catch (error) {
    console.error(`Error analyzing website: ${req.body.url}`, error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;