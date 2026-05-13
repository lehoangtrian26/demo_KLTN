const { User } = require('../models/index');
const { success, error } = require('../utils/response.utils');
const fs = require('fs');
const path = require('path');

// GET /api/profile
const getProfile = async (req, res) => {
  success(res, { data: req.user });
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, birthday } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, birthday },
      { new: true, runValidators: true }
    ).select('-password');
    success(res, { data: user }, 'Cập nhật thông tin thành công');
  } catch (err) { next(err); }
};

// PUT /api/profile/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return error(res, 'Vui lòng nhập đầy đủ thông tin', 400);
    if (newPassword.length < 6) return error(res, 'Mật khẩu mới tối thiểu 6 ký tự', 400);

    const user = await User.findById(req.user._id);
    const ok = await user.matchPassword(currentPassword);
    if (!ok) return error(res, 'Mật khẩu hiện tại không đúng', 400);

    user.password = newPassword;
    await user.save();
    success(res, {}, 'Đổi mật khẩu thành công');
  } catch (err) { next(err); }
};

// POST /api/profile/addresses
const addAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, address, city, district, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    user.addresses.push({ label, fullName, phone, address, city, district, isDefault: !!isDefault });
    await user.save();
    success(res, { data: user.addresses }, 'Thêm địa chỉ thành công', 201);
  } catch (err) { next(err); }
};

// PUT /api/profile/addresses/:id
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return error(res, 'Không tìm thấy địa chỉ', 404);

    if (req.body.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    success(res, { data: user.addresses }, 'Cập nhật địa chỉ thành công');
  } catch (err) { next(err); }
};

// DELETE /api/profile/addresses/:id
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
    await user.save();
    success(res, { data: user.addresses }, 'Đã xóa địa chỉ');
  } catch (err) { next(err); }
};

// PUT /api/profile/avatar
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'Không có file ảnh', 400);

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Xóa file ảnh cũ nếu có (trừ avatar mặc định)
    const currentUser = await User.findById(req.user._id);
    if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '../../', currentUser.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    success(res, { data: user }, 'Cập nhật ảnh đại diện thành công');
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress, updateAvatar };
