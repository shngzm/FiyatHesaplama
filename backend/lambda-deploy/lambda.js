// Lambda Handler for Express App
import serverlessHttp from 'serverless-http';
import app from './src/server.js';

// Configure serverless-http with proper error handling
const serverlessHandler = serverlessHttp(app, {
  binary: ['image/*', 'application/pdf'],
  request: (request, event, context) => {
    // Add Lambda context to request
    request.context = context;
    request.event = event;
  },
  response: (response, event, context) => {
    // Ensure proper CORS headers
    response.headers = response.headers || {};
    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Credentials'] = 'true';
  }
});

// Lambda handler with error catching
export const handler = async (event, context) => {
  try {
    // Set callback to false to avoid waiting for empty event loop
    context.callbackWaitsForEmptyEventLoop = false;

    console.log('Lambda invoked:', {
      path: event.path,
      method: event.httpMethod,
      headers: event.headers
    });

    const result = await serverlessHandler(event, context);

    console.log('Lambda response:', {
      statusCode: result.statusCode,
      headers: result.headers
    });

    return result;
  } catch (error) {
    console.error('Lambda handler error:', {
      message: error.message,
      stack: error.stack
    });

    // Return proper error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

