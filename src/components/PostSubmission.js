import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Link as LinkIcon, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const PostSubmission = () => {
  const [postLink, setPostLink] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postLink.trim() || !userName.trim() || !email.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call - in a real app, this would submit to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store submission data (in a real app, this would go to your database)
      const submissionData = {
        postLink: postLink.trim(),
        userName: userName.trim(),
        email: email.trim(),
        generatedContent,
        submittedAt: new Date().toISOString()
      };
      
      localStorage.setItem('submissionData', JSON.stringify(submissionData));
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you! Your submission has been received successfully.' 
      });
      
      // Clear form
      setPostLink('');
      setUserName('');
      setEmail('');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'An error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!generatedContent) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="back-btn">
        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
        Back to Upload
      </Link>

      <div className="submit-form">
        <h2 className="content-title">
          <LinkIcon size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Submit Your Post Link
        </h2>
        
        <p style={{ color: '#b0b0b0', marginBottom: '2rem', lineHeight: '1.6' }}>
          Great! You've generated your social media content. Now please share the link to your published post so we can track your contribution to the 辞海 community! 📱✨
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="postLink" className="form-label">
              Social Media Post Link *
            </label>
            <input
              type="url"
              id="postLink"
              className="form-input"
              placeholder="https://www.xiaohongshu.com/..."
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              required
            />
            <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
              Please paste the direct link to your published social media post
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              Your Name *
            </label>
            <input
              type="text"
              id="userName"
              className="form-input"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
              We'll use this to contact you about your submission
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
                Submitting...
              </div>
            ) : (
              'Submit Post Link'
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
              Generated Content Preview:
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

