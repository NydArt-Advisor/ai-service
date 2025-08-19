const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { expect } = require('chai');
const sinon = require('sinon');

// Import the app and services
const app = require('../server');
const aiController = require('../controllers/ai.controller');
const aiService = require('../services/ai.service');
const openaiService = require('../services/openaiService');

describe('AI Service Test Suite', () => {
  let server;
  let testImagePath;
  let mockOpenAIResponse;

  before(async () => {
    // Create test server
    server = app.listen(0); // Use random port for testing
    
    // Ensure temp/uploads directory exists
    const uploadsDir = path.join(__dirname, '../temp/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create test image file
    testImagePath = path.join(__dirname, '../temp/uploads/test-image.jpg');
    const testImageBuffer = Buffer.from('fake-image-data');
    fs.writeFileSync(testImagePath, testImageBuffer);
    
    // Mock OpenAI response
    mockOpenAIResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            analysis: {
              title: "Test Artwork",
              artist: "Test Artist",
              period: "Modern",
              style: "Abstract",
              technique: "Oil on canvas",
              description: "A beautiful test artwork",
              interpretation: "This artwork represents...",
              culturalContext: "Created during...",
              artisticValue: "High artistic value...",
              marketValue: "Estimated value...",
              condition: "Good condition",
              authenticity: "Authentic",
              rarity: "Rare",
              provenance: "Well-documented provenance"
            },
            suggestions: [
              "Consider professional restoration",
              "Display in controlled environment",
              "Regular conservation check-ups"
            ],
            learningResources: [
              {
                title: "Art History Book",
                type: "book",
                description: "Comprehensive guide to art history",
                url: "https://example.com/book"
              },
              {
                title: "Museum Exhibition",
                type: "exhibition",
                description: "Current exhibition on similar works",
                url: "https://example.com/exhibition"
              }
            ]
          })
        }
      }]
    };
  });

  after(async () => {
    // Cleanup
    if (server) server.close();
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'OK');
      expect(response.body).to.have.property('service', 'AI Service');
      expect(response.body).to.have.property('config');
      expect(response.body.config).to.have.property('port');
      expect(response.body.config).to.have.property('hasOpenAIKey');
    });

    it('should return service status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).to.equal('AI Service is running');
    });
  });

  describe('Image Analysis Endpoint', () => {
    let openaiStub;

    beforeEach(() => {
      // Stub OpenAI service
      openaiStub = sinon.stub(openaiService, 'analyzeImage').resolves(mockOpenAIResponse);
    });

    afterEach(() => {
      openaiStub.restore();
    });

    it('should analyze image successfully', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', testImagePath)
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('analysis');
      expect(response.body.analysis).to.have.property('title', 'Test Artwork');
      expect(response.body).to.have.property('suggestions');
      expect(response.body).to.have.property('learningResources');
      
      expect(openaiStub.calledOnce).to.be.true;
    });

    it('should handle missing image file', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('No image file provided');
    });

    it('should handle invalid file type', async () => {
      const invalidFile = path.join(__dirname, 'test.txt');
      fs.writeFileSync(invalidFile, 'test content');

      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', invalidFile)
        .expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('Invalid file type');

      fs.unlinkSync(invalidFile);
    });

    it('should handle large file size', async () => {
      // Create a large test file (over 10MB)
      const largeFile = path.join(__dirname, 'large-test.jpg');
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      fs.writeFileSync(largeFile, largeBuffer);

      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', largeFile)
        .expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('File size too large');

      fs.unlinkSync(largeFile);
    });

    it('should handle OpenAI API errors', async () => {
      openaiStub.rejects(new Error('OpenAI API Error'));

      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', testImagePath)
        .expect(500);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('Failed to analyze image');
    });

    it('should handle malformed OpenAI response', async () => {
      openaiStub.resolves({
        choices: [{
          message: {
            content: 'invalid json'
          }
        }]
      });

      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', testImagePath)
        .expect(500);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('Invalid response format');
    });
  });

  describe('Image Processing', () => {
    it('should compress image successfully', async () => {
      const originalSize = fs.statSync(testImagePath).size;
      
      const compressedBuffer = await aiService.compressImage(testImagePath);
      
      expect(compressedBuffer).to.be.instanceOf(Buffer);
      expect(compressedBuffer.length).to.be.lessThan(originalSize);
    });

    it('should handle image processing errors', async () => {
      const nonExistentPath = '/path/to/nonexistent/image.jpg';
      
      try {
        await aiService.compressImage(nonExistentPath);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('ENOENT');
      }
    });
  });

  describe('File Upload Handling', () => {
    it('should validate image file types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidTypes = ['text/plain', 'application/pdf'];

      validTypes.forEach(type => {
        expect(aiService.isValidImageType(type)).to.be.true;
      });

      invalidTypes.forEach(type => {
        expect(aiService.isValidImageType(type)).to.be.false;
      });
    });

    it('should validate file size limits', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      expect(aiService.isValidFileSize(maxSize - 1)).to.be.true;
      expect(aiService.isValidFileSize(maxSize)).to.be.true;
      expect(aiService.isValidFileSize(maxSize + 1)).to.be.false;
    });
  });

  describe('Error Handling', () => {
    it('should handle database save errors gracefully', async () => {
      // Mock database service to throw error
      const dbStub = sinon.stub(aiService, 'saveAnalysisToDatabase').rejects(new Error('DB Error'));
      
      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', testImagePath)
        .expect(200); // Should still succeed even if DB save fails

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('analysis');
      
      dbStub.restore();
    });

    it('should handle memory errors', async () => {
      // Mock sharp to throw memory error
      const sharpStub = sinon.stub(require('sharp'), 'default').throws(new Error('Out of memory'));

      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', testImagePath)
        .expect(500);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('Image processing failed');
      
      sharpStub.restore();
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const concurrentRequests = 5;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .post('/api/ai/analyze')
            .attach('image', testImagePath)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).to.be.oneOf([200, 500]); // Some might fail due to rate limits
      });
    });

    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/ai/analyze')
        .attach('image', testImagePath)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).to.be.lessThan(30000); // Should complete within 30 seconds
    });
  });

  describe('Security Tests', () => {
    it('should prevent path traversal attacks', async () => {
      const maliciousPath = '../../../etc/passwd';
      
      const response = await request(app)
        .post('/api/ai/analyze')
        .field('imagePath', maliciousPath)
        .expect(400);

      expect(response.body).to.have.property('error');
    });

    it('should sanitize file names', () => {
      const maliciousName = '<script>alert("xss")</script>.jpg';
      const sanitizedName = aiService.sanitizeFileName(maliciousName);
      
      expect(sanitizedName).to.not.include('<script>');
      expect(sanitizedName).to.not.include('</script>');
    });
  });
});



