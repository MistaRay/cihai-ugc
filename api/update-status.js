// Vercel serverless function for updating submission status
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Submission ID and status are required' 
    });
  }

  // Validate status
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid status. Must be one of: pending, approved, rejected' 
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

    // Update submission status
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
}
