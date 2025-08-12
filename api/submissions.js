// Vercel serverless function for retrieving all submissions
import { MongoClient } from 'mongodb';

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

    // Get all submissions, sorted by timestamp (newest first)
    const submissions = await collection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    await client.close();

    res.json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('Error retrieving submissions:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
}
