const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/tema/api',
    createProxyMiddleware({
      target: 'http://localhost:8083',
      changeOrigin: true,
    })
  );
};
