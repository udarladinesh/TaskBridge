const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social-helper';
  
  try {
    // Try connecting to specified MONGODB_URI with 3s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected (Primary URI): ${conn.connection.host}`);
  } catch (primaryError) {
    console.log(`Primary MongoDB not reachable (${primaryError.message}). Starting MongoMemoryServer fallback...`);
    try {
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      
      // Auto seed memory server database
      const autoSeed = require('../scripts/seedRunner');
      await autoSeed();
    } catch (fallbackError) {
      console.error(`MongoDB Memory Server Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
