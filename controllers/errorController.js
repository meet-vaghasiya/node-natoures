const AppError = require('../appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value} `;
  return new AppError(message, 400);
};

const errorProduction = (err, req, res, statusCode) => {
  console.log('comeing');
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        type: err.type,
        message: err.message,
      });
    } else {
      console.error('Error :', err);
      res.status(500).json({
        type: 'error',
        message: 'Some thing went wrong.',
      });
    }
  } else {
    return res.status(err.isOperational ? statusCode : 500).render('error', {
      type: err.type,
      message: err.isOperational ? err.message : 'Something went wronng',
    });
  }
};

const errorDevelopment = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      type: err.type,
      stack: err.stack,
    });
  }

  return res.render('error', {
    type: err.type,
    message: err.message,
  });
};

const handleJwtTokenError = (err) =>
  new AppError('invalida detail. plase login agagin');
const handleTokenExpireError = (err) =>
  new AppError('invalida detail. plase login agagin');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errorDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    console.log('pppppppppppp', err, 'pppppppppppp');
    if (err.name === 'CaseError') error = handleCastErrorDB(error);
    else if (err.name === 'JsonWebTokenError')
      error = handleJwtTokenError(error);
    else if (err.name === 'TokenExpiredError:')
      error = handleTokenExpireError(error);
    errorProduction(error, req, res, error.statusCode);
  }
};
