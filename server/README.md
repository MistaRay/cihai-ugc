# 辞海UGC Backend Server 🚀

Backend API server for the 辞海UGC application that handles form submissions and content management.

## Features ✨

- **Form Submission API** - Receives post links and user information
- **Content Storage** - Stores generated AI content and user submissions
- **Admin Endpoints** - Manage and review submissions
- **Health Monitoring** - API health check endpoints
- **CORS Support** - Cross-origin resource sharing enabled
- **Production Ready** - Serves React frontend in production

## Quick Start 🚀

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Start Production Server
```bash
npm start
```

## API Endpoints 📡

### POST `/api/submit-post`
Submit a new post link and user information.

**Request Body:**
```json
{
  "postLink": "https://www.xiaohongshu.com/...",
  "name": "User Name",
  "email": "user@example.com",
  "generatedContent": {
    "title": "Generated Title",
    "mainText": "Generated content...",
    "hashtags": ["#tag1", "#tag2"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "提交成功！我们会尽快审核您的内容。",
  "submissionId": "1234567890"
}
```

### GET `/api/submissions`
Get all submissions (admin endpoint).

### GET `/api/submissions/:id`
Get a specific submission by ID.

### PUT `/api/submissions/:id/status`
Update submission status (admin endpoint).

### GET `/api/health`
Health check endpoint.

## Deployment Options 🌍

### Option 1: Alibaba Cloud (Recommended for China 🇨🇳)

1. **Create ECS Instance**
   - Choose Ubuntu 20.04 or CentOS 8
   - Minimum: 2GB RAM, 1 CPU
   - Select China regions for best performance

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Deploy Application**
   ```bash
   git clone your-repo
   cd your-repo/server
   npm install
   npm start
   ```

4. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "cihai-ugc"
   pm2 startup
   pm2 save
   ```

### Option 2: Tencent Cloud

Similar to Alibaba Cloud, but with Tencent's infrastructure.

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t cihai-ugc .
   docker run -p 5000:5000 cihai-ugc
   ```

## Environment Variables 🔧

Create a `.env` file in the server directory:

```bash
PORT=5000
NODE_ENV=production
# Add other environment variables as needed
```

## Database Integration 🗄️

Currently using in-memory storage. For production, integrate with:

- **MySQL** (Alibaba Cloud RDS)
- **MongoDB** (Alibaba Cloud MongoDB)
- **PostgreSQL** (Alibaba Cloud RDS)

## Security Considerations 🔒

1. **Rate Limiting** - Implement API rate limiting
2. **Input Validation** - Validate all user inputs
3. **HTTPS** - Use SSL certificates in production
4. **Authentication** - Add JWT authentication for admin endpoints
5. **CORS** - Configure allowed origins properly

## Monitoring 📊

1. **Logs** - Use PM2 or similar for log management
2. **Health Checks** - Monitor `/api/health` endpoint
3. **Performance** - Monitor response times and error rates

## Production Checklist ✅

- [ ] Set NODE_ENV=production
- [ ] Configure database connection
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS origins
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and DNS

## Support 🆘

For issues or questions, check the main project README or create an issue in the repository.
