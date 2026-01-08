const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Support both MONGO_URI and MONGODB_URI for compatibility
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

// Sample products with suppliers
const sampleProducts = [
  {
    name: 'Coca-Cola 1.5L',
    image: '',
    currentStock: 14,
    orderQuantity: 0,
    suppliers: [
      { name: 'Coca-Cola Bottlers', pricePerUnit: 12000, phone: '+998901234567' },
      { name: 'International Beverages', pricePerUnit: 12500, phone: '+998901234568' },
    ],
  },
  {
    name: 'Fanta 1.5L',
    image: '',
    currentStock: 8,
    orderQuantity: 0,
    suppliers: [
      { name: 'Coca-Cola Bottlers', pricePerUnit: 12000, phone: '+998901234567' },
      { name: 'International Beverages', pricePerUnit: 12500, phone: '+998901234568' },
    ],
  },
  {
    name: 'Pepsi 0.5L',
    image: '',
    currentStock: 3,
    orderQuantity: 0,
    suppliers: [
      { name: 'International Beverages', pricePerUnit: 8000, phone: '+998901234568' },
      { name: 'PepsiCo', pricePerUnit: 8500, phone: '+998901234569' },
    ],
  },
  {
    name: 'Snickers Super',
    image: '',
    currentStock: 45,
    orderQuantity: 0,
    suppliers: [
      { name: 'Mars Central Asia', pricePerUnit: 15000, phone: '+998901234570' },
      { name: 'Sweet Distributors', pricePerUnit: 15500, phone: '+998901234571' },
    ],
  },
  {
    name: 'Orbit',
    image: '',
    currentStock: 120,
    orderQuantity: 0,
    suppliers: [
      { name: 'Mars Central Asia', pricePerUnit: 5000, phone: '+998901234570' },
    ],
  },
  {
    name: 'Non',
    image: '',
    currentStock: 20,
    orderQuantity: 0,
    suppliers: [
      { name: 'Family Group', pricePerUnit: 3000, phone: '+998901234572' },
      { name: 'O\'zbek Non', pricePerUnit: 3200, phone: '+998901234573' },
    ],
  },
  {
    name: 'Sut 1L',
    image: '',
    currentStock: 15,
    orderQuantity: 0,
    suppliers: [
      { name: 'Nestle Uzbekistan', pricePerUnit: 18000, phone: '+998901234574' },
      { name: 'Lactalis Central Asia', pricePerUnit: 18500, phone: '+998901234575' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${sampleProducts.length} sample products`);

    console.log('\n🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();

