const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authHandler = require('../middleware/authHandler.js');

// Checkout requires a logged-in user (valid token)
router.post('/create-payment-intent', authHandler, paymentController.createPaymentIntent);
router.post('/order', authHandler, paymentController.saveOrder);
// Admin only: lists every customer's orders
router.get('/orders', authHandler, authHandler.requireAdmin, paymentController.getAllOrders);

module.exports = router;
