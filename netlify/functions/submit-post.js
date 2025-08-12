// Netlify function for handling post submissions
const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      })
    };
  }

  try {
    const { postLink, name, email, generatedContent } = JSON.parse(event.body);
    
    // Validate required fields
    if (!postLink || !name || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: '请填写所有必填字段' 
        })
      };
    }

    // Get environment variables
    const MONGODB_URI = process.env.MONGODB_URI;
    const MONGODB_DB = process.env.MONGODB_DB;

    // Check if environment variables are set
    if (!MONGODB_URI || !MONGODB_DB) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Database configuration error'
        })
      };
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    const collection = db.collection('submissions');

    // Create submission object
    const submission = {
      postLink,
      name,
      email,
      generatedContent,
      timestamp: new Date().toISOString(),
      status: 'pending',
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      userAgent: event.headers['user-agent']
    };

    // Store submission in database
    const result = await collection.insertOne(submission);
    
    await client.close();

    console.log('New submission received:', submission);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '提交成功！我们会尽快审核您的内容。',
        submissionId: result.insertedId.toString()
      })
    };

  } catch (error) {
    console.error('Error processing submission:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '服务器错误，请稍后重试'
      })
    };
  }
};
