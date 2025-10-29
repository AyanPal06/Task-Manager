const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  // Default error
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
