// Vercel serverless function for retrieving a single submission by ID
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

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

  // Check if environment variables are set
  if (!MONGODB_URI || !MONGODB_DB) {
    return res.status(500).json({
      success: false,
      message: 'Database configuration error'
    });
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    const collection = db.collection('submissions');

    // Find submission by ID
    const submission = await collection.findOne({ _id: new ObjectId(id) });

    await client.close();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
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
