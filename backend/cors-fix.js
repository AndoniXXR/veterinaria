// Temporary CORS fix - run this to update CORS configuration
const express = require('express');
const cors = require('cors');

const app = express();

// Allow all origins in development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    data: { products: [] }
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Temporary CORS-enabled server running on port ${PORT}`);
  console.log(`Test with: http://localhost:${PORT}/api/products`);
});

module.exports = app;