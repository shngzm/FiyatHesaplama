// Lambda Handler for Express App
import serverlessHttp from 'serverless-http';
import app from './src/server.js';

// Configure serverless-http with proper timeout handling
const serverlessHandler = serverlessHttp(app, {
  binary: ['image/*', 'application/pdf'],
  request: (request, event, context) => {
    // Add timeout handling
    context.callbackWaitsForEmptyEventLoop = false;
  }
});

// Wrap handler with error handling and logging
export const handler = async (event, context) => {
  console.log('[LAMBDA] Request:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers
  });

  try {
    // Set timeout context
    context.callbackWaitsForEmptyEventLoop = false;
    
    const result = await serverlessHandler(event, context);
    
    console.log('[LAMBDA] Response:', {
      statusCode: result.statusCode,
      path: event.path
    });
    
    return result;
  } catch (error) {
    console.error('[LAMBDA] Error:', {
      message: error.message,
      stack: error.stack,
      path: event.path
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

