
const asyncHandler = require('express-async-handler');
const quotes = require('../models/quotes.js'); // Import the Quotes model

// const quotes = [
//         { id: 1, author: "Franklin D. Roosevelt", context:"", message: "The only limit to our realization of tomorrow is our doubts of today." },
//         { id: 2, author: "Walt Disney", context:"", message: "The future belongs to those who believe in the beauty of their dreams." },
//     ];

// Example data source (with actual database logic)

exports.getQuote = asyncHandler( async (req, res) => {
    
    // Logic to get quotes (e.g., from database)
    try {
        const quotesresponse = await quotes.findOne();
        res.json(quotesresponse);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});

// Get quote by ID
exports.getQuoteById = asyncHandler( async (req, res) => {
    try {
        const quoteId = req.params.quoteId;
        const quotesresponse = await quotes.findOne({ _id: quoteId });
        res.json(quotesresponse);
        console.log(`Fetched quote with ID: ${quoteId}`);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
});

// Get a random quote
exports.getRandomQuote = asyncHandler( async (req, res) => {
    try {
        const quotesresponse = await quotes.aggregate([
          { $sample: { size: 1 } }
        ]);
        //const quotesresponse = await quotes.find();
        res.json(quotesresponse);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new quote
exports.addQuote = asyncHandler( async (req, res) => {
    const quote = new quotes({
        author: req.body.author,
        context: req.body.context,
        message: req.body.message
      });
      try {
        const newQuote = await quote.save();
        res.status(201).json(newQuote);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
});

// Update quote
exports.updateQuote = asyncHandler( async (req, res) => {
    const quoteId = parseInt(req.params.quoteid);
    const updatedQuote = { id: quoteId, text: req.body.text }; // Replace with actual DB update
    res.status(200).json(updatedQuote);
});

// Remove quote
exports.removeQuote = asyncHandler( async (req, res) => {
    const quoteId = parseInt(req.params.quoteid);
    // Replace with actual DB delete operation
    res.status(200).json({ message: `Quote with ID ${quoteId} deleted.` });
});