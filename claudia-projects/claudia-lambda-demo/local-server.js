const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3333;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Lambda functions (same logic as the Claudia app)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Claudia Lambda Demo!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /',
      'GET /hello',
      'GET /hello/{name}',
      'POST /calculate',
      'GET /users',
      'GET /random'
    ]
  });
});

// Hello world endpoint
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Lambda!' });
});

// Dynamic route with path parameter
app.get('/hello/:name', (req, res) => {
  res.json({ 
    message: `Hello ${req.params.name}!`,
    method: req.method,
    path: req.path
  });
});

// POST endpoint with body parsing
app.post('/calculate', (req, res) => {
  const { a, b, operation } = req.body;
  
  let result;
  switch(operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      result = b !== 0 ? a / b : 'Cannot divide by zero';
      break;
    default:
      result = 'Invalid operation';
  }
  
  res.json({
    a,
    b,
    operation,
    result
  });
});

// Simulated database query
app.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  ];
  
  res.json({
    count: users.length,
    users
  });
});

// Random data generator
app.get('/random', (req, res) => {
  res.json({
    number: Math.floor(Math.random() * 100),
    uuid: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now(),
    quote: [
      "The only way to do great work is to love what you do.",
      "Innovation distinguishes between a leader and a follower.",
      "Life is what happens when you're busy making other plans.",
      "The future belongs to those who believe in the beauty of their dreams."
    ][Math.floor(Math.random() * 4)]
  });
});

// Error handling example
app.get('/error', (req, res) => {
  res.status(500).json({ error: 'This is a simulated error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Lambda Local Development Server Running!
================================================
Server URL: http://localhost:${PORT}
================================================

Available Endpoints:
  GET  http://localhost:${PORT}/              - API documentation
  GET  http://localhost:${PORT}/hello         - Simple hello
  GET  http://localhost:${PORT}/hello/YourName - Personalized hello
  GET  http://localhost:${PORT}/users         - List users
  GET  http://localhost:${PORT}/random        - Random data
  POST http://localhost:${PORT}/calculate     - Calculator

Test POST endpoint with:
curl -X POST http://localhost:${PORT}/calculate \\
  -H "Content-Type: application/json" \\
  -d '{"a": 10, "b": 5, "operation": "add"}'

📖 Open in browser:
  file://${__dirname}/index.html

Press Ctrl+C to stop the server
  `);
});