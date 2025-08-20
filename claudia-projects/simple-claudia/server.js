const express = require('express');
const app = express();
const PORT = 5555;

app.use(express.json());

// HTML interface for the root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Claudia.js Local</title>
      <style>
        body {
          font-family: -apple-system, system-ui, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #333;
          margin-bottom: 30px;
        }
        .endpoint {
          background: #f5f5f5;
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .endpoint:hover {
          background: #667eea;
          color: white;
          transform: translateX(10px);
        }
        .result {
          background: #f0f0f0;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
        }
        button {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          margin: 5px;
        }
        button:hover {
          background: #764ba2;
        }
        input {
          padding: 10px;
          margin: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Claudia.js Running Locally!</h1>
        <p>Click any endpoint to test it:</p>
        
        <div class="endpoint" onclick="testAPI('/hello')">
          GET /hello - Get a greeting
        </div>
        
        <div class="endpoint" onclick="testAPI('/time')">
          GET /time - Get current time
        </div>
        
        <div class="endpoint" onclick="testAPI('/random')">
          GET /random - Get random data
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <h3>Test POST Request:</h3>
        <input type="text" id="message" placeholder="Enter a message" value="Hello Claudia!">
        <button onclick="testPost()">Send POST to /echo</button>
        
        <div id="result" class="result">Click an endpoint to see the response...</div>
      </div>
      
      <script>
        async function testAPI(endpoint) {
          try {
            const response = await fetch(endpoint);
            const data = await response.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').textContent = 'Error: ' + error.message;
          }
        }
        
        async function testPost() {
          const message = document.getElementById('message').value;
          try {
            const response = await fetch('/echo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: message, timestamp: new Date() })
            });
            const data = await response.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').textContent = 'Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoints
app.get('/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Claudia!',
    running_on: 'Your local machine',
    no_aws_needed: true
  });
});

app.get('/time', (req, res) => {
  res.json({ 
    current_time: new Date().toISOString(),
    unix_timestamp: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
});

app.get('/random', (req, res) => {
  const quotes = [
    "Code is poetry written in logic",
    "Simplicity is the ultimate sophistication",
    "First, solve the problem. Then, write the code.",
    "Make it work, make it right, make it fast."
  ];
  
  res.json({
    random_number: Math.floor(Math.random() * 100),
    random_id: Math.random().toString(36).substring(2, 15),
    random_quote: quotes[Math.floor(Math.random() * quotes.length)],
    dice_roll: Math.floor(Math.random() * 6) + 1
  });
});

app.post('/echo', (req, res) => {
  res.json({ 
    you_sent: req.body,
    echoed_at: new Date().toISOString(),
    word_count: JSON.stringify(req.body).split(' ').length
  });
});

// Lambda test endpoint
app.post('/lambda-test', (req, res) => {
  // Simulate Lambda context
  const context = {
    functionName: 'claudia-local-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:local:123456789:function:claudia-local',
    memoryLimitInMB: '128',
    awsRequestId: Math.random().toString(36).substring(2, 15),
    logGroupName: '/aws/lambda/claudia-local'
  };
  
  res.json({
    statusCode: 200,
    body: {
      message: 'Lambda function executed successfully',
      event: req.body,
      context: context,
      result: 'Hello from Claudia Lambda!'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
✅ Claudia is running!
   
📍 Open in browser: http://localhost:${PORT}
  `);
});