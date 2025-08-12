// Vercel serverless function for retrieving a specific submission by ID
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'cihai-ugc';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Submission ID is required'
    });
  }

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    const collection = db.collection('submissions');

    // Find submission by ID
    const submission = await collection.findOne({ 
      _id: new ObjectId(id) 
    });
    
    await client.close();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: '提交记录未找到'
      });
    }

    res.json({
      success: true,
      submission
    });

  } catch (error) {
    console.error('Error retrieving submission:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
}
