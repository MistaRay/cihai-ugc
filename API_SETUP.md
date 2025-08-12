# 🔑 DeepSeek API Integration Setup

This document explains how to set up and configure the DeepSeek API integration for the 辞海UGC application.

## 🚀 What's Been Updated

The application has been successfully migrated from Zhipu API to DeepSeek API. Here's what changed:

### Frontend Changes
- ✅ Updated `PhotoUpload.js` to use DeepSeek API instead of Zhipu
- ✅ Added automatic detection for Netlify vs local development
- ✅ Removed hardcoded API keys from frontend code

### Backend Changes
- ✅ Added new `/api/generate-content` endpoint in `server/server.js`
- ✅ Integrated DeepSeek API with proper error handling
- ✅ Added environment variable support for API key

### Netlify Functions
- ✅ Created new `netlify/functions/generate-content.js` function
- ✅ Handles AI content generation on Netlify deployment

## 🔧 Configuration

### Local Development

1. **Set Environment Variable** (recommended):
   ```bash
   # In your server directory
   export DEEPSEEK_API_KEY="your_deepseek_api_key_here"
   ```

2. **Or create a .env file** (if not blocked by gitignore):
   ```bash
   # server/.env
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the backend server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Start the frontend**:
   ```bash
   npm start
   ```

### Netlify Deployment

1. **Set Environment Variable in Netlify**:
   - Go to your Netlify dashboard
   - Navigate to Site settings > Environment variables
   - Add: `DEEPSEEK_API_KEY` = `your_deepseek_api_key_here`

2. **Deploy**:
   - The application will automatically use the Netlify function
   - No additional configuration needed

## 🔍 API Endpoints

### Local Development
- **AI Content Generation**: `POST http://localhost:5000/api/generate-content`
- **Post Submission**: `POST http://localhost:5000/api/submit-post`

### Netlify Deployment
- **AI Content Generation**: `POST /.netlify/functions/generate-content`
- **Post Submission**: `POST /.netlify/functions/submit-post`

## 📝 API Request Format

```json
{
  "image": "base64_encoded_image_string"
}
```

## 📤 API Response Format

```json
{
  "success": true,
  "content": {
    "title": "生成的标题",
    "mainText": "生成的正文内容",
    "hashtags": ["#辞海", "#2025上海书展", "#书香中国上海周", "#辞海星空大章", "#云端辞海·知识随行"]
  }
}
```

## 🛡️ Security Features

- ✅ API key is no longer exposed in frontend code
- ✅ Environment variable support for secure key storage
- ✅ Automatic fallback to local backend during development
- ✅ Proper error handling and logging
- ✅ No hardcoded API keys in source code

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Found**:
   - Ensure `DEEPSEEK_API_KEY` environment variable is set
   - Check that the server is restarted after setting the variable

2. **CORS Errors**:
   - Backend has CORS enabled for all origins
   - Netlify functions handle CORS automatically

3. **Image Processing Errors**:
   - Ensure images are properly converted to base64
   - Check image format (JPEG/PNG recommended)

### Debug Mode

Enable debug logging by setting:
```bash
export NODE_ENV=development
```

## 🔄 Migration Notes

- **Old API**: Zhipu API (glm-4v model)
- **New API**: DeepSeek API (deepseek-vision model)
- **Backward Compatibility**: ✅ Maintained
- **Performance**: Expected to be similar or better

## 📚 Additional Resources

- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Express.js Documentation](https://expressjs.com/)

## 🎯 Next Steps

1. Test the integration with your DeepSeek API key
2. Monitor API usage and costs
3. Consider implementing rate limiting if needed
4. Add monitoring and analytics for API calls

---

**Note**: Keep your API key secure and never commit it to version control. Use environment variables for all sensitive configuration.
