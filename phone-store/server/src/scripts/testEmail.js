require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { verifyEmailConfig, sendOTPEmail, generateOTP } = require('../utils/otp.utils');

async function test() {
  console.log('\n🔍 Kiểm tra cấu hình email...');

  const config = await verifyEmailConfig();

  if (!config.configured) {
    console.log('❌ Chưa cấu hình — điền GMAIL_USER và GMAIL_APP_PASSWORD vào .env');
    process.exit(1);
  }

  if (!config.ok) {
    console.log('❌ Kết nối thất bại:', config.error);
    console.log('\n💡 Kiểm tra lại:');
    console.log('   1. GMAIL_USER đúng chưa?');
    console.log('   2. GMAIL_APP_PASSWORD đúng chưa? (16 ký tự, có dấu cách)');
    console.log('   3. 2-Step Verification đã bật chưa?');
    process.exit(1);
  }

  console.log('✅ Kết nối Gmail thành công!\n');

  // Gửi email test
  const testEmail = process.argv[2] || process.env.GMAIL_USER;
  const code = generateOTP();
  console.log(`📧 Đang gửi OTP test tới: ${testEmail}`);
  console.log(`   OTP: ${code}`);

  const result = await sendOTPEmail(testEmail, code, 'verify_email');

  if (result.error) {
    console.log('❌ Gửi thất bại:', result.error);
  } else {
    console.log('✅ Gửi thành công! Kiểm tra hộp thư của', testEmail);
  }

  process.exit(0);
}

test().catch((e) => { console.error(e); process.exit(1); });
