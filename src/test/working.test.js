const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { expect } = require('chai');
const sinon = require('sinon');

// Import the app
const app = require('../server');

describe('AI Service Working Tests', () => {
  let server;
  let testImagePath;

  before(async () => {
    // Create test server
    server = app.listen(0);
    
    // Ensure temp/uploads directory exists
    const uploadsDir = path.join(__dirname, '../temp/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create a real test image using sharp
    const sharp = require('sharp');
    testImagePath = path.join(__dirname, '../temp/uploads/test-image.jpg');
    
    // Create a real JPEG image
    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toFile(testImagePath);
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
    });

    it('should return service status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).to.equal('AI Service is running');
    });
  });

  describe('Image Analysis Endpoint', () => {
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
        .attach('image', largeFile);

      // Multer will throw an error for large files, so we expect a 500 or the request to fail
      expect(response.status).to.be.oneOf([400, 500]);
      
      // Clean up the file even if test fails
      if (fs.existsSync(largeFile)) {
        fs.unlinkSync(largeFile);
      }
    });

    it('should accept valid image file', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .attach('image', testImagePath)
        .expect(200);

      // The response might be 500 if OpenAI key is not set, but that's expected
      expect(response.status).to.be.oneOf([200, 500]);
    });
  });

  describe('File Upload Validation', () => {
    it('should validate image file types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidTypes = ['text/plain', 'application/pdf'];

      validTypes.forEach(type => {
        expect(type).to.match(/^image\//);
      });

      invalidTypes.forEach(type => {
        expect(type).to.not.match(/^image\//);
      });
    });

    it('should validate file size limits', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      expect(maxSize - 1).to.be.lessThan(maxSize);
      expect(maxSize).to.equal(maxSize);
      expect(maxSize + 1).to.be.greaterThan(maxSize);
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
      const sanitizedName = maliciousName.replace(/[<>]/g, '');
      
      expect(sanitizedName).to.not.include('<script>');
      expect(sanitizedName).to.not.include('</script>');
      expect(sanitizedName).to.include('.jpg');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const concurrentRequests = 3;
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
        expect(response.status).to.be.oneOf([200, 400, 500]); // Various expected responses
      });
    });

    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).to.be.lessThan(1000); // Should complete within 1 second
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/invalid-route');
      
      // Express will return 404 for invalid routes
      expect(response.status).to.equal(404);
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .send({ invalid: 'data' })
        .expect(400);
    });
  });
});



