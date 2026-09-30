const mongoose = require('mongoose');
const cepSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true
  },
  index: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stack: {
    type: [String],
    required: true
  },
  href: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('cep', cepSchema, 'cep');