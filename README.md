# AI Service - Technical Documentation

## Table of Contents
1. [Service Overview](#service-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Deployment Guide](#deployment-guide)
8. [User Manual](#user-manual)
9. [Update Manual](#update-manual)
10. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)

## Service Overview

The AI Service is a microservice responsible for art analysis using OpenAI's GPT-4 Vision model. It processes uploaded images and provides detailed analysis including art style, period, artist information, and descriptions.

### Key Features
- Image upload and processing
- Art analysis using OpenAI GPT-4 Vision
- Image optimization and resizing
- Multiple image format support
- Detailed art analysis reports
- Error handling and retry logic
- Rate limiting and cost management
- Image metadata extraction

### Service Responsibilities
- Image processing and optimization
- AI-powered art analysis
- Integration with OpenAI API
- Image storage and management
- Analysis result formatting
- Cost tracking and optimization
- Error handling and fallbacks

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.1.0)
- **AI Provider**: OpenAI GPT-4 Vision API
- **Image Processing**: Sharp (v0.34.2)
- **File Upload**: Multer (v1.4.5-lts.2)

### Key Dependencies
```json
{
  "express": "^5.1.0",
  "openai": "^4.100.0",
  "sharp": "^0.34.2",
  "multer": "^1.4.5-lts.2",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0",
  "jsonwebtoken": "^9.0.2",
  "axios": "^1.9.0"
}
```

### Development Tools
- **Testing**: Mocha, Chai, Sinon, Supertest
- **Code Coverage**: NYC
- **Development Server**: Nodemon
- **Environment Management**: dotenv

## Architecture

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Service    │    │   OpenAI API    │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (GPT-4 Vision)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Image Storage │
                       │   (Local/Cloud) │
                       └─────────────────┘
```

### Data Flow
1. **Image Upload**: Frontend uploads image → AI Service receives → Image validation → Storage
2. **Image Processing**: Image optimization → Format conversion → Metadata extraction
3. **AI Analysis**: Processed image → OpenAI API → GPT-4 Vision analysis → Result formatting
4. **Response**: Formatted analysis → Frontend display → User interaction

### Image Processing Pipeline
```
Upload → Validation → Optimization → Storage → AI Analysis → Response
   ↓         ↓            ↓           ↓          ↓          ↓
File Check → Size Check → Resize → Save → OpenAI → Format
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Sufficient disk space for image storage
- Network access to OpenAI API

### Installation Steps

1. **Clone and Navigate**
   ```bash
   cd ai_service
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your OpenAI API key and configuration
   ```

4. **Create Storage Directories**
   ```bash
   mkdir -p uploads
   mkdir -p temp
   mkdir -p logs
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Run Tests**
   ```bash
   npm test
   ```

### OpenAI API Setup

1. **Create OpenAI Account**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create account and verify email
   - Add payment method

2. **Generate API Key**
   - Navigate to API Keys section
   - Create new secret key
   - Copy and save securely

3. **Configure API Key**
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `ai_service` directory:

```env
# Server Configuration
PORT=5005
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-vision-preview
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Image Processing Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
IMAGE_QUALITY=85
MAX_IMAGE_WIDTH=2048
MAX_IMAGE_HEIGHT=2048

# Storage Configuration
UPLOAD_DIR=uploads
TEMP_DIR=temp
STORAGE_RETENTION_DAYS=30

# Service URLs
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:5002
DB_SERVICE_URL=http://localhost:5001

# Security
JWT_SECRET=your-jwt-secret-for-service-communication
TRUST_PROXY=1

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Logging
LOG_LEVEL=info
LOG_FILE=logs/ai-service.log

# Monitoring
PROMETHEUS_PORT=9090
METRICS_ENDPOINT=/metrics

# Cost Management
MAX_COST_PER_REQUEST=0.10
COST_TRACKING_ENABLED=true
```

### Critical Configuration Notes

#### OpenAI API Configuration
- **OPENAI_API_KEY**: Required for AI analysis functionality
- **OPENAI_MODEL**: Use `gpt-4-vision-preview` for image analysis
- **OPENAI_MAX_TOKENS**: Control response length and cost
- **OPENAI_TEMPERATURE**: Control response creativity (0.0-1.0)

#### Image Processing Configuration
- **MAX_FILE_SIZE**: Maximum upload size (10MB recommended)
- **ALLOWED_IMAGE_TYPES**: Supported image formats
- **IMAGE_QUALITY**: JPEG compression quality (1-100)
- **MAX_IMAGE_WIDTH/HEIGHT**: Maximum dimensions for processing

#### Storage Configuration
- **UPLOAD_DIR**: Directory for storing processed images
- **TEMP_DIR**: Temporary file storage
- **STORAGE_RETENTION_DAYS**: Automatic cleanup period

## API Reference

### Image Analysis Endpoints

#### POST /api/analyze
Analyze an uploaded image using AI.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `image`: Image file (required)
  - `analysisType`: Type of analysis (optional, default: "general")

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "description": "This is a beautiful oil painting depicting...",
      "style": "Impressionism",
      "period": "Late 19th Century",
      "artist": "Claude Monet",
      "confidence": 0.95,
      "technique": "Oil on canvas",
      "composition": "Landscape with water lilies",
      "colors": "Soft blues, greens, and pinks"
    },
    "metadata": {
      "filename": "artwork.jpg",
      "originalSize": 2048576,
      "processedSize": 512000,
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "format": "jpeg",
      "uploadTime": "2024-01-01T12:00:00.000Z"
    },
    "cost": {
      "tokens": 150,
      "estimatedCost": 0.003
    }
  }
}
```

#### POST /api/analyze/url
Analyze an image from URL.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/artwork.jpg",
  "analysisType": "detailed"
}
```

**Response:** Same as POST /api/analyze

#### GET /api/analyze/history
Get analysis history for a user.

**Headers:** Authorization: Bearer <token>

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "analysis_id",
      "imageUrl": "https://example.com/artwork.jpg",
      "analysis": {
        "description": "Art description",
        "style": "Impressionism",
        "period": "19th Century"
      },
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### DELETE /api/analyze/:id
Delete an analysis record.

**Headers:** Authorization: Bearer <token>

**Response:**
```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

### Health Check Endpoints

#### GET /health
Service health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "ai-service",
  "version": "1.0.0",
  "openai": "connected"
}
```

#### GET /api/health/detailed
Detailed health check including OpenAI connectivity.

**Response:**
```json
{
  "status": "healthy",
  "openai": {
    "status": "connected",
    "model": "gpt-4-vision-preview",
    "rateLimit": {
      "remaining": 100,
      "reset": "2024-01-01T01:00:00.000Z"
    }
  },
  "storage": {
    "uploadDir": "accessible",
    "tempDir": "accessible",
    "freeSpace": "2.5GB"
  },
  "memory": {
    "used": "45.2MB",
    "free": "1.2GB"
  },
  "uptime": "2h 15m 30s"
}
```

## Deployment Guide

### Production Deployment

#### 1. Environment Preparation
```bash
# Set production environment
NODE_ENV=production

# Update OpenAI configuration for production
OPENAI_API_KEY=your-production-openai-api-key
OPENAI_MODEL=gpt-4-vision-preview
```

#### 2. Security Configuration
```env
# Production security settings
JWT_SECRET=your-production-jwt-secret-32-chars-minimum
CORS_ORIGIN=https://yourdomain.com
TRUST_PROXY=1

# Production storage settings
UPLOAD_DIR=/app/uploads
TEMP_DIR=/app/temp
STORAGE_RETENTION_DAYS=7

# Production rate limiting
RATE_LIMIT_MAX_REQUESTS=100
```

#### 3. Deployment Options

**Option A: Docker Deployment**
```dockerfile
FROM node:18-alpine

# Install system dependencies for Sharp
RUN apk add --no-cache vips-dev build-base python3

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create storage directories
RUN mkdir -p uploads temp logs

# Set permissions
RUN chown -R node:node /app
USER node

EXPOSE 5005

CMD ["npm", "start"]
```

**Option B: Direct Deployment**
```bash
# Install dependencies
npm ci --only=production

# Create storage directories
mkdir -p uploads temp logs

# Start service
npm start
```

**Option C: PM2 Deployment**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name "ai-service"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Reverse Proxy Configuration (Nginx)
```nginx
server {
    listen 80;
    server_name ai.yourdomain.com;
    
    # Increase max upload size
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for image processing
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### Storage Management

#### Automated Cleanup
```bash
# Create cleanup script
#!/bin/bash
RETENTION_DAYS=7
UPLOAD_DIR="/app/uploads"
TEMP_DIR="/app/temp"

# Clean old uploads
find $UPLOAD_DIR -type f -mtime +$RETENTION_DAYS -delete

# Clean temp files
find $TEMP_DIR -type f -mtime +1 -delete

# Clean empty directories
find $UPLOAD_DIR -type d -empty -delete
find $TEMP_DIR -type d -empty -delete

echo "Cleanup completed at $(date)"
```

#### Storage Monitoring
```bash
# Monitor storage usage
du -sh /app/uploads
du -sh /app/temp

# Check file count
find /app/uploads -type f | wc -l
find /app/temp -type f | wc -l
```

## User Manual

### For Developers

#### Starting the Service
```bash
# Development mode
npm run dev

# Production mode
npm start
```

#### Testing the Service
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:performance
```

#### API Testing
```bash
# Test image analysis
curl -X POST http://localhost:5005/api/analyze \
  -H "Authorization: Bearer your-token" \
  -F "image=@test-image.jpg"

# Test health endpoint
curl http://localhost:5005/health

# Test detailed health
curl http://localhost:5005/api/health/detailed
```

#### Image Processing Testing
```bash
# Test with different image formats
curl -X POST http://localhost:5005/api/analyze \
  -F "image=@test.png"
curl -X POST http://localhost:5005/api/analyze \
  -F "image=@test.webp"
curl -X POST http://localhost:5005/api/analyze \
  -F "image=@test.gif"
```

### For System Administrators

#### Service Management
```bash
# Check service status
pm2 status

# Restart service
pm2 restart ai-service

# View logs
pm2 logs ai-service

# Monitor resources
pm2 monit
```

#### Storage Management
```bash
# Check storage usage
du -sh uploads/
du -sh temp/

# Clean old files
find uploads/ -type f -mtime +7 -delete
find temp/ -type f -mtime +1 -delete

# Monitor disk space
df -h
```

#### OpenAI API Monitoring
```bash
# Check API usage
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage

# Check rate limits
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

## Update Manual

### Version Update Process

#### 1. Pre-Update Checklist
- [ ] Backup current configuration
- [ ] Review changelog and breaking changes
- [ ] Test in staging environment
- [ ] Check OpenAI API quota and limits
- [ ] Notify stakeholders of maintenance window

#### 2. Update Steps
```bash
# 1. Stop service
pm2 stop ai-service

# 2. Backup current version
cp -r /app/ai-service /app/ai-service-backup-$(date +%Y%m%d)

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm ci --only=production

# 5. Run migrations (if any)
npm run migrate

# 6. Start service
pm2 start ai-service

# 7. Verify health
curl http://localhost:5005/health
```

#### 3. Rollback Procedure
```bash
# If update fails, rollback
pm2 stop ai-service
rm -rf /app/ai-service
mv /app/ai-service-backup-$(date +%Y%m%d) /app/ai-service
pm2 start ai-service
```

#### 4. Post-Update Verification
- [ ] Health check passes
- [ ] OpenAI API connectivity verified
- [ ] Image processing functional
- [ ] Storage directories accessible
- [ ] Logs show no errors

### Configuration Updates

#### Environment Variable Changes
```bash
# Edit environment file
nano .env

# Reload environment
pm2 reload ai-service

# Verify changes
curl http://localhost:5005/health
```

#### OpenAI Configuration Updates
1. Update OpenAI API key if needed
2. Adjust model parameters (temperature, max tokens)
3. Update rate limiting settings
4. Restart service: `pm2 restart ai-service`
5. Test with sample image

## Monitoring & Troubleshooting

### Health Monitoring

#### Key Metrics to Monitor
- **Response Time**: < 30s for image analysis
- **Error Rate**: < 2% for all endpoints
- **Uptime**: > 99.9%
- **Memory Usage**: < 80% of allocated memory
- **Storage Usage**: < 80% of disk space
- **OpenAI API Quota**: Monitor usage and limits

#### Monitoring Commands
```bash
# Check service health
curl http://localhost:5005/health

# Check detailed health
curl http://localhost:5005/api/health/detailed

# Monitor memory usage
pm2 monit

# Check storage usage
du -sh uploads/ temp/
```

### Common Issues & Solutions

#### 1. OpenAI API Errors
**Symptoms**: 401, 429, or 500 errors from OpenAI
**Causes**: Invalid API key, rate limiting, quota exceeded
**Solutions**:
```bash
# Check API key
echo $OPENAI_API_KEY

# Test API connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check usage and limits
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

#### 2. Image Processing Errors
**Symptoms**: Sharp errors, memory issues
**Causes**: Large images, unsupported formats, insufficient memory
**Solutions**:
```bash
# Check image size limits
grep MAX_FILE_SIZE .env

# Check supported formats
grep ALLOWED_IMAGE_TYPES .env

# Monitor memory usage
pm2 monit
```

#### 3. Storage Issues
**Symptoms**: Upload failures, disk space errors
**Causes**: Full disk, permission issues, directory not found
**Solutions**:
```bash
# Check disk space
df -h

# Check directory permissions
ls -la uploads/
ls -la temp/

# Clean old files
find uploads/ -type f -mtime +7 -delete
```

#### 4. Performance Issues
**Symptoms**: Slow response times, timeouts
**Causes**: Large images, network issues, OpenAI API delays
**Solutions**:
```bash
# Check image optimization settings
grep IMAGE_QUALITY .env
grep MAX_IMAGE_WIDTH .env

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5005/health
```

### Log Analysis

#### Log Locations
```bash
# PM2 logs
pm2 logs ai-service

# Application logs (if configured)
tail -f logs/ai-service.log

# Error logs
tail -f logs/error.log
```

#### Key Log Patterns
```bash
# OpenAI API errors
grep "openai.*error" logs/ai-service.log

# Image processing errors
grep "sharp.*error" logs/ai-service.log

# Upload errors
grep "upload.*error" logs/ai-service.log

# Performance issues
grep "slow.*response" logs/ai-service.log
```

## Security Considerations

### Security Best Practices

#### 1. File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Use secure file storage
- Implement proper file permissions

#### 2. API Security
- Validate all input data
- Implement rate limiting
- Use HTTPS in production
- Proper error handling (no sensitive data exposure)

#### 3. OpenAI API Security
- Secure API key storage
- Monitor API usage and costs
- Implement usage limits
- Regular key rotation

#### 4. Storage Security
- Secure file storage location
- Implement access controls
- Regular security audits
- Encrypt sensitive data

### Security Headers
```javascript
// Implemented security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Vulnerability Scanning
```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Testing

### Test Structure
```
src/test/
├── basic.test.js          # Unit tests
├── working.test.js        # Integration tests
├── simple-test.js         # Test runner
└── utils/
    └── testHelpers.js     # Test utilities
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:performance

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Categories

#### Unit Tests
- Image processing functions
- OpenAI API integration
- File validation
- Error handling

#### Integration Tests
- API endpoint testing
- Image upload and analysis
- Error scenarios
- Performance testing

#### Performance Tests
- Image processing performance
- API response times
- Memory usage testing
- Concurrent request handling

### Test Coverage
- **Target Coverage**: > 80%
- **Critical Paths**: 100% coverage
- **Image Processing**: 100% coverage
- **Error Handling**: 100% coverage

---

## Support & Maintenance

### Contact Information
- **Developer**: DarylNyd
- **Repository**: [AI Service Repository]
- **Documentation**: This file

### Maintenance Schedule
- **Security Updates**: Monthly
- **Dependency Updates**: Quarterly
- **Performance Reviews**: Monthly
- **Storage Cleanup**: Weekly
- **OpenAI API Monitoring**: Daily

### Emergency Procedures
1. **Service Down**: Check health endpoint and logs
2. **OpenAI API Issues**: Verify API key and quota
3. **Storage Issues**: Check disk space and permissions
4. **Performance Issues**: Monitor response times and memory usage

---

*Last Updated: January 2024*
*Version: 1.0.0*
