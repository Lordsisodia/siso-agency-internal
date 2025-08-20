# Claudia Quick Start

## What is Claudia?
Claudia deploys your Node.js code to AWS Lambda (serverless functions).

## Files in this project:
- `lambda.js` - Simple Lambda function
- `api.js` - REST API using Claudia
- `test-locally.js` - Test without AWS

## To test locally:
```bash
node test-locally.js
```

## To deploy to AWS:

### 1. First, set up AWS credentials:
```bash
# Option A: Use AWS CLI
aws configure

# Option B: Use environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### 2. Deploy with Claudia:
```bash
# Deploy the simple function
claudia create --region us-east-1 --handler lambda.handler

# OR deploy the API
claudia create --region us-east-1 --api-module api
```

### 3. After deployment:
Claudia will give you a URL like:
```
https://xxxxx.execute-api.us-east-1.amazonaws.com/latest
```

## Without AWS (Local Testing):

Since you don't have AWS configured yet, run:
```bash
node test-locally.js
```

This shows you exactly how your function would work on AWS Lambda.