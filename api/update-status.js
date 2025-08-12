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

  // Validate status values
  const validStatuses = ['pending', 'approved', 'rejected', 'processing'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  try {
    if (!MONGODB_URI || !MONGODB_DB) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: database environment variables are missing.'
      });
    }
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    const collection = db.collection('submissions');

    // Update submission status
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    await client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '提交记录未找到'
      });
    }

    res.json({
      success: true,
      message: '状态更新成功',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
}
