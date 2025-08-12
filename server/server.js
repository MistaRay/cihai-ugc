const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
let submissions = [];

// API Routes
app.post('/api/submit-post', (req, res) => {
  try {
    const { postLink, name, email, generatedContent } = req.body;
    
    // Validate required fields
    if (!postLink || !name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写所有必填字段' 
      });
    }

    // Create submission object
    const submission = {
      id: Date.now().toString(),
      postLink,
      name,
      email,
      generatedContent,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Store submission
    submissions.push(submission);

    console.log('New submission received:', submission);

    res.json({
      success: true,
      message: '提交成功！我们会尽快审核您的内容。',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
});

// Get all submissions (admin endpoint)
app.get('/api/submissions', (req, res) => {
  res.json({
    success: true,
    submissions: submissions
  });
});

// Get submission by ID
app.get('/api/submissions/:id', (req, res) => {
  const submission = submissions.find(s => s.id === req.params.id);
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
});

// Update submission status (admin endpoint)
app.put('/api/submissions/:id/status', (req, res) => {
  const { status } = req.body;
  const submission = submissions.find(s => s.id === req.params.id);
  
  if (!submission) {
    return res.status(404).json({
      success: false,
      message: '提交记录未找到'
    });
  }

  submission.status = status;
  submission.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: '状态更新成功',
    submission
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '辞海UGC Backend is running!',
    timestamp: new Date().toISOString(),
    submissionsCount: submissions.length
  });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 辞海UGC Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Submit posts: http://localhost:${PORT}/api/submit-post`);
});
