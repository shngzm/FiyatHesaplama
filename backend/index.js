// Lambda Handler for Express App
import serverlessHttp from 'serverless-http';
import app from './src/server.js';

// Export handler for Lambda
export const handler = serverlessHttp(app);
