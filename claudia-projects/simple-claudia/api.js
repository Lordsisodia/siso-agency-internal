const ApiBuilder = require('claudia-api-builder');
const api = new ApiBuilder();

api.get('/', () => 'Welcome to Claudia!');

api.get('/hello', () => ({ message: 'Hello from Claudia!' }));

api.get('/time', () => ({ 
  time: new Date().toISOString() 
}));

api.post('/echo', (request) => ({
  you_sent: request.body
}));

module.exports = api;