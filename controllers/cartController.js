//controller/cartController.js
const asyncHandler = require('express-async-handler');
const CartItem = require('../models/cart.js');

// The cart lives in MongoDB (model: models/cart.js) instead of a module-level array,
// because serverless instances don't share memory and are recycled at any time.

// Hide Mongo internals so responses keep the same shape the client already expects
const PUBLIC_FIELDS = '-_id -__v';

// Accept the legacy lowercase "productid" too, and always store "productId"
const normalize = (body = {}) => {
  const { productid, ...rest } = body;
  if (rest.productId === undefined && productid !== undefined) rest.productId = productid;
  return rest;
};

// route is /cart/
// Controller to get all cart items
exports.getAllCartItems = asyncHandler(async (req, res) => {
  const cartItems = await CartItem.find({}).select(PUBLIC_FIELDS).lean();
  res.status(200).json(cartItems);
});

// route is /cart/:id
// Controller to get a single cart item by ID
exports.getCartItemById = asyncHandler(async (req, res) => {
  const item = await CartItem.findOne({ id: parseInt(req.params.id) }).select(PUBLIC_FIELDS).lean();

  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).send('Cart item not found');
  }
});

// POST
// Controller to add an item to the cart
// Invalid bodies fail schema validation and are turned into a 400 by errorHandler
exports.addItemToCart = asyncHandler(async (req, res) => {
  const created = await CartItem.create(normalize(req.body));
  const { _id, __v, ...newItem } = created.toObject();
  res.status(201).json(newItem);
});

// PUT
// Controller to update (replace) a cart item
exports.updateCartItem = asyncHandler(async (req, res) => {
  const itemId = parseInt(req.params.id);
  const body = normalize(req.body);
  const updatedItem = await CartItem.findOneAndReplace(
    { id: itemId },
    { ...body, id: body.id ?? itemId },
    { new: true, runValidators: true }
  ).select(PUBLIC_FIELDS).lean();

  if (updatedItem) {
    res.status(200).json(updatedItem);
  } else {
    res.status(404).send('Cart item not found');
  }
});

// DELETE
// Controller to remove an item from the cart
exports.removeItemFromCart = asyncHandler(async (req, res) => {
  const removed = await CartItem.findOneAndDelete({ id: parseInt(req.params.id) });

  if (removed) {
    res.status(200).send('Item removed from cart');
  } else {
    res.status(404).send('Cart item not found');
  }
});

// DELETE all
// Controller to clear the entire cart — used after a successful checkout
exports.clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({});
  res.status(200).send('Cart cleared');
});

// Controller to check if a product is already in the cart
exports.checkCartItem = asyncHandler(async (req, res) => {
  const item = await CartItem.exists({ productId: parseInt(req.params.productId) });
  res.status(200).json({ exists: !!item });
});

// Controller to patch item quantity in cart
exports.patchCartItemQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
    return res.status(400).json({ message: 'quantity must be a number' });
  }

  const item = await CartItem.findOneAndUpdate(
    { id: parseInt(req.params.id) },
    { quantity },
    { new: true, runValidators: true }
  ).select(PUBLIC_FIELDS).lean();

  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).send('Cart item not found');
  }
});
