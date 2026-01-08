// Script to add suppliers from Supplier collection to products
// This will match suppliers by name and add them to products
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

// Sample mapping: which suppliers should be added to which products
// You can customize this based on your business logic
const supplierProductMapping = {
  'Coca-Cola Bottlers': ['Coca-Cola 1.5L', 'Fanta 1.5L'],
  'International Beverages': ['Coca-Cola 1.5L', 'Fanta 1.5L', 'Pepsi 1.5L', 'Pepsi 0.5L'],
  'PepsiCo': ['Pepsi 1.5L', 'Pepsi 0.5L'],
  'Mars Central Asia': ['Snickers Super', 'Orbit'],
  'Sweet Distributors': ['Snickers Super'],
  'Family Group': ['Non'],
  'O\'zbek Non': ['Non'],
  'Nestle Uzbekistan': ['Sut 1L'],
  'Lactalis Central Asia': ['Sut 1L'],
};

// Default prices per unit (you can adjust these)
const defaultPrices = {
  'Coca-Cola 1.5L': 12000,
  'Fanta 1.5L': 12000,
  'Pepsi 1.5L': 12000,
  'Pepsi 0.5L': 8000,
  'Snickers Super': 15000,
  'Orbit': 5000,
  'Non': 3000,
  'Sut 1L': 18000,
  'Suv 0.5L': 3000,
};

async function addSuppliersToProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all suppliers
    const suppliers = await Supplier.find();
    console.log(`📦 Found ${suppliers.length} suppliers in collection\n`);

    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products\n`);

    let updatedCount = 0;

    for (const product of products) {
      // Check if product already has suppliers
      if (product.suppliers && product.suppliers.length > 0) {
        console.log(`⏭️  ${product.name} already has ${product.suppliers.length} suppliers, skipping...`);
        continue;
      }

      // Find suppliers for this product
      const productSuppliers = [];
      
      // Method 1: Use mapping if available
      for (const [supplierName, productNames] of Object.entries(supplierProductMapping)) {
        if (productNames.includes(product.name)) {
          const supplier = suppliers.find(s => s.name === supplierName);
          if (supplier) {
            productSuppliers.push({
              name: supplier.name,
              pricePerUnit: defaultPrices[product.name] || 10000,
              phone: supplier.phone || '',
            });
          }
        }
      }

      // Method 2: If no mapping found, add all suppliers (you can customize this)
      if (productSuppliers.length === 0) {
        console.log(`⚠️  No mapping found for "${product.name}", adding all suppliers...`);
        suppliers.forEach(supplier => {
          productSuppliers.push({
            name: supplier.name,
            pricePerUnit: defaultPrices[product.name] || 10000,
            phone: supplier.phone || '',
          });
        });
      }

      if (productSuppliers.length > 0) {
        product.suppliers = productSuppliers;
        await product.save();
        console.log(`✅ Added ${productSuppliers.length} suppliers to "${product.name}"`);
        updatedCount++;
      } else {
        console.log(`⚠️  No suppliers to add for "${product.name}"`);
      }
    }

    console.log(`\n🎉 Completed! Updated ${updatedCount} products with suppliers.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSuppliersToProducts();

