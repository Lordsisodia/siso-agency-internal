const express = require('express');
const app = express();
app.use(express.json());

// Import your Claudia API
const claudiaApi = require('./api');

// Convert Claudia routes to Express
const routes = claudiaApi.apiConfig().routes;

routes.forEach(route => {
  const expressMethod = route.method.toLowerCase();
  const expressPath = route.path.replace(/{([^}]+)}/g, ':$1');
  
  app[expressMethod](expressPath, async (req, res) => {
    const claudiaRequest = {
      body: req.body,
      pathParams: req.params,
      queryString: req.query
    };
    
    try {
      const result = await route.handler(claudiaRequest);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

app.listen(4000, () => {
  console.log('\n✅ Claudia API running locally!\n');
  console.log('Test it:');
  console.log('  http://localhost:4000/');
  console.log('  http://localhost:4000/hello');
  console.log('  http://localhost:4000/time\n');
});