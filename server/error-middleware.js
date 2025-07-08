const ClientError = require('./client-error');

function errorMiddleware(err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'invalid csrf token' });
    return;
  }
  if (err instanceof ClientError) {
    res.status(err.status).json({
      error: err.message
    });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
}

module.exports = errorMiddleware;
