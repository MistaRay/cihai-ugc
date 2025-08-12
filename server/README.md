# 🚀 Backend Server for 辞海UGC

A Node.js/Express backend server for handling user submissions and content management.

## ✨ Features

- **RESTful API** for post submissions
- **CORS enabled** for cross-origin requests
- **Input validation** and error handling
- **Health check endpoint** for monitoring
- **Ready for production** deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Start production server**
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### POST `/api/submit-post`
Submit a new social media post link

**Request Body:**
```json
{
  "postLink": "https://example.com/post",
  "name": "User Name",
  "email": "user@example.com",
  "generatedContent": "AI generated content..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "提交成功！我们会尽快审核您的内容。",
  "submissionId": "507f1f77bcf86cd799439011"
}
```

### GET `/api/submissions`
Get all submissions (admin endpoint)

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "postLink": "https://example.com/post",
      "name": "User Name",
      "email": "user@example.com",
      "generatedContent": "AI generated content...",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

### GET `/api/submissions/:id`
Get a specific submission by ID

### PUT `/api/submissions/:id/status`
Update submission status (admin endpoint)

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid statuses:** `pending`, `approved`, `rejected`

### GET `/api/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Deployment Options

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
   pm2 start server.js --name "your-app-name"
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
   docker build -t your-app-name .
   docker run -p 5000:5000 your-app-name
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
