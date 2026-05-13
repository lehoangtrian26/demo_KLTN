const { User, OTP } = require('../models/index');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { generateOTP, sendOTPEmail } = require('../utils/otp.utils');
const { success, error } = require('../utils/response.utils');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists && exists.isVerified) {
      return error(res, 'Email đã được sử dụng', 400);
    }

    let user = exists || new User({ name, email, password, phone });
    if (!exists) await user.save();

    // Tạo OTP verify email
    await OTP.deleteMany({ contact: email, type: 'verify_email' });
    const code = generateOTP();
    await OTP.create({
      userId: user._id,
      contact: email,
      code,
      type: 'verify_email',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    });

    await sendOTPEmail(email, code, 'verify_email');

    const devData = process.env.NODE_ENV === 'development' ? { otp: code } : {};
    return success(res, devData, 'Đăng ký thành công, kiểm tra email để xác thực OTP', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, code, type } = req.body;

    const otp = await OTP.findOne({ contact: email, type, isUsed: false });
    if (!otp) return error(res, 'OTP không tồn tại hoặc đã được sử dụng', 400);
    if (otp.expiresAt < new Date()) return error(res, 'OTP đã hết hạn', 400);
    if (otp.attempts >= 5) return error(res, 'Quá nhiều lần nhập sai, yêu cầu OTP mới', 429);
    if (otp.code !== code) {
      await OTP.findByIdAndUpdate(otp._id, { $inc: { attempts: 1 } });
      return error(res, `OTP không đúng (còn ${4 - otp.attempts} lần)`, 400);
    }

    await OTP.findByIdAndUpdate(otp._id, { isUsed: true });

    if (type === 'verify_email') {
      const user = await User.findByIdAndUpdate(otp.userId, { isVerified: true }, { new: true });
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      return success(res, { data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken } }, 'Xác thực thành công');
    }

    return success(res, {}, 'OTP hợp lệ');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-otp
const resendOTP = async (req, res, next) => {
  try {
    const { email, type } = req.body;

    const user = await User.findOne({ email });
    if (!user) return error(res, 'Email không tồn tại', 404);

    const recentOtp = await OTP.findOne({
      contact: email, type,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }, // 1 phút
    });
    if (recentOtp) return error(res, 'Vui lòng chờ 1 phút trước khi gửi lại', 429);

    await OTP.deleteMany({ contact: email, type });
    const code = generateOTP();
    await OTP.create({ userId: user._id, contact: email, code, type, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    await sendOTPEmail(email, code, type);

    const devData = process.env.NODE_ENV === 'development' ? { otp: code } : {};
    return success(res, devData, 'OTP đã được gửi lại');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return error(res, 'Email hoặc mật khẩu không đúng', 401);
    }
    if (!user.isActive) return error(res, 'Tài khoản đã bị khóa', 403);
    if (!user.isVerified) return error(res, 'Tài khoản chưa xác thực email', 403);

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return success(res, {
      data: {
        user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, memberTier: user.memberTier, loyaltyPoints: user.loyaltyPoints },
        accessToken,
        refreshToken,
      }
    }, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh-token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return error(res, 'Refresh token là bắt buộc', 400);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return error(res, 'Token không hợp lệ', 401);

    const accessToken = generateAccessToken(user._id);
    return success(res, { data: { accessToken } }, 'Token đã được làm mới');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Luôn trả về success để tránh lộ email tồn tại
    if (!user) return success(res, {}, 'Nếu email tồn tại, OTP sẽ được gửi');

    await OTP.deleteMany({ contact: email, type: 'reset_password' });
    const code = generateOTP();
    await OTP.create({ userId: user._id, contact: email, code, type: 'reset_password', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    await sendOTPEmail(email, code, 'reset_password');

    const devData = process.env.NODE_ENV === 'development' ? { otp: code } : {};
    return success(res, devData, 'Nếu email tồn tại, OTP sẽ được gửi');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const otp = await OTP.findOne({ contact: email, type: 'reset_password', isUsed: false });
    if (!otp || otp.expiresAt < new Date() || otp.code !== code) {
      return error(res, 'OTP không hợp lệ hoặc đã hết hạn', 400);
    }

    await OTP.findByIdAndUpdate(otp._id, { isUsed: true });
    const user = await User.findById(otp.userId);
    user.password = newPassword;
    await user.save();

    return success(res, {}, 'Đặt lại mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  success(res, { data: req.user });
};

module.exports = { register, verifyOTP, resendOTP, login, refreshToken, forgotPassword, resetPassword, getMe };
