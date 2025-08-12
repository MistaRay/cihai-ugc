# 📚 AI Book Agent - 辞海UGC

A React-based AI agent application that generates social media content from book photos. Users can upload book images and receive AI-generated content in the format specified for 小红书 (Xiaohongshu) platform.

## ✨ Features

- **Image Upload**: Drag & drop or click to upload book photos
- **AI Content Generation**: Automatically generates social media content with:
  - Engaging titles (under 30 characters)
  - Main text (200-300 characters in 小红书 style)
  - Relevant hashtags including required ones
- **Two-Step Process**: 
  1. Upload photo and generate content
  2. Submit social media post link
- **Permanent Dark Theme**: Modern, sleek dark UI design
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Frontend Only (Development)
1. **Clone or download the project**
   ```bash
   cd ai-book-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Full Stack (Frontend + Backend)
1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd server && npm install
   ```

3. **Start backend server**
   ```bash
   cd server && npm run dev
   ```

4. **Start frontend** (in another terminal)
   ```bash
   npm start
   ```

5. **Backend API** will be available at `http://localhost:5000`

### Using Docker
1. **Run the full stack**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── PhotoUpload.js      # Main upload and AI generation component
│   └── PostSubmission.js   # Post link submission form
├── App.js                  # Main app component with routing
├── App.css                 # Main styles with dark theme
├── index.js                # App entry point
└── index.css               # Global styles

public/
└── index.html              # HTML template
```

## 🔧 Configuration

### AI Content Generation
The current implementation includes a simulated AI response. To integrate with a real AI service:

1. **Replace the simulation in `PhotoUpload.js`**:
   ```javascript
   // Replace this section in generateContent function
   const response = await fetch('/api/generate-content', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ image: selectedFile })
   });
   const content = await response.json();
   ```

2. **Add your AI API endpoint** to handle image processing and content generation

### Required Hashtags
The application automatically includes these required hashtags:
- #辞海
- #2025上海书展  
- #"书香中国"上海周
- #辞海星空大章
- #云端辞海·知识随行

## 📱 Usage Flow

1. **Upload Photo**: User uploads a book photo via drag & drop or file selection
2. **Generate Content**: AI generates social media content with title, text, and hashtags
3. **Review Content**: User reviews the generated content
4. **Submit Link**: User navigates to submission page and provides:
   - Social media post link
   - Name
   - Email address
5. **Confirmation**: Success message and automatic redirect

## 🚀 Deployment

### China Deployment Options 🇨🇳

#### Option 1: Alibaba Cloud (Recommended)
- **ECS Instance**: Ubuntu 20.04, 2GB RAM, 1 CPU minimum
- **RDS**: MySQL/PostgreSQL for database
- **OSS**: For file storage
- **CDN**: For global content delivery
- **SSL Certificate**: Free SSL from Alibaba Cloud

#### Option 2: Tencent Cloud
- Similar to Alibaba Cloud with Tencent's infrastructure
- Good for WeChat ecosystem integration

#### Option 3: Huawei Cloud
- Government-friendly compliance
- Good for enterprise deployments

### Backend Features
- **Express.js API Server** with RESTful endpoints
- **Form Submission Handling** for post links and user info
- **Content Storage** for AI-generated content
- **Admin Endpoints** for content management
- **Health Monitoring** and logging
- **Production Ready** with PM2 process management

### Deployment Steps
1. **Build the React app**: `npm run build`
2. **Deploy backend**: Follow `server/README.md` instructions
3. **Configure domain and SSL**
4. **Set up monitoring and backups**

## 🎨 Customization

### Styling
- **Theme**: The app uses a permanent dark theme as requested
- **Colors**: Primary colors are `#4ecdc4` (teal) and `#ff6b6b` (coral)
- **CSS Variables**: Easily customizable in `App.css`

### Content Format
The AI generates content in this exact format:
```
**标题：**
[吸引人的标题，不超过30字]

**正文：**
[200-300字正文内容，小红书风格，积极正面，包含实用建议或感悟]

**标签：**
[3-5个相关标签，用#分隔]
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload the `build` folder contents
- **Traditional hosting**: Upload files to your web server

## 🔒 Security Considerations

- **File Validation**: Only image files are accepted
- **Input Sanitization**: Form inputs are validated and sanitized
- **API Security**: In production, implement proper authentication and rate limiting

## 📋 Dependencies

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **React Dropzone**: Drag & drop file uploads
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client (ready for API integration)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for 辞海UGC and follows the specified requirements.

## 🆘 Support

For issues or questions:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure Node.js version compatibility
4. Check file permissions and paths

---

**Built with ❤️ for 辞海UGC Community**

