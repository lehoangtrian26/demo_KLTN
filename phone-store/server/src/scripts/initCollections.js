require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const models = require('../models/index');

async function initCollections() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected:', mongoose.connection.host);

  const results = [];

  for (const [name, Model] of Object.entries(models)) {
    try {
      await Model.createCollection();
      results.push(`✅ ${name}`);
    } catch (err) {
      results.push(`⚠️  ${name}: ${err.message}`);
    }
  }

  console.log('\n--- Collections khởi tạo ---');
  results.forEach((r) => console.log(r));
  console.log(`\nTổng: ${results.length} collections`);

  await mongoose.disconnect();
  process.exit(0);
}

initCollections().catch((err) => {
  console.error(err);
  process.exit(1);
});
