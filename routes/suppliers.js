const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/suppliers - Get all suppliers with debt information
router.get('/', async (req, res) => {
  try {
    // Get all unique suppliers from products
    const products = await Product.find();
    const supplierMap = {};
    
    products.forEach(product => {
      if (product.suppliers && product.suppliers.length > 0) {
        product.suppliers.forEach(supplier => {
          if (!supplierMap[supplier.name]) {
            supplierMap[supplier.name] = {
              name: supplier.name,
              phone: supplier.phone || '',
              totalDebt: 0,
              unpaidOrders: 0,
            };
          }
        });
      }
    });

    // Calculate debt for each supplier
    // Debt = sum of totalAmount for delivered orders
    const orders = await Order.find({ 
      status: 'delivered'
    });

    orders.forEach(order => {
      if (supplierMap[order.supplier]) {
        supplierMap[order.supplier].totalDebt += order.totalAmount;
        supplierMap[order.supplier].unpaidOrders += 1;
      }
    });

    // Convert to array
    const suppliers = Object.values(supplierMap);
    
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

