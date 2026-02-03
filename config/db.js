const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  }
};
