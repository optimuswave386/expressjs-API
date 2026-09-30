const errorCodes = {
  INVALID_INPUT: {
    code: 400,
    message: 'The input provided is invalid.'
  },
  NOT_FOUND: {
    code: 404,
    message: 'The requested user was not found.'
  },
  SERVER_ERROR: {
    code: 500,
    message: 'An internal server error occurred.'
  }
};

module.exports = errorCodes;