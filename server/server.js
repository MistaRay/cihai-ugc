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
    const { postLink, generatedContent } = req.body;
    
    // Validate required fields
    if (!postLink) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写帖子链接' 
      });
    }

    // Create submission object
    const submission = {
      id: Date.now().toString(),
      postLink,
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

// AI Content Generation endpoint (multimodal + timeout)
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
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.REACT_APP_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'DeepSeek API key not configured' 
      });
    }
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';

    const prompt = `你是一个专业的小红书内容创作AI助手。请严格基于用户上传的图片进行描述与创作，聚焦书籍相关要素（如封面文字、作者、出版社、装帧、拍摄场景、材质与光线、使用情境等），避免空泛描述。请使用自然中文口吻。

输出格式（只输出以下三部分，不要增加额外字符）：

**标题：**
[吸引人的标题，不超过30字]

**正文：**
[180-260字正文内容，小红书风格，积极正面，包含对图片中真实元素的描述与感受，可给出1-2条使用建议]

**标签：**
[3-5个相关标签，用#分隔] （#辞海 #2025上海书展 #书香中国上海周 #辞海星空大章 #云端辞海·知识随行）

要求：
1. 所有描述必须可由图片推断或佐证，不要编造看不见的信息。
2. 尽量点名图片中能读清的文字（如书名/作者/版次）或显著特征（颜色、装帧、边角磨损、拍摄环境）。
3. 不要出现“我无法看到图片”等表述。`;

    const userContent = image
      ? [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: `data:image/jpeg;base64,${image}` }
        ]
      : [{ type: 'text', text: `${prompt}\n（未提供图片时，围绕辞海或书籍主题写一段通用文案。）` }];

    const requestBody = {
      model: 'deepseek-multimodal',
      messages: [
        { role: 'system', content: '你是图文理解与内容生成助手，要求内容真实、具体、贴合图片细节。' },
        { role: 'user', content: userContent }
      ],
      max_tokens: 520,
      temperature: 0.6
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse the AI response to extract title, mainText, and hashtags
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
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
    const isTimeout = error?.name === 'AbortError';
    res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: isTimeout ? '生成超时，请稍后重试' : 'AI内容生成失败，请稍后重试',
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
