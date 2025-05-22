/**
 * Centralized configuration management
 */

const requiredEnvVars = [
  'JWT_SECRET'
];

// Validate required environment variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const config = {
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },
  
  // CORS configuration
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'https://student-expense-tracker-nu.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ];
      
      // Allow any subdomain of vercel.app for preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('CORS blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Date',
      'X-Api-Version'
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600 // Cache preflight request for 10 minutes
  },
  
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development'
  },
  
  // Environment flags
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  
  // Get full configuration
  get fullConfig() {
    return {
      jwt: this.jwt,
      cors: this.cors,
      server: this.server,
      isProduction: this.isProduction,
      isDevelopment: this.isDevelopment
    };
  }
};

// Log configuration in development
if (config.isDevelopment) {
  console.log('Configuration loaded:', config.fullConfig);
}

export default config;
