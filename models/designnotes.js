const mongoose = require('mongoose');
const designnotesSchema = new mongoose.Schema({
  datenoted: {
    type: Date,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  links: {
    hrefs: {
        type: [[String]],
        default: []
    }
  }
});

module.exports = mongoose.model('designnotes', designnotesSchema);