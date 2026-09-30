const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Order = require('../models/order.js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to compute total from items
function computeTotal(items) {
  return items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
}

// POST /payment/create-payment-intent
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const { items, customer } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  const total = computeTotal(items);
  const amount = Math.round(total * 100); // cents

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe is not configured on this server', total });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' }
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, total });
  } catch (err) {
    console.error('Stripe payment intent error:', err.message);
    res.status(502).json({ error: 'Could not create payment intent', total });
  }
});

// POST /payment/order
// Save order after successful payment
exports.saveOrder = asyncHandler(async (req, res) => {
  const { items, total, customer, paymentIntentId, paymentStatus } = req.body;
  if (!items || !total || !paymentIntentId) {
    return res.status(400).json({ error: 'Missing order data' });
  }

  const order = new Order({ items, total, customer, paymentIntentId, paymentStatus: paymentStatus || 'paid' });
  const saved = await order.save();
  res.status(201).json(saved);
});

// GET /payment/orders
// List all orders, most recent first — used by the Orders page and the Dashboard
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.status(200).json(orders);
});
