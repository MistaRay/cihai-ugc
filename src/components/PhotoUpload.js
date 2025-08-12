import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, BookOpen, Sparkles, Copy as CopyIcon } from 'lucide-react';

const PhotoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
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

  const handleCopy = async () => {
    if (!generatedContent) return;
    const textToCopy = `标题：${generatedContent.title}\n\n正文：${generatedContent.mainText}\n\n标签：${generatedContent.hashtags.join(' ')}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Copy failed:', err);
      setError('复制失败，请手动选择文本复制。');
    }
  };

  const generateContent = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    
    try {
      setError(null);
      // Convert image to base64 for serverless function
      const base64Image = await convertImageToBase64(selectedFile);
      // Call our Netlify function (server-side key, CORS-safe)
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

  // Call our Netlify function for content generation
  const callDeepSeekAPI = async (base64Image) => {
    try {
      const response = await fetch('/.netlify/functions/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Function error response:', errorText);
        throw new Error(`Function request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Function returned an error');
      }
      return data.content;
    } catch (error) {
      console.error('Function call error:', error);
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
          <div className="content-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="content-title">
              <BookOpen size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              生成的内容
            </h2>
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CopyIcon size={18} /> {copied ? '已复制' : '复制'}
            </button>
          </div>
          
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
          
          <div className="content-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="next-step-btn" onClick={handleNextStep}>
              下一步：提交帖子链接 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
