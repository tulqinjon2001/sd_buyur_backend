const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/orders - List orders with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, supplier } = req.query;
    
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (supplier) {
      filter.supplier = supplier;
    }
    
    const orders = await Order.find(filter)
      .populate('products.productId', 'name image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId', 'name image');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Create orders (grouped by supplier)
// Request body: { items: [{ productId, quantity, supplierName }] }
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }
    
    // Group items by supplier
    const supplierGroups = {};
    
    for (const item of items) {
      const { productId, quantity, supplierName } = item;
      
      // Validate product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${productId} not found` });
      }
      
      // Find supplier in product's suppliers list
      const supplier = product.suppliers.find(s => s.name === supplierName);
      if (!supplier) {
        return res.status(400).json({ 
          error: `Supplier "${supplierName}" not found for product "${product.name}"` 
        });
      }
      
      // Group by supplier
      if (!supplierGroups[supplierName]) {
        supplierGroups[supplierName] = [];
      }
      
      supplierGroups[supplierName].push({
        productId,
        productName: product.name,
        quantity,
        price: supplier.pricePerUnit
      });
    }
    
    // Create one order per supplier
    const createdOrders = [];
    
    for (const [supplierName, products] of Object.entries(supplierGroups)) {
      // Calculate total amount
      const totalAmount = products.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
      }, 0);
      
      // Create order
      const order = new Order({
        supplier: supplierName,
        products,
        totalAmount,
        status: 'pending'
      });
      
      await order.save();
      createdOrders.push(order);
      
      // Update product stock: reduce currentStock by orderQuantity
      // and reset orderQuantity to 0
      for (const productItem of products) {
        const product = await Product.findById(productItem.productId);
        if (product) {
          product.currentStock -= product.orderQuantity;
          product.orderQuantity = 0;
          await product.save();
        }
      }
    }
    
    res.status(201).json(createdOrders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'sent', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const oldStatus = order.status;
    order.status = status;
    await order.save();
    
    // If order is delivered, add stock back to products
    if (status === 'delivered' && oldStatus !== 'delivered') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.currentStock += item.quantity;
          await product.save();
        }
      }
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

