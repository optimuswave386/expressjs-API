const mongoose = require('mongoose');
const quoteSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  context: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('quotes', quoteSchema);