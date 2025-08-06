const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Proxy all /api requests to the main backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Remove problematic headers
    proxyReq.removeHeader('origin');
  }
}));

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🔄 Proxy server running on port ${PORT}`);
  console.log(`Frontend should use: http://localhost:${PORT}/api`);
});

module.exports = app;