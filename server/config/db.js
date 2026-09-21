const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/muit_event_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 6000,
    });
    isConnected = true;
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In standalone local dev, allow retry without crashing entire runner
  }
};

module.exports = connectDB;
