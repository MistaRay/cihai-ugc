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

    // Validate link domain (only allow xhslink.com or xiaohongshu.com)
    const isAllowedXHSUrl = (value) => {
      try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();
        const allowedDomains = ['xhslink.com', 'xiaohongshu.com'];
        return allowedDomains.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
        );
      } catch {
        return false;
      }
    };

    if (!isAllowedXHSUrl(postLink)) {
      return res.status(400).json({
        success: false,
        message: '链接必须来自 xhslink.com 或 xiaohongshu.com'
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

// AI Content Generation endpoint
app.post('/api/generate-content', async (req, res) => {
  try {
    const { image, mimeType } = req.body || {};

    const BASE_TAGS = ["#辞海", "#2025上海书展", "#书香中国上海周", "#辞海星空大章", "#云端辞海·知识随行"];
    const mergeBaseTags = (aiTags) => {
      const set = new Set(BASE_TAGS);
      for (const tag of aiTags || []) {
        if (typeof tag === 'string' && tag.trim().startsWith('#')) set.add(tag.trim());
      }
      return Array.from(set);
    };

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

    const stepfunKey = process.env.STEPFUN_API_KEY || process.env.REACT_APP_STEPFUN_API_KEY;
    const stepBase = process.env.STEPFUN_API_BASE || 'https://api.stepfun.com/v1';

    if (!stepfunKey) {
      return res.status(500).json({ success: false, message: 'StepFun API key not configured' });
    }

    const imageDataUrl = image && mimeType ? `data:${mimeType};base64,${image}` : null;

    if (imageDataUrl) {
      const primaryUrl = `${stepBase.replace(/\/$/, '')}/chat/completions`;
      const stepModel = process.env.STEPFUN_VISION_MODEL || 'step-1v-32k';

      const bodies = (() => {
        const common = { model: stepModel, max_tokens: 1000, temperature: 0.7 };
        return [
          { ...common, messages: [ { role: 'user', content: [ { type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageDataUrl } } ] } ] },
          { ...common, messages: [ { role: 'user', content: [ { type: 'text', text: prompt }, { type: 'image_url', image_url: imageDataUrl } ] } ] },
          { ...common, messages: [ { role: 'user', content: [ { type: 'text', text: prompt }, { type: 'image', image_url: imageDataUrl } ] } ] }
        ];
      })();

      let respData = null;
      let lastErr = '';
      for (const body of bodies) {
        let stepResp = await fetch(primaryUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${stepfunKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (stepResp.status === 404) {
          const fallbackUrl = primaryUrl.replace('/v1', '');
          stepResp = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${stepfunKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
        }
        if (stepResp.ok) {
          respData = await stepResp.json();
          break;
        }
        lastErr = await stepResp.text();
        if (!(stepResp.status === 400 || stepResp.status === 422)) {
          console.error('StepFun API error:', stepResp.status, lastErr);
          return res.status(stepResp.status).json({ success: false, message: 'StepFun request failed' });
        }
      }
      if (!respData) {
        return res.status(422).json({ success: false, message: `StepFun schema not accepted: ${lastErr}` });
      }

      const aiMessage = respData.choices?.[0]?.message;
      const aiResponse = Array.isArray(aiMessage?.content)
        ? aiMessage.content.map(part => (typeof part === 'string' ? part : part.text || '')).join('\n')
        : (aiMessage?.content || '');

      const titleMatch = aiResponse.match(/\*\*标题：\*\*\s*([^\n]+)/);
      const mainTextMatch = aiResponse.match(/\*\*正文：\*\*\s*([\s\S]*?)(?=\*\*标签：\*\*)/);
      const hashtagsMatch = aiResponse.match(/\*\*标签：\*\*\s*([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : "📚 辞海：知识的海洋，智慧的源泉";
      const mainText = mainTextMatch ? mainTextMatch[1].trim() : "今天分享这本陪伴我多年的辞海！作为一部权威的综合性辞书，辞海不仅收录了丰富的词汇，更是中华文化的瑰宝。";
      const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : "";
      const hashtags = mergeBaseTags(hashtagsText.match(/#[^\s#]+/g));

      return res.json({ success: true, content: { title, mainText, hashtags } });
    }

    // Text-only fallback if no image supplied
    const stepUrl = `${stepBase.replace(/\/$/, '')}/chat/completions`;
    const textModel = process.env.STEPFUN_TEXT_MODEL || 'step-1';
    const stepResp = await fetch(stepUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stepfunKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: textModel,
        messages: [ { role: 'user', content: prompt } ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!stepResp.ok) {
      const err = await stepResp.text();
      console.error('StepFun API error (text):', stepResp.status, err);
      return res.status(stepResp.status).json({ success: false, message: 'StepFun request failed' });
    }

    const stepData = await stepResp.json();
    const aiResponse = stepData.choices?.[0]?.message?.content || '';
    const titleMatch = aiResponse.match(/\*\*标题：\*\*\s*([^\n]+)/);
    const mainTextMatch = aiResponse.match(/\*\*正文：\*\*\s*([\s\S]*?)(?=\*\*标签：\*\*)/);
    const hashtagsMatch = aiResponse.match(/\*\*标签：\*\*\s*([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : "📚 辞海：知识的海洋，智慧的源泉";
    const mainText = mainTextMatch ? mainTextMatch[1].trim() : "今天分享这本陪伴我多年的辞海！作为一部权威的综合性辞书，辞海不仅收录了丰富的词汇，更是中华文化的瑰宝。";
    const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : "";
    const hashtags = mergeBaseTags(hashtagsText.match(/#[^\s#]+/g));

    return res.json({ success: true, content: { title, mainText, hashtags } });

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
