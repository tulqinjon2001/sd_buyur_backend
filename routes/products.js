const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - List all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create product
router.post('/', async (req, res) => {
  try {
    const { name, image, currentStock, suppliers } = req.body;
    
    const product = new Product({
      name,
      image: image || '',
      currentStock: currentStock || 0,
      orderQuantity: 0,
      suppliers: suppliers || []
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, image, currentStock, orderQuantity, suppliers } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (name !== undefined) product.name = name;
    if (image !== undefined) product.image = image;
    if (currentStock !== undefined) product.currentStock = currentStock;
    if (orderQuantity !== undefined) product.orderQuantity = orderQuantity;
    if (suppliers !== undefined) product.suppliers = suppliers;
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/products/bulk-update - Bulk update products (for order quantities)
router.patch('/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, currentStock, orderQuantity }
    
    const promises = updates.map(async (update) => {
      const product = await Product.findById(update.id);
      if (product) {
        if (update.currentStock !== undefined) product.currentStock = update.currentStock;
        if (update.orderQuantity !== undefined) product.orderQuantity = update.orderQuantity;
        return product.save();
      }
    });
    
    await Promise.all(promises);
    res.json({ message: 'Products updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

