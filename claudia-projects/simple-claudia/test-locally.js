// This simulates how Claudia runs your function on AWS Lambda
const lambda = require('./lambda.js');

console.log('🚀 Testing Claudia function locally...\n');

// Simulate Lambda event and context
const event = {
  message: 'Test event data',
  timestamp: new Date().toISOString()
};

const context = {
  succeed: (result) => {
    console.log('✅ Lambda function succeeded with result:');
    console.log(result);
  },
  fail: (error) => {
    console.log('❌ Lambda function failed with error:');
    console.log(error);
  }
};

// Run the Lambda function
lambda.handler(event, context);