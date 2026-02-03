const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'CUSTOMER'],
    default: 'CUSTOMER'
  }
});

module.exports = mongoose.model('User', userSchema);
