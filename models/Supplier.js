const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  // Total debt amount (unpaid orders)
  totalDebt: {
    type: Number,
    default: 0,
    min: 0
  },
  // Total paid amount
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);

