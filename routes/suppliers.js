const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// GET /api/suppliers - Get all suppliers with debt information
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/suppliers - Request received');
    const supplierMap = {};
    
    // First, try to get suppliers from the separate Supplier collection
    const suppliersFromCollection = await Supplier.find();
    console.log(`📦 Suppliers from collection: ${suppliersFromCollection.length}`);
    
    if (suppliersFromCollection && suppliersFromCollection.length > 0) {
      // Use suppliers from the separate collection
      suppliersFromCollection.forEach(supplier => {
        supplierMap[supplier.name] = {
          name: supplier.name,
          phone: supplier.phone || '',
          email: supplier.email || '',
          totalDebt: supplier.totalDebt || 0,
          unpaidOrders: 0, // Will be calculated from orders
        };
      });
    }
    
    // Also get unique suppliers from products (in case some are only in products)
    const products = await Product.find();
    console.log(`📦 Products found: ${products.length}`);
    let suppliersFromProducts = 0;
    products.forEach(product => {
      if (product.suppliers && product.suppliers.length > 0) {
        product.suppliers.forEach(supplier => {
          suppliersFromProducts++;
          if (!supplierMap[supplier.name]) {
            // Only add if not already in map (from Supplier collection)
            supplierMap[supplier.name] = {
              name: supplier.name,
              phone: supplier.phone || '',
              email: '',
              totalDebt: 0,
              unpaidOrders: 0,
            };
          } else {
            // Update phone if missing in Supplier collection but exists in product
            if (!supplierMap[supplier.name].phone && supplier.phone) {
              supplierMap[supplier.name].phone = supplier.phone;
            }
          }
        });
      }
    });
    console.log(`📦 Suppliers from products: ${suppliersFromProducts}`);

    // Calculate debt for each supplier from orders
    // Debt = sum of totalAmount for delivered but unpaid orders
    const orders = await Order.find({ 
      status: 'delivered',
      isPaid: { $ne: true }
    });
    console.log(`📋 Unpaid delivered orders: ${orders.length}`);

    orders.forEach(order => {
      if (supplierMap[order.supplier]) {
        supplierMap[order.supplier].totalDebt += order.totalAmount;
        supplierMap[order.supplier].unpaidOrders += 1;
      }
    });

    // Convert to array
    const suppliers = Object.values(supplierMap);
    console.log(`✅ Returning ${suppliers.length} suppliers`);
    
    res.json(suppliers);
  } catch (error) {
    console.error('❌ Error in /api/suppliers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:name/products - Get products for a specific supplier
router.get('/:name/products', async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`📥 GET /api/suppliers/${name}/products - Request received`);
    
    const products = await Product.find({
      'suppliers.name': name
    });
    
    // Filter and format products with supplier info
    const supplierProducts = [];
    products.forEach(product => {
      if (product.suppliers && product.suppliers.length > 0) {
        const supplier = product.suppliers.find(s => s.name === name);
        if (supplier) {
          supplierProducts.push({
            productId: product._id,
            productName: product.name,
            image: product.image || '',
            currentStock: product.currentStock || 0,
            pricePerUnit: supplier.pricePerUnit,
            phone: supplier.phone || '',
          });
        }
      }
    });
    
    console.log(`✅ Returning ${supplierProducts.length} products for supplier: ${name}`);
    res.json(supplierProducts);
  } catch (error) {
    console.error('❌ Error in /api/suppliers/:name/products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:name/orders - Get orders for a supplier
router.get('/:name/orders', async (req, res) => {
  try {
    const { name } = req.params;
    const { paid, all } = req.query; // Optional: ?paid=true, ?all=true
    console.log(`📥 GET /api/suppliers/${name}/orders - paid=${paid}, all=${all}`);
    
    const query = {
      supplier: name,
      status: 'delivered'
    };
    
    if (all === 'true') {
      // Return all delivered orders (both paid and unpaid)
      // No additional filter
    } else if (paid === 'true') {
      query.isPaid = true;
    } else {
      query.isPaid = { $ne: true };
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    console.log(`✅ Returning ${orders.length} orders for supplier: ${name}`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error in /api/suppliers/:name/orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:name/summary - Get supplier summary (debt, paid, etc.)
router.get('/:name/summary', async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`📥 GET /api/suppliers/${name}/summary`);
    
    const allOrders = await Order.find({
      supplier: name,
      status: 'delivered'
    });
    
    const unpaidOrders = allOrders.filter(o => !o.isPaid);
    const paidOrders = allOrders.filter(o => o.isPaid);
    
    const totalDebt = unpaidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPaid = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalReceived = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    res.json({
      supplier: name,
      totalReceived: totalReceived,
      totalPaid: totalPaid,
      totalDebt: totalDebt,
      unpaidOrdersCount: unpaidOrders.length,
      paidOrdersCount: paidOrders.length,
      allOrdersCount: allOrders.length,
    });
  } catch (error) {
    console.error('❌ Error in /api/suppliers/:name/summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/suppliers/orders/:id/pay - Mark order as paid
router.put('/orders/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body; // 'cash' or 'card'
    
    console.log(`📥 PUT /api/suppliers/orders/${id}/pay - Payment method: ${paymentMethod}`);
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.isPaid) {
      return res.status(400).json({ error: 'Order already paid' });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Only delivered orders can be paid' });
    }
    
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = paymentMethod || 'cash';
    
    await order.save();
    
    console.log(`✅ Order ${id} marked as paid`);
    res.json(order);
  } catch (error) {
    console.error('❌ Error in /api/suppliers/orders/:id/pay:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

