import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, BookOpen, Sparkles } from 'lucide-react';

const PhotoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('图片文件过大，请选择小于10MB的图片。');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedContent(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('图片文件过大，请选择小于10MB的图片。');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedContent(null);
      setError(null);
    }
  };

  const generateContent = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    
    try {
      setError(null);
      // Convert image to base64 for API
      const base64Image = await convertImageToBase64(selectedFile);
      
      // Call DeepSeek API for content generation
      const content = await callDeepSeekAPI(base64Image);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('AI内容生成失败，请重试或联系客服。');
      // Fallback to default content if API fails
      const fallbackContent = {
        title: "📚 辞海：知识的海洋，智慧的源泉",
        mainText: `今天分享这本陪伴我多年的辞海！作为一部权威的综合性辞书，辞海不仅收录了丰富的词汇，更是中华文化的瑰宝。

翻开辞海，仿佛打开了知识的大门。每一个词条都经过精心编纂，既有学术的严谨性，又保持了通俗易懂的特点。无论是学习、工作还是日常查阅，辞海都是最可靠的伙伴。

特别推荐：
✨ 词条丰富，涵盖各个领域
✨ 释义准确，例句生动
✨ 编排科学，查找便捷
✨ 印刷精美，收藏价值高

辞海不仅是一本工具书，更是中华文化的传承者。让我们一起在知识的海洋中遨游，感受文字的魅力！`,
        hashtags: ["#辞海", "#2025上海书展", "#书香中国上海周", "#辞海星空大章", "#云端辞海·知识随行"]
      };
      setGeneratedContent(fallbackContent);
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Call DeepSeek API for content generation
  const callDeepSeekAPI = async (base64Image) => {
    const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
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

    // Clean and validate base64 data
    const cleanBase64 = base64Image.replace(/[^A-Za-z0-9+/=]/g, '');
    
    // Check if base64 is valid and not too long
    if (cleanBase64.length > 20000000) { // 20MB limit
      throw new Error('Image file is too large. Please use a smaller image.');
    }

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
                url: `data:image/jpeg;base64,${cleanBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    try {
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
        console.error('DeepSeek API error response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
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
      
      return {
        title,
        mainText,
        hashtags
      };
    } catch (error) {
      console.error('DeepSeek API call error:', error);
      throw error;
    }
  };

  const handleNextStep = () => {
    // Store the generated content in localStorage for the next page
    localStorage.setItem('generatedContent', JSON.stringify(generatedContent));
    navigate('/submit-post');
  };

  return (
    <div>
             <div className="upload-container" {...getRootProps()}>
         <input {...getInputProps()} />
         
         {!previewUrl ? (
           <>
             <Upload className="upload-icon" />
             <div className="upload-text">
               {isDragActive ? '将图片拖放到这里...' : '点击上传或拖拽图片'}
             </div>
             <div className="upload-subtext">
               上传辞海照片，生成小红书内容
             </div>
           </>
                  ) : (
           <div className="preview-container">
             <img src={previewUrl} alt="预览" className="preview-image" />
           </div>
         )}
       </div>

       {/* Generate AI Content button positioned below the preview */}
       {previewUrl && (
         <div className="button-container">
           <button
             className="generate-btn"
             onClick={generateContent}
             disabled={isGenerating}
           >
             {isGenerating ? (
               <div className="loading">
                 <div className="spinner"></div>
                 AI正在分析图片...
               </div>
             ) : (
               <>
                 <Sparkles size={20} style={{ marginRight: '8px' }} />
                 生成AI内容
               </>
             )}
           </button>
         </div>
       )}

               {/* Choose File button positioned below the upload container */}
        {!previewUrl && (
          <div className="button-container">
            <label htmlFor="file-input" className="generate-btn">
              选择文件
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
              id="file-input"
            />
          </div>
        )}

      {error && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      {generatedContent && (
        <div className="content-result">
          <h2 className="content-title">
            <BookOpen size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            生成的内容
          </h2>
          
          <div className="content-text">
            <strong>标题：</strong>
            {generatedContent.title}
            
            {'\n\n'}
            <strong>正文：</strong>
            {generatedContent.mainText}
            
            {'\n\n'}
            <strong>标签：</strong>
            {generatedContent.hashtags.join(' ')}
          </div>
          
          <div className="content-hashtags">
            {generatedContent.hashtags.map((tag, index) => (
              <span key={index} className="hashtag">{tag}</span>
            ))}
          </div>
          
          <button className="next-step-btn" onClick={handleNextStep}>
            下一步：提交帖子链接 →
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
