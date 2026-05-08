const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Lỗi server' });
};

module.exports = errorHandler;
