// Vercel serverless function to proxy Zhipu/BigModel requests
// Keeps API key off the client and avoids exposing secrets in the repo

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image } = req.body || {};
    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image' });
    }

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing ZHIPU_API_KEY on server' });
    }

    const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const prompt = `你是一个专业的小红书内容创作AI助手。请根据用户提供的图片，生成高质量的小红书风格内容。\n\n请严格按照以下格式输出，不要添加任何其他内容：\n\n**标题：**\n[吸引人的标题，不超过30字]\n\n**正文：**\n[200-300字正文内容，小红书风格，积极正面，包含实用建议或感悟]\n\n**标签：**\n[3-5个相关标签，用#分隔] （#标签1 #标签2 #标签3）\n\n重要规则：\n1. 直接生成内容，不要询问用户更多信息\n2. 不要添加任何介绍性文字或问候语\n3. 不要解释你的工作流程\n4. 只输出标题、正文、标签三个部分\n5. 基于用户提供的图片内容进行创作\n6. 内容要积极正面，符合小红书平台调性\n7. 标题要简洁有力，吸引人\n8. 正文要自然流畅，有感染力\n9. 标签要用 #辞海 #2025上海书展 #书香中国上海周 #辞海星空大章 #云端辞海·知识随行\n10. 根据照片生成文案，不是瞎编\n\n请分析这张图片并生成相应的小红书内容。`;

    const requestBody = {
      model: 'glm-4v',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Zhipu API error: ${text}` });
    }

    const data = await response.json();
    const aiResponse = data?.choices?.[0]?.message?.content || '';

    const titleMatch = aiResponse.match(/\*\*标题：\*\*\s*([^\n]+)/);
    const mainTextMatch = aiResponse.match(/\*\*正文：\*\*\s*([\s\S]*?)(?=\*\*标签：\*\*)/);
    const hashtagsMatch = aiResponse.match(/\*\*标签：\*\*\s*([^\n]+)/);

    const title = titleMatch ? titleMatch[1].trim() : '📚 辞海：知识的海洋，智慧的源泉';
    const mainText = mainTextMatch
      ? mainTextMatch[1].trim()
      : '今天分享这本陪伴我多年的辞海！作为一部权威的综合性辞书，辞海不仅收录了丰富的词汇，更是中华文化的瑰宝。';
    const hashtagsText = hashtagsMatch
      ? hashtagsMatch[1].trim()
      : '#辞海 #2025上海书展 #书香中国上海周 #辞海星空大章 #云端辞海·知识随行';

    const hashtags = hashtagsText.match(/#[^\s#]+/g) || [
      '#辞海',
      '#2025上海书展',
      '#书香中国上海周',
      '#辞海星空大章',
      '#云端辞海·知识随行',
    ];

    return res.status(200).json({ title, mainText, hashtags });
  } catch (error) {
    console.error('Error in generate function:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}


