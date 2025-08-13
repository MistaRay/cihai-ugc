import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Link as LinkIcon, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const PostSubmission = () => {
  const [postLink, setPostLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve generated content from localStorage
    const content = localStorage.getItem('generatedContent');
    if (content) {
      setGeneratedContent(JSON.parse(content));
    } else {
      // If no content, redirect back to upload page
      navigate('/');
    }
  }, [navigate]);

  const isAllowedXHSUrl = (value) => {
    try {
      const url = new URL(value.trim());
      const hostname = url.hostname.toLowerCase();
      const allowedDomains = ['xiaohongshu.com', 'xhslink.com'];
      return allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postLink.trim()) {
      setSubmitStatus({ type: 'error', message: '请填写帖子链接' });
      return;
    }

    if (!isAllowedXHSUrl(postLink)) {
      setSubmitStatus({ type: 'error', message: '链接必须来自 xhslink.com 或 xiaohongshu.com' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const apiBase = process.env.REACT_APP_API_BASE || '/api';
      const response = await fetch(`${apiBase}/submit-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postLink: postLink.trim(),
          generatedContent
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: '提交成功！我们会尽快审核您的内容。' 
        });
        
        // Clear form
        setPostLink('');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: data.message || '提交失败，请重试' 
        });
      }
      
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: '网络错误，请检查连接后重试' 
      });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!generatedContent) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        加载中...
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="back-btn">
        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
        返回上传页面
      </Link>

      <div className="submit-form">
        <h2 className="content-title">
          <LinkIcon size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          提交您的帖子链接
        </h2>
        
        <p style={{ color: '#b0b0b0', marginBottom: '2rem', lineHeight: '1.6' }}>
          太好了！您已经生成了小红书内容。现在请分享您已发布帖子的链接，这样我们就能追踪您对辞海社区的贡献！📱✨
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="postLink" className="form-label">
              小红书帖子链接 *
            </label>
            <input
              type="url"
              id="postLink"
              className="form-input"
              placeholder="https://www.xiaohongshu.com/..."
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              pattern="https?://([A-Za-z0-9-]+\.)?(xiaohongshu|xhslink)\.com/.*"
              title="链接必须来自 xhslink.com 或 xiaohongshu.com"
              required
            />
            <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
              请粘贴您已发布的小红书帖子的直接链接
            </small>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting ? (
              <div className="loading">
                <div className="spinner"></div>
                提交中...
              </div>
            ) : (
              '提交帖子链接'
            )}
          </button>
        </form>

        {submitStatus && (
          <div className={`${submitStatus.type === 'success' ? 'success-message' : 'error-message'}`}>
            {submitStatus.type === 'success' ? (
              <CheckCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            ) : (
              <AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            )}
            {submitStatus.message}
          </div>
        )}

        {generatedContent && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#252525', borderRadius: '12px' }}>
            <h3 style={{ color: '#4ecdc4', marginBottom: '1rem', fontSize: '1.1rem' }}>
              生成内容预览：
            </h3>
            <div style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>标题：</strong> {generatedContent.title}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>正文：</strong> {generatedContent.mainText.substring(0, 100)}...
              </div>
              <div>
                <strong>标签：</strong> {generatedContent.hashtags.join(' ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostSubmission;

