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
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedContent(null);
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
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedContent(null);
    }
  };

  const generateContent = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    
    try {
      setError(null);
      // Convert image to base64 for API
      const base64Image = await convertImageToBase64(selectedFile);
      
      // Call Zhipu API for content generation
      const content = await callZhipuAPI(base64Image);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('AI content generation failed. Please try again or contact support.');
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

  // Call serverless API proxy for content generation
  const callZhipuAPI = async (base64Image) => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
               {isDragActive ? 'Drop the image here...' : 'Click to upload or drag & drop'}
             </div>
             <div className="upload-subtext">
               Upload a photo of a book to generate social media content
             </div>
           </>
                  ) : (
           <div className="preview-container">
             <img src={previewUrl} alt="Preview" className="preview-image" />
           </div>
         )}
       </div>

       {/* Generate AI Content button positioned below the preview */}
       {previewUrl && (
         <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
           <button
             className="generate-btn"
             onClick={generateContent}
             disabled={isGenerating}
           >
             {isGenerating ? (
               <div className="loading">
                 <div className="spinner"></div>
                 Analyzing image with AI...
               </div>
             ) : (
               <>
                 <Sparkles size={20} style={{ marginRight: '8px' }} />
                 Generate AI Content
               </>
             )}
           </button>
         </div>
       )}

               {/* Choose File button positioned below the upload container */}
        {!previewUrl && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <label htmlFor="file-input" className="generate-btn">
              Choose File
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
            Generated Content
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
            Next Step: Submit Post Link →
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
