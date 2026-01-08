const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/suppliers", require("./routes/suppliers"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Debug endpoint - Show suppliers only
app.get("/api/debug/suppliers", async (req, res) => {
  try {
    const Product = require("./models/Product");
    const Order = require("./models/Order");
    const Supplier = require("./models/Supplier");

    const products = await Product.find();
    const orders = await Order.find();
    const suppliers = await Supplier.find();

    // Get suppliers from collection
    const suppliersFromCollection = suppliers.map((s) => ({
      id: s._id,
      name: s.name,
      phone: s.phone || "",
      email: s.email || "",
      totalDebt: s.totalDebt || 0,
      totalPaid: s.totalPaid || 0,
      source: "collection",
    }));

    // Get unique suppliers from products
    const supplierMap = {};
    products.forEach((product) => {
      if (product.suppliers && product.suppliers.length > 0) {
        product.suppliers.forEach((s) => {
          if (!supplierMap[s.name]) {
            supplierMap[s.name] = {
              name: s.name,
              phone: s.phone || "",
              email: "",
              products: [],
              source: "products",
            };
          }
          supplierMap[s.name].products.push({
            productName: product.name,
            pricePerUnit: s.pricePerUnit,
          });
        });
      }
    });

    const suppliersFromProducts = Object.values(supplierMap);

    // Calculate debt from orders
    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const debtMap = {};
    deliveredOrders.forEach((order) => {
      if (!debtMap[order.supplier]) {
        debtMap[order.supplier] = {
          supplier: order.supplier,
          totalDebt: 0,
          unpaidOrders: 0,
          orders: [],
        };
      }
      debtMap[order.supplier].totalDebt += order.totalAmount;
      debtMap[order.supplier].unpaidOrders += 1;
      debtMap[order.supplier].orders.push({
        orderId: order._id,
        amount: order.totalAmount,
        createdAt: order.createdAt,
      });
    });

    res.json({
      suppliers: {
        fromCollection: {
          count: suppliersFromCollection.length,
          list: suppliersFromCollection,
        },
        fromProducts: {
          count: suppliersFromProducts.length,
          list: suppliersFromProducts,
        },
        debtInfo: {
          count: Object.keys(debtMap).length,
          details: Object.values(debtMap),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint - Show what data is coming from database
app.get("/api/debug", async (req, res) => {
  try {
    const Product = require("./models/Product");
    const Order = require("./models/Order");
    const Supplier = require("./models/Supplier");

    const products = await Product.find();
    const orders = await Order.find();
    const suppliers = await Supplier.find();

    // Count suppliers from products
    const suppliersFromProducts = new Set();
    products.forEach((product) => {
      if (product.suppliers && product.suppliers.length > 0) {
        product.suppliers.forEach((s) => suppliersFromProducts.add(s.name));
      }
    });

    res.json({
      database: {
        products: {
          count: products.length,
          all: products.map((p) => ({
            id: p._id,
            name: p.name,
            currentStock: p.currentStock,
            orderQuantity: p.orderQuantity,
            suppliersCount: p.suppliers?.length || 0,
            suppliers:
              p.suppliers?.map((s) => ({
                name: s.name,
                pricePerUnit: s.pricePerUnit,
                phone: s.phone || "",
              })) || [],
          })),
        },
        orders: {
          count: orders.length,
          byStatus: {
            pending: orders.filter((o) => o.status === "pending").length,
            sent: orders.filter((o) => o.status === "sent").length,
            delivered: orders.filter((o) => o.status === "delivered").length,
            cancelled: orders.filter((o) => o.status === "cancelled").length,
          },
          details: orders.map((o) => ({
            id: o._id,
            supplier: o.supplier,
            totalAmount: o.totalAmount,
            status: o.status,
            productsCount: o.products?.length || 0,
            products:
              o.products?.map((p) => ({
                productName: p.productName,
                quantity: p.quantity,
                price: p.price,
              })) || [],
            createdAt: o.createdAt,
          })),
        },
        suppliers: {
          fromCollection: {
            count: suppliers.length,
            all: suppliers.map((s) => ({
              id: s._id,
              name: s.name,
              phone: s.phone || "",
              email: s.email || "",
              totalDebt: s.totalDebt || 0,
              totalPaid: s.totalPaid || 0,
              createdAt: s.createdAt,
            })),
          },
          fromProducts: {
            count: suppliersFromProducts.size,
            names: Array.from(suppliersFromProducts),
            // Get detailed info from products
            details: Array.from(suppliersFromProducts).map((supplierName) => {
              const supplierInfo = {
                name: supplierName,
                phone: "",
                products: [],
              };
              // Find all products that have this supplier
              products.forEach((product) => {
                if (product.suppliers && product.suppliers.length > 0) {
                  const supplier = product.suppliers.find(
                    (s) => s.name === supplierName
                  );
                  if (supplier) {
                    if (!supplierInfo.phone && supplier.phone) {
                      supplierInfo.phone = supplier.phone;
                    }
                    supplierInfo.products.push({
                      productName: product.name,
                      pricePerUnit: supplier.pricePerUnit,
                    });
                  }
                }
              });
              return supplierInfo;
            }),
          },
          // Calculate debt from orders
          debtInfo: (() => {
            const debtMap = {};
            const deliveredOrders = orders.filter(
              (o) => o.status === "delivered"
            );
            deliveredOrders.forEach((order) => {
              if (!debtMap[order.supplier]) {
                debtMap[order.supplier] = {
                  supplier: order.supplier,
                  totalDebt: 0,
                  unpaidOrders: 0,
                  orders: [],
                };
              }
              debtMap[order.supplier].totalDebt += order.totalAmount;
              debtMap[order.supplier].unpaidOrders += 1;
              debtMap[order.supplier].orders.push({
                orderId: order._id,
                amount: order.totalAmount,
                createdAt: order.createdAt,
              });
            });
            return Object.values(debtMap);
          })(),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB
// Support both MONGO_URI and MONGODB_URI for compatibility
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI; // || 'mongodb://localhost:27017/inventory_db'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

module.exports = app;
