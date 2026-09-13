const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const seedRunner = require('./seedRunner');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social-helper';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB...');
    await seedRunner();
    console.log('Seed command completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seed Command Error:', error.message);
    process.exit(1);
  }
};

seedData();
