# 🚀 Netlify Deployment Setup

Quick guide to deploy your 辞海UGC application with DeepSeek API integration.

## 🔑 Step 1: Set Environment Variable in Netlify

1. **Go to your Netlify dashboard**
2. **Select your site** (辞海UGC)
3. **Navigate to**: Site settings → Environment variables
4. **Add new variable**:
   - **Key**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-3a23e99afe6a4981b5d66b04d73fb73e`
5. **Click "Save"**

## 🚀 Step 2: Deploy

1. **Push your changes to GitHub** (if using Git)
2. **Or manually deploy** by dragging your project folder to Netlify
3. **Netlify will automatically**:
   - Build your React app
   - Bundle your Netlify functions
   - Deploy everything

## ✅ Step 3: Verify

1. **Check your site URL** (e.g., `https://your-site.netlify.app`)
2. **Test the photo upload feature**
3. **Verify AI content generation works**

## 🔍 Troubleshooting

### Build Fails with "Secrets scanning detected secrets"
- ✅ **Fixed**: Removed hardcoded API keys from source code
- ✅ **Solution**: Use environment variables only

### API Key Not Found Error
- Check Netlify environment variables are set correctly
- Ensure the variable name is exactly `DEEPSEEK_API_KEY`
- Redeploy after setting environment variables

### Functions Not Working
- Check Netlify functions are properly bundled
- Verify the `netlify/functions/` directory structure
- Check function logs in Netlify dashboard

## 📱 Your DeepSeek API Key

**Key**: `sk-3a23e99afe6a4981b5d66b04d73fb73e`

**Model**: `deepseek-vision`

**Endpoint**: `https://api.deepseek.com/v1/chat/completions`

---

**Note**: This API key is now securely stored in Netlify environment variables and not exposed in your source code! 🔒
