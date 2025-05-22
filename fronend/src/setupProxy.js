const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const proxy = createProxyMiddleware({
    target: 'https://student-expense-tracker-om9t.vercel.app',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '' // Remove /api prefix when forwarding to backend
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Proxy error', 
          message: err.message,
          code: err.code
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Proxying request:', req.method, req.path);
      proxyReq.setHeader('x-bypass-auth', 'true');
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('Received response with status:', proxyRes.statusCode);
    }
  });

  app.use('/api', proxy);
  console.log('Proxy configured for https://student-expense-tracker-om9t.vercel.app');
};