require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy configuration for rate limiting behind load balancers/proxies
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            process.env.CLIENT_URL,
            // Add both Vercel domains
            'https://nydartadvisor-p3gw0m3og-darylnyds-projects.vercel.app',
            'https://nydartadvisor.vercel.app',
            'https://nydartadvisor-git-main-darylnyds-projects.vercel.app',
            // Add any other Vercel preview domains
            /^https:\/\/nydartadvisor.*\.vercel\.app$/,
        ];
        
        // Check if origin matches any allowed origins
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return origin === allowedOrigin;
            } else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            // For development, allow all origins
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("AI Service is running");
});

// Serve static files from temp/uploads
app.use('/uploads', express.static(path.join(__dirname, '../temp/uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'AI Service',
    config: {
      port: PORT,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    }
  });
});

// Routes
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
