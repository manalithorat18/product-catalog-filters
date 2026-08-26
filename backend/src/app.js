const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productsRouter = require('./routes/products');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  const configuredOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin: (requestOrigin, callback) => {
      const isLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production'
        && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin || '');

      if (!requestOrigin || configuredOrigins.includes('*') || configuredOrigins.includes(requestOrigin) || isLocalDevelopmentOrigin) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  }));
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  app.use('/api/products', productsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
