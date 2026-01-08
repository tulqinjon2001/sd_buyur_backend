const mongoose = require('mongoose');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

// Suppliers (Dillerlar)
const suppliers = [
  { name: 'Coca Cola', phone: '', email: '' },
  { name: 'Pepsi', phone: '', email: '' },
  { name: 'Al-manzil', phone: '', email: '' },
  { name: 'O\'zbek Non', phone: '', email: '' },
  { name: 'Sanjar Patir', phone: '', email: '' },
  { name: 'Hot-lunch', phone: '', email: '' },
  { name: 'Craffers', phone: '', email: '' },
];

// Products with their suppliers
// Format: { name, suppliers: [{ name, pricePerUnit, phone }] }
const products = [
  // Coca Cola products
  {
    name: 'Coca cola 0.5l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Coca Cola', pricePerUnit: 5000, phone: '' },
      { name: 'Al-manzil', pricePerUnit: 5200, phone: '' },
    ],
  },
  {
    name: 'Coca cola 1l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Coca Cola', pricePerUnit: 8000, phone: '' },
    ],
  },
  {
    name: 'Mirinda 1.5l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Coca Cola', pricePerUnit: 12000, phone: '' },
    ],
  },
  {
    name: 'Mirinda 0.5l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Coca Cola', pricePerUnit: 5000, phone: '' },
      { name: 'Al-manzil', pricePerUnit: 5200, phone: '' },
    ],
  },
  {
    name: 'Mountain Dev 1l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Coca Cola', pricePerUnit: 8000, phone: '' },
    ],
  },
  
  // Pepsi products
  {
    name: 'Pepsi 1l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Pepsi', pricePerUnit: 8000, phone: '' },
    ],
  },
  {
    name: 'Pepsi 2l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Pepsi', pricePerUnit: 15000, phone: '' },
      { name: 'Al-manzil', pricePerUnit: 15200, phone: '' },
    ],
  },
  {
    name: 'Mirinda 1l',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Pepsi', pricePerUnit: 8000, phone: '' },
    ],
  },
  
  // Al-manzil products
  {
    name: 'Qo\'qon xolva',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Al-manzil', pricePerUnit: 10000, phone: '' },
      { name: 'Sanjar Patir', pricePerUnit: 10500, phone: '' },
    ],
  },
  {
    name: 'Do\'lta non',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Al-manzil', pricePerUnit: 3000, phone: '' },
      { name: 'Sanjar Patir', pricePerUnit: 3200, phone: '' },
    ],
  },
  {
    name: 'Hotlunch 90gr shirin',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Al-manzil', pricePerUnit: 8000, phone: '' },
      { name: 'Hot-lunch', pricePerUnit: 8500, phone: '' },
    ],
  },
  {
    name: 'Hotlunch 90gr achchiq',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Al-manzil', pricePerUnit: 8000, phone: '' },
      { name: 'Hot-lunch', pricePerUnit: 8500, phone: '' },
    ],
  },
  
  // O'zbek Non products
  {
    name: 'Patir non',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'O\'zbek Non', pricePerUnit: 3000, phone: '' },
      { name: 'Sanjar Patir', pricePerUnit: 3200, phone: '' },
    ],
  },
  {
    name: 'Yopgan non',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'O\'zbek Non', pricePerUnit: 3500, phone: '' },
    ],
  },
  
  // Hot-lunch products
  {
    name: 'Hotlunch 120gr idish shirin',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Hot-lunch', pricePerUnit: 10000, phone: '' },
    ],
  },
  {
    name: 'Hotlunch 120gr idish achchiq',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Hot-lunch', pricePerUnit: 10000, phone: '' },
    ],
  },
  {
    name: 'Bigbon 85gr shirin',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Hot-lunch', pricePerUnit: 7500, phone: '' },
    ],
  },
  {
    name: 'Bigbon 85gr achchiq',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Hot-lunch', pricePerUnit: 7500, phone: '' },
    ],
  },
  
  // Craffers products
  {
    name: 'Sugar Cookies',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Craffers', pricePerUnit: 12000, phone: '' },
    ],
  },
  {
    name: 'Dropped Biscuits',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Craffers', pricePerUnit: 13000, phone: '' },
    ],
  },
  {
    name: 'Crafers Cookies',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Craffers', pricePerUnit: 12500, phone: '' },
    ],
  },
  {
    name: 'Choco Break Quadro',
    currentStock: 0,
    orderQuantity: 0,
    suppliers: [
      { name: 'Craffers', pricePerUnit: 15000, phone: '' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    await Supplier.deleteMany({});
    console.log('🗑️  Cleared existing suppliers\n');

    // Insert suppliers
    const insertedSuppliers = await Supplier.insertMany(suppliers);
    console.log(`✅ Inserted ${insertedSuppliers.length} suppliers\n`);

    // Insert products
    await Product.insertMany(products);
    console.log(`✅ Inserted ${products.length} products\n`);

    // Summary
    console.log('📊 Summary:');
    console.log(`   - Suppliers: ${insertedSuppliers.length}`);
    console.log(`   - Products: ${products.length}`);
    
    // Count products per supplier
    const supplierProductCount = {};
    products.forEach(product => {
      product.suppliers.forEach(supplier => {
        if (!supplierProductCount[supplier.name]) {
          supplierProductCount[supplier.name] = 0;
        }
        supplierProductCount[supplier.name]++;
      });
    });
    
    console.log('\n📦 Products per supplier:');
    Object.entries(supplierProductCount).forEach(([supplier, count]) => {
      console.log(`   - ${supplier}: ${count} products`);
    });

    console.log('\n🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();

