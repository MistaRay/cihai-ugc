// Netlify function for AI content generation using DeepSeek API
exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      })
    };
  }

  try {
    const { image, mimeType } = JSON.parse(event.body || '{}');
    
    // Build optional image message part if provided
    const imageDataUrl = image && mimeType ? `data:${mimeType};base64,${image}` : null;

    // DeepSeek API configuration
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.REACT_APP_DEEPSEEK_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
    const stepfunKey = process.env.STEPFUN_API_KEY || process.env.REACT_APP_STEPFUN_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'DeepSeek API key not configured' 
        })
      };
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

    // If StepFun key is provided, prefer StepFun vision model (OpenAI-compatible schema)
    if (stepfunKey && imageDataUrl) {
      const stepUrl = 'https://api.stepfun.com/v1/chat/completions';
      const stepModel = process.env.STEPFUN_VISION_MODEL || 'step-1v';
      const stepBody = {
        model: stepModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageDataUrl } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      };

      const stepResp = await fetch(stepUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stepfunKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stepBody)
      });

      if (!stepResp.ok) {
        const errText = await stepResp.text();
        console.error('StepFun API error:', stepResp.status, errText);
        throw new Error(`StepFun API request failed: ${stepResp.status} ${stepResp.statusText}`);
      }

      const stepData = await stepResp.json();
      const aiMessage = stepData.choices?.[0]?.message;
      const aiResponse = Array.isArray(aiMessage?.content)
        ? aiMessage.content.map(part => (typeof part === 'string' ? part : part.text || '')).join('\n')
        : (aiMessage?.content || '');

      const titleMatch = aiResponse.match(/\*\*标题：\*\*\s*([^\n]+)/);
      const mainTextMatch = aiResponse.match(/\*\*正文：\*\*\s*([\s\S]*?)(?=\*\*标签：\*\*)/);
      const hashtagsMatch = aiResponse.match(/\*\*标签：\*\*\s*([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : "📚 辞海：知识的海洋，智慧的源泉";
      const mainText = mainTextMatch ? mainTextMatch[1].trim() : "今天分享这本陪伴我多年的辞海！作为一部权威的综合性辞书，辞海不仅收录了丰富的词汇，更是中华文化的瑰宝。";
      const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : "#辞海 #2025上海书展 #书香中国上海周 #辞海星空大章 #云端辞海·知识随行";
      const hashtags = hashtagsText.match(/#[^\s#]+/g) || ["#辞海", "#2025上海书展", "#书香中国上海周", "#辞海星空大章", "#云端辞海·知识随行"];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, content: { title, mainText, hashtags } })
      };
    }

    // If OpenAI key is provided, use OpenAI vision model for true image understanding
    if (openaiKey && imageDataUrl) {
      const oaUrl = 'https://api.openai.com/v1/chat/completions';
      const oaBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageDataUrl } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      };

      const oaResp = await fetch(oaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(oaBody)
      });

      if (!oaResp.ok) {
        const errText = await oaResp.text();
        console.error('OpenAI API error:', oaResp.status, errText);
        throw new Error(`OpenAI API request failed: ${oaResp.status} ${oaResp.statusText}`);
      }

      const oaData = await oaResp.json();
      const aiMessage = oaData.choices?.[0]?.message;
      const aiResponse = Array.isArray(aiMessage?.content)
        ? aiMessage.content.map(part => (typeof part === 'string' ? part : part.text || '')).join('\n')
        : (aiMessage?.content || '');

      const titleMatch = aiResponse.match(/\*\*标题：\*\*\s*([^\n]+)/);
      const mainTextMatch = aiResponse.match(/\*\*正文：\*\*\s*([\s\S]*?)(?=\*\*标签：\*\*)/);
      const hashtagsMatch = aiResponse.match(/\*\*标签：\*\*\s*([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : "📚 辞海：知识的海洋，智慧的源泉";
      const mainText = mainTextMatch ? mainTextMatch[1].trim() : "今天分享这本陪伴我多年的辞海！作为一部权威的综合性辞书，辞海不仅收录了丰富的词汇，更是中华文化的瑰宝。";
      const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : "#辞海 #2025上海书展 #书香中国上海周 #辞海星空大章 #云端辞海·知识随行";
      const hashtags = hashtagsText.match(/#[^\s#]+/g) || ["#辞海", "#2025上海书展", "#书香中国上海周", "#辞海星空大章", "#云端辞海·知识随行"];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, content: { title, mainText, hashtags } })
      };
    }

    // DeepSeek chat does not currently accept image parts; send text-only to avoid 422
    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt + (imageDataUrl ? "\n\n注意：如果你无法直接查看图片，请基于书籍照片（可能包含书封面、书脊、颜色、材质等）进行合理描述与创作。" : '')
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: generatedContent
      })
    };

  } catch (error) {
    console.error('Error generating AI content:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'AI内容生成失败，请稍后重试',
        error: error.message
      })
    };
  }
};
