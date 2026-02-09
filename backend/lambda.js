// Lambda Handler for Express App
import serverlessHttp from 'serverless-http';
import app from './src/server.js';

// Configure serverless-http
const serverlessHandler = serverlessHttp(app, {
  binary: ['image/*', 'application/pdf']
});

// Export handler for Lambda - API Gateway handles CORS
export const handler = serverlessHandler;

