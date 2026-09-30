// utils/CustomError.js
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Capture the stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;


// Usage example for routes file (uncomment to use):
// const CustomError = require('../utils/CustomError.js');
// app.get('/async-error', (req, res, next) => {
//   // Simulate an async operation that throws an error
//   setTimeout(() => {
//     const error = new CustomError('Failed to fetch data', 404);
//     next(error); // Pass the error to the error handler
//   }, 100);
// });