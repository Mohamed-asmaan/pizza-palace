// Prints each HTTP request in the terminal (helpful when debugging)
const morgan = require('morgan');

const requestLogger = () => {
  if (process.env.NODE_ENV === 'production') {
    return morgan('combined');
  }
  return morgan('dev');
};

module.exports = requestLogger;
