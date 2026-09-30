const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');

// Define routes and link them to controller functions

// This path is actually /quote/
router.get('/get-quote', quoteController.getQuote);

// This path is actually /quote/:id
router.get('/get-quote/:quoteid', quoteController.getQuoteById);

// Get a random quote
router.get('/randomquote', quoteController.getRandomQuote);

// Add new quote
router.post('/insert-quote', quoteController.addQuote);

// Update quote
router.put('/update-quote/:quoteid', quoteController.updateQuote);

// Remove quote
router.delete('/delete-quote/:quoteid', quoteController.removeQuote);

module.exports = router;