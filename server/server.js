const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartz-findery')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  hasVat: Boolean,
  description: String
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: { type: String, default: 'pending' },
  paymentIntentId: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Middleware for role checking
const requireAdmin = (req, res, next) => {
  // Simple role check - in production use JWT tokens
  const { userRole } = req.headers;
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireAuth = (req, res, next) => {
  const { userId } = req.headers;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ success: true, user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    res.json({ success: true, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
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

// Admin only routes
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
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

// Stripe Routes
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update order status
      await Order.findByIdAndUpdate(orderId, { 
        status: 'paid',
        paymentIntentId: paymentIntentId 
      });
      
      res.json({ success: true, status: 'paid' });
    } else {
      res.json({ success: false, status: paymentIntent.status });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Order Routes
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/orders/user/:userId', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin only - view all orders
app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin only - update order status
app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Seed initial products (optional)
app.post('/api/seed', async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: 'Henley Shirt',
        price: 1200,
        image: 'https://5.imimg.com/data5/SELLER/Default/2021/3/YI/QC/TM/126748308/mens-henley-t-shirt-500x500.jpg',
        category: 'men-henley',
        hasVat: true,
        description: 'Comfortable henley shirt'
      },
      {
        name: 'Formal Shirt',
        price: 2500,
        image: 'https://5.imimg.com/data5/SELLER/Default/2023/11/359533772/VR/MK/CS/7756942/mens-formal-shirt-500x500.jpg',
        category: 'men-shirt',
        hasVat: true,
        description: 'Professional formal shirt'
      },
      {
        name: 'Women Chain Watch',
        price: 4200,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbPgNCps0U59-9ul7cbFVypicnMFOFVhJHGA&s',
        category: 'women-watch',
        hasVat: true,
        description: 'Stylish chain watch for women'
      }
    ];
    
    await Product.insertMany(sampleProducts);
    res.json({ message: 'Sample products seeded successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});