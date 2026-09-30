const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Define routes and link them to controller functions

// This path is actually /cart/
router.get('/', cartController.getAllCartItems);

// This path is actually /cart/:id
router.get('/:id', cartController.getCartItemById);

// Check if a product is already in the cart /cart/check/:productId
router.get('/check/:productId', cartController.checkCartItem);

// Add item to cart
router.post('/', cartController.addItemToCart);

// Update cart item
router.put('/:id', cartController.updateCartItem);

// Remove item from cart
router.delete('/:id', cartController.removeItemFromCart);

// Clear the entire cart (used after checkout)
router.delete('/', cartController.clearCart);

// Patch item quantity in cart
router.patch('/:id', cartController.patchCartItemQuantity);

module.exports = router;