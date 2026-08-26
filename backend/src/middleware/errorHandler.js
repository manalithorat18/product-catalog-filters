/* eslint-disable no-unused-vars */

function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NotFound',
    message: `No route matches ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Single place where every thrown/next(err) error lands. Keeps API error
 * shape consistent and makes sure we never leak stack traces to clients.
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const body = {
    error: err.name || 'InternalServerError',
    message: status === 500 ? 'Something went wrong. Please try again.' : err.message,
  };
  if (err.details) body.details = err.details;

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(status).json(body);
}

module.exports = { notFoundHandler, errorHandler };
