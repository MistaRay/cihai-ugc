// Vercel serverless function for handling post submissions
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    if (!MONGODB_URI || !MONGODB_DB) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: database environment variables are missing.'
      });
    }
    const { postLink, name, email, generatedContent } = req.body;
    
    // Validate required fields
    if (!postLink || !name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写所有必填字段' 
      });
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
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    // Store submission in database
    const result = await collection.insertOne(submission);
    
    await client.close();

    console.log('New submission received:', submission);

    res.json({
      success: true,
      message: '提交成功！我们会尽快审核您的内容。',
      submissionId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
}
