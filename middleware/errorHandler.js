module.exports = (err, req, res, next) => {
  console.error(err);
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }
  if (err.code === 11000) {
    status = 400;
    message = 'Email already registered';
  }
  res.status(status).json({ success: false, message });
};
