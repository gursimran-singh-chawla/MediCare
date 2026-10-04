function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
}

module.exports = { notFound, errorHandler };
