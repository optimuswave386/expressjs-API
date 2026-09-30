const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  // Was "productid" (all lowercase), but the controller and routes use "productId",
  // so the field was silently dropped and validation failed on every insert.
  productId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },  
  quantity: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('shoppingcart', cartSchema);
