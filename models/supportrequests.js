const mongoose = require('mongoose');
const supportRequestsSchema = new mongoose.Schema({
  contactEmail: {
    type: String,
    required: true
  },
  issueDescription: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('supportrequests', supportRequestsSchema);