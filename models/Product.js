const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: '' // URL or base64
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  orderQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  // Suppliers are embedded in the product
  // This allows each product to have multiple suppliers with different prices
  suppliers: [{
    name: {
      type: String,
      required: true
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    phone: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

