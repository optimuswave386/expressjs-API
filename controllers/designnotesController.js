const asyncHandler = require('express-async-handler');
const designnotes = require('../models/designnotes.js'); // Import the model


exports.getNotesFromDB = asyncHandler( async (req, res) => {
  const notesFromDB = await designnotes.find({});
  //console.log('Found docs:', projectsFromDB);
  res.status(200).json(notesFromDB);
});

exports.getNotesFromDB_withpagination = asyncHandler( async (req, res) => {
  const itemsPerPage = parseInt(req.params.itemsperpage);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
    return res.status(400).send('Invalid items per page parameter');
  }
  const notesFromDB = await designnotes.find({}).limit(itemsPerPage);
  res.status(200).json(notesFromDB);
});