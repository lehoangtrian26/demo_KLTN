const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền thực hiện' });
  }
  next();
};

module.exports = { admin };
