const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  category: String,
  price: Number,
  quantity: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  total: { type: Number, required: true },
  customer: {
    name: String,
    email: String,
    address: String
  },
  paymentIntentId: String,
  paymentStatus: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('orders', orderSchema);
