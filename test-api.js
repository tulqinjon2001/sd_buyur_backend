// Test script to check what data is coming from database
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Order = require('./models/Order');
const Supplier = require('./models/Supplier');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

async function testDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find();
    console.log(`📦 Products: ${products.length} ta`);
    if (products.length > 0) {
      console.log('   Birinchi 3 ta mahsulot:');
      products.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      - Mavjud: ${p.currentStock}`);
        console.log(`      - Buyurtma: ${p.orderQuantity}`);
        console.log(`      - Ta\'minotchilar: ${p.suppliers?.length || 0} ta`);
        if (p.suppliers && p.suppliers.length > 0) {
          p.suppliers.forEach(s => {
            console.log(`        • ${s.name} - ${s.pricePerUnit} UZS`);
          });
        }
      });
    }

    // Get all suppliers from collection
    const suppliersFromCollection = await Supplier.find();
    console.log(`\n👥 Suppliers (Collection): ${suppliersFromCollection.length} ta`);
    if (suppliersFromCollection.length > 0) {
      suppliersFromCollection.forEach(s => {
        console.log(`   - ${s.name} (${s.phone || 'tel yo\'q'})`);
      });
    }

    // Get unique suppliers from products
    const suppliersFromProducts = new Set();
    products.forEach(product => {
      if (product.suppliers && product.suppliers.length > 0) {
        product.suppliers.forEach(s => suppliersFromProducts.add(s.name));
      }
    });
    console.log(`\n👥 Suppliers (Products ichida): ${suppliersFromProducts.size} ta`);
    if (suppliersFromProducts.size > 0) {
      Array.from(suppliersFromProducts).forEach(name => {
        console.log(`   - ${name}`);
      });
    }

    // Get all orders
    const orders = await Order.find();
    console.log(`\n📋 Orders: ${orders.length} ta`);
    if (orders.length > 0) {
      const byStatus = {
        pending: orders.filter(o => o.status === 'pending').length,
        sent: orders.filter(o => o.status === 'sent').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      };
      console.log(`   - Pending: ${byStatus.pending}`);
      console.log(`   - Sent: ${byStatus.sent}`);
      console.log(`   - Delivered: ${byStatus.delivered}`);
      console.log(`   - Cancelled: ${byStatus.cancelled}`);
      
      // Show suppliers from orders
      const suppliersFromOrders = new Set(orders.map(o => o.supplier));
      console.log(`\n👥 Suppliers (Orders ichida): ${suppliersFromOrders.size} ta`);
      Array.from(suppliersFromOrders).forEach(name => {
        const supplierOrders = orders.filter(o => o.supplier === name && o.status === 'delivered');
        const totalDebt = supplierOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        console.log(`   - ${name}: ${supplierOrders.length} ta delivered zakaz, ${totalDebt.toLocaleString()} UZS qarz`);
      });
    }

    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDatabase();

