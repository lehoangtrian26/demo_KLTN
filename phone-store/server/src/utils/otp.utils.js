const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { otpEmail } = require('./emailTemplates');

// ── Tạo OTP ──────────────────────────────────────────────────────────────────
const generateOTP = (length = 6) =>
  crypto.randomInt(10 ** (length - 1), 10 ** length).toString();

// ── Gmail transporter (lazy init) ────────────────────────────────────────────
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || user === 'your_gmail@gmail.com') {
    return null; // chưa cấu hình
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return _transporter;
};

// ── Gửi OTP qua Email ─────────────────────────────────────────────────────────
const sendOTPEmail = async (email, code, type) => {
  const transporter = getTransporter();

  if (!transporter) {
    // Fallback: log ra console khi chưa cấu hình Gmail
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📧 [OTP EMAIL - DEV MODE]`);
    console.log(`   To   : ${email}`);
    console.log(`   Type : ${type}`);
    console.log(`   Code : \x1b[32m\x1b[1m${code}\x1b[0m`);
    console.log(`${'─'.repeat(50)}\n`);
    return { dev: true };
  }

  const { subject, html } = otpEmail(code, type);

  try {
    const info = await transporter.sendMail({
      from: `"PhoneStore" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${email} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email send failed to ${email}:`, err.message);
    // Không throw — fallback log OTP ra console để app không crash
    console.log(`   Fallback OTP for ${email}: \x1b[32m\x1b[1m${code}\x1b[0m`);
    return { error: err.message };
  }
};

// ── Gửi OTP qua SMS (Twilio) ─────────────────────────────────────────────────
const sendOTPSMS = async (phone, code, type) => {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from || sid.startsWith('AC' + 'xxx')) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📱 [OTP SMS - DEV MODE]`);
    console.log(`   To   : ${phone}`);
    console.log(`   Code : \x1b[32m\x1b[1m${code}\x1b[0m`);
    console.log(`${'─'.repeat(50)}\n`);
    return { dev: true };
  }

  try {
    const twilio = require('twilio')(sid, token);
    const msg = await twilio.messages.create({
      body: `[PhoneStore] Mã xác thực của bạn là: ${code}. Hiệu lực 5 phút. Không chia sẻ mã này.`,
      from,
      to: phone,
    });
    console.log(`📱 SMS sent to ${phone} — sid: ${msg.sid}`);
    return msg;
  } catch (err) {
    console.error(`❌ SMS send failed to ${phone}:`, err.message);
    console.log(`   Fallback OTP for ${phone}: \x1b[32m\x1b[1m${code}\x1b[0m`);
    return { error: err.message };
  }
};

// ── Verify transporter (test connection) ─────────────────────────────────────
const verifyEmailConfig = async () => {
  const transporter = getTransporter();
  if (!transporter) return { configured: false };
  try {
    await transporter.verify();
    return { configured: true, ok: true };
  } catch (err) {
    return { configured: true, ok: false, error: err.message };
  }
};

module.exports = { generateOTP, sendOTPEmail, sendOTPSMS, verifyEmailConfig };
