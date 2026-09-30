const errorCodes = require('../errorcodes.js');

const isProduction = process.env.NODE_ENV === 'production';

// Work out the HTTP status for an error, most specific source first:
// 1. err.statusCode  (CustomError)
// 2. err.status      (errors from body-parser / express, e.g. malformed JSON -> 400)
// 3. mongoose validation / cast errors -> 400
// 4. a 4xx/5xx the route already set on res
// 5. otherwise 500
const getStatus = (err, res) => {
  if (err.statusCode >= 400 && err.statusCode < 600) return err.statusCode;
  if (err.status >= 400 && err.status < 600) return err.status;
  if (err.name === 'ValidationError' || err.name === 'CastError') return errorCodes.INVALID_INPUT.code;
  if (res.statusCode >= 400) return res.statusCode;
  return errorCodes.SERVER_ERROR.code;
};

const defaultMessage = (status) => {
  switch (status) {
    case errorCodes.INVALID_INPUT.code: return errorCodes.INVALID_INPUT.message;
    case errorCodes.NOT_FOUND.code: return errorCodes.NOT_FOUND.message;
    default: return status >= 500 ? errorCodes.SERVER_ERROR.message : 'Request failed.';
  }
};

const errorHandler = (err, req, res, next) => {
  // If a response has already started we can't send another one; let Express finish it
  if (res.headersSent) return next(err);

  const status = getStatus(err, res);
  console.error(`[${status}] ${req.method} ${req.originalUrl} - ${err.message}`);

  // Client errors (4xx) may show the specific message (e.g. which field failed validation).
  // Server errors (5xx) never leak internals in production.
  const message = status < 500 || !isProduction
    ? (err.message || defaultMessage(status))
    : defaultMessage(status);

  const body = { message };
  if (!isProduction) body.stackTrace = err.stack; // stack traces only outside production

  res.status(status).json(body);
};

module.exports = errorHandler;
