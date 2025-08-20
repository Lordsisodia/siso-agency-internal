const ApiBuilder = require('claudia-api-builder');
const api = new ApiBuilder();

// Sample Lambda functions

// Root endpoint
api.get('/', () => {
  return {
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
  };
});

// Hello world endpoint
api.get('/hello', () => {
  return { message: 'Hello from Lambda!' };
});

// Dynamic route with path parameter
api.get('/hello/{name}', (request) => {
  return { 
    message: `Hello ${request.pathParams.name}!`,
    method: request.context.method,
    path: request.context.path
  };
});

// POST endpoint with body parsing
api.post('/calculate', (request) => {
  const { a, b, operation } = request.body;
  
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
  
  return {
    a,
    b,
    operation,
    result
  };
});

// Simulated database query
api.get('/users', () => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  ];
  
  return {
    count: users.length,
    users
  };
});

// Random data generator
api.get('/random', () => {
  return {
    number: Math.floor(Math.random() * 100),
    uuid: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now(),
    quote: [
      "The only way to do great work is to love what you do.",
      "Innovation distinguishes between a leader and a follower.",
      "Life is what happens when you're busy making other plans.",
      "The future belongs to those who believe in the beauty of their dreams."
    ][Math.floor(Math.random() * 4)]
  };
});

// Error handling example
api.get('/error', () => {
  throw new Error('This is a simulated error');
});

module.exports = api;