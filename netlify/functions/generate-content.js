// Netlify function for AI content generation using DeepSeek API (multimodal)
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
    const { image } = JSON.parse(event.body || '{}');

    // DeepSeek API configuration
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.REACT_APP_DEEPSEEK_API_KEY;
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

    // Build OpenAI-compatible multimodal message if image is provided
    const userContent = image
      ? [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: `data:image/jpeg;base64,${image}` }
        ]
      : [{ type: 'text', text: `${prompt}\n（未提供图片时，围绕辞海或书籍主题写一段通用文案。）` }];

    const requestBody = {
      // Multimodal model; falls back to text if无图
      model: 'deepseek-multimodal',
      messages: [
        {
          role: 'system',
          content: '你是图文理解与内容生成助手，要求内容真实、具体、贴合图片细节。'
        },
        {
          role: 'user',
          content: userContent
        }
      ],
      max_tokens: 520,
      temperature: 0.6
    };

    // Add a request timeout to avoid very slow generations causing UI errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000); // 14s budget within Netlify limits

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
    const isTimeout = error?.name === 'AbortError';
    return {
      statusCode: isTimeout ? 504 : 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: isTimeout ? '生成超时，请稍后重试' : 'AI内容生成失败，请稍后重试',
        error: error.message
      })
    };
  }
};
