const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/smartz-findery"
  )
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedAdmin(); 
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Models
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    image: String,
    category: String,
    hasVat: Boolean,
    description: String,
  },
  { timestamps: true }
);

// Updated Order Schema to match frontend expectations
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow guest orders
    },
    customerDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    subtotal: { type: Number, required: true },
    vatTotal: { type: Number, required: true },
    total: Number,
    paymentMethod: { type: String, default: "stripe" },
    status: { type: String, default: "pending" },
    paymentIntentId: String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

//Seed admin(Owner of the shop)
async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: "admin.test@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    const adminUser = new User({
      name: "Admin User",
      email: "admin.test@gmail.com",
      password: "admin123",
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin.test@gmail.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}


// Middleware for role checking
const requireAdmin = (req, res, next) => {
  // Simple role check - in production use JWT tokens
  const { userRole } = req.headers;
  if (userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const requireAuth = (req, res, next) => {
  const { userId } = req.headers;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Routes

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ success: true, user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email, role: user.role },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Product Routes
app.get("/api/products", async (req, res) => {
  try {
    const { search, category, sort, minPrice, maxPrice } = req.query;

    // Build query object
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "all") {
      if (category === "other") {
        query.category = { $in: ["electronics", "beauty", "toy"] };
      } else if (category.startsWith("all-")) {
        const groupKey = category.substring(4);
        query.category = { $regex: `^${groupKey}`, $options: "i" };
      } else {
        query.category = category;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    let sortObj = {};
    if (sort) {
      switch (sort) {
        case "price-low":
          sortObj.price = 1;
          break;
        case "price-high":
          sortObj.price = -1;
          break;
        case "name-asc":
          sortObj.name = 1;
          break;
        case "name-desc":
          sortObj.name = -1;
          break;
        case "newest":
          sortObj.createdAt = -1;
          break;
        default:
          sortObj.createdAt = -1;
      }
    } else {
      sortObj.createdAt = -1; // Default sort by newest
    }

    const products = await Product.find(query).sort(sortObj);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin only routes
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price range
app.get("/api/price-range", async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const priceRange = result[0] || { minPrice: 0, maxPrice: 10000 };
    res.json(priceRange);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    console.log("=== CREATE PAYMENT INTENT DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Stripe secret key exists:", !!process.env.STRIPE_SECRET_KEY);
    console.log(
      "Stripe secret key preview:",
      process.env.STRIPE_SECRET_KEY
        ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + "..."
        : "NOT SET"
    );

    const { amount, currency = "usd", orderId } = req.body;

    console.log("Parsed values:");
    console.log("- amount:", amount, typeof amount);
    console.log("- currency:", currency);
    console.log("- orderId:", orderId);

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return res.status(500).json({
        success: false,
        error: "Server configuration error: Stripe not configured",
      });
    }

    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        error: "Invalid amount provided",
        details: `Amount was: ${amount} (${typeof amount})`,
      });
    }

    const amountInCents = Math.round(amount * 100);
    console.log("Amount in cents:", amountInCents);

    console.log("Creating Stripe payment intent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId || "N/A",
      },
    });

    console.log("Payment intent created successfully:", paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("=== STRIPE ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(400).json({
      success: false,
      error: "Failed to create payment intent",
      details: error.message,
      type: error.type || "unknown_error",
    });
  }
});

// Also add this test route to verify Stripe is working:
app.get("/api/test-stripe", async (req, res) => {
  try {
    console.log("Testing Stripe configuration...");
    console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "STRIPE_SECRET_KEY not set in environment variables",
      });
    }

    // Test with a minimal payment intent
    const testPayment = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: "usd",
    });

    res.json({
      success: true,
      message: "Stripe is configured correctly",
      testPaymentId: testPayment.id,
    });
  } catch (error) {
    console.error("Stripe test failed:", error);
    res.status(500).json({
      error: "Stripe configuration test failed",
      details: error.message,
    });
  }
});

app.post("/api/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update order status
      if (orderId) {
        const order = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "paid",
            paymentIntentId: paymentIntentId,
          },
          { new: true }
        );

        if (!order) {
          return res.status(404).json({
            success: false,
            error: "Order not found",
          });
        }
      }

      res.json({
        success: true,
        status: "paid",
        message: "Payment confirmed successfully",
      });
    } else {
      res.json({
        success: false,
        status: paymentIntent.status,
        message: `Payment status: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to confirm payment",
      details: error.message,
    });
  }
});

// Enhanced Order Routes
app.post("/api/orders", async (req, res) => {
  try {
    const {
      userId,
      customerDetails,
      items,
      subtotal,
      vatTotal,
      total,
      paymentMethod = "stripe",
    } = req.body;

    // Validate required fields
    if (!customerDetails || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Customer details and items are required",
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid total amount",
      });
    }

    // Create new order
    const order = new Order({
      userId: userId || null,
      customerDetails,
      items,
      subtotal: subtotal || 0,
      vatTotal: vatTotal || 0,
      total,
      paymentMethod,
      status: "pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      ...order.toObject(), // Return the order data in the format your frontend expects
      _id: order._id, // Ensure _id is included
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create order",
      details: error.message,
    });
  }
});

app.get("/api/orders/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Admin only - view all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Enhanced order status update
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Valid statuses: " + validStatuses.join(", "),
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      ...order.toObject(),
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Seed initial products (optional)
app.post("/api/seed", async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: "Henley Shirt",
        price: 1200,
        image:
          "https://5.imimg.com/data5/SELLER/Default/2021/3/YI/QC/TM/126748308/mens-henley-t-shirt-500x500.jpg",
        category: "men-henley",
        hasVat: true,
        description: "Comfortable henley shirt",
      },
      {
        name: "Formal Shirt",
        price: 2500,
        image:
          "https://5.imimg.com/data5/SELLER/Default/2023/11/359533772/VR/MK/CS/7756942/mens-formal-shirt-500x500.jpg",
        category: "men-shirt",
        hasVat: true,
        description: "Professional formal shirt",
      },
      {
        name: "Women Chain Watch",
        price: 4200,
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbPgNCps0U59-9ul7cbFVypicnMFOFVhJHGA&s",
        category: "women-watch",
        hasVat: true,
        description: "Stylish chain watch for women",
      },
    ];

    await Product.insertMany(sampleProducts);
    res.json({ message: "Sample products seeded successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = {
  app
};
