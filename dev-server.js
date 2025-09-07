/**
 * Development Server for Testing API Endpoints
 * 
 * Simple Express server that runs the Vercel serverless functions locally
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the API functions
import morningRoutineHandler from './api/morning-routine.js';
import lightWorkTasksHandler from './api/light-work/tasks.js';
import deepWorkTasksHandler from './api/deep-work/tasks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - Mirror Vercel serverless functions
app.all('/api/morning-routine', (req, res) => {
  morningRoutineHandler(req, res);
});

app.all('/api/light-work/tasks', (req, res) => {
  lightWorkTasksHandler(req, res);
});

app.all('/api/deep-work/tasks', (req, res) => {
  deepWorkTasksHandler(req, res);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/morning-routine?userId=test&date=2025-01-07`);
  console.log(`   POST http://localhost:${PORT}/api/morning-routine`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});