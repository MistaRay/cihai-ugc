const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

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

// AI Content Generation endpoint
app.post('/api/generate-content', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供图片数据' 
      });
    }

    // DeepSeek API configuration
    const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'DeepSeek API key not configured' 
      });
    }
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    const prompt = `你是一个专业的小红书内容创作AI助手。请根据用户提供的图片，生成高质量的小红书风格内容。

请严格按照以下格式输出，不要添加任何其他内容：

**标题：**
[吸引人的标题，不超过30字]

**正文：**
[200-300字正文内容，小红书风格，积极正面，包含实用建议或感悟]

**标签：**
[3-5个相关标签，用#分隔] （#标签1 #标签2 #标签3）

重要规则：
1. 直接生成内容，不要询问用户更多信息
2. 不要添加任何介绍性文字或问候语
3. 不要解释你的工作流程
4. 只输出标题、正文、标签三个部分
5. 基于用户提供的图片内容进行创作
6. 内容要积极正面，符合小红书平台调性
7. 标题要简洁有力，吸引人
8. 正文要自然流畅，有感染力
9. 标签要用 #辞海 #2025上海书展 #书香中国上海周 #辞海星空大章 #云端辞海·知识随行
10. 根据照片生成文案，不是瞎编

请分析这张图片并生成相应的小红书内容。`;

    const requestBody = {
      model: "deepseek-vision",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the AI response to extract title, mainText, and hashtags
    const aiResponse = data.choices[0].message.content;
    
    // Extract content using regex patterns
    const titleMatch = aiResponse.match(/\*\*标题：\*\*\s*([^\n]+)/);
    const mainTextMatch = aiResponse.match(/\*\*正文：\*\*\s*([\s\S]*?)(?=\*\*标签：\*\*)/);
    const hashtagsMatch = aiResponse.match(/\*\*标签：\*\*\s*([^\n]+)/);
    
    const title = titleMatch ? titleMatch[1].trim() : "📚 辞海：知识的海洋，智慧的源泉";
    const mainText = mainTextMatch ? mainTextMatch[1].trim() : "今天分享这本陪伴我多年的辞海！作为一部权威的综合性辞书，辞海不仅收录了丰富的词汇，更是中华文化的瑰宝。";
    const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : "#辞海 #2025上海书展 #书香中国上海周 #辞海星空大章 #云端辞海·知识随行";
    
    // Extract hashtags from the text
    const hashtags = hashtagsText.match(/#[^\s#]+/g) || ["#辞海", "#2025上海书展", "#书香中国上海周", "#辞海星空大章", "#云端辞海·知识随行"];
    
    const generatedContent = {
      title,
      mainText,
      hashtags
    };

    console.log('AI content generated successfully');
    
    res.json({
      success: true,
      content: generatedContent
    });

  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({
      success: false,
      message: 'AI内容生成失败，请稍后重试',
      error: error.message
    });
  }
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
