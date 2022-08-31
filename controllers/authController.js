const User = require('./../models/userModal');
const AppError = require('../appError');
const crypto = require('crypto');

const Email = require('../email');
const { promisify } = require('util');

const catchAsync = require('./catchAsync');
const jwt = require('jsonwebtoken');
const { token } = require('morgan');
const Tour = require('../models/toursModal');

const getJWTToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRATE_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (newUser, statusCode, req, res) => {
  const token = getJWTToken({ id: newUser._id });
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  res.cookie('jwt', token, cookieOption);

  newUser.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user: newUser,
      token,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const currUrl = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, currUrl).sendWelcome();

  createAndSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check email and password exists

  if (!email || !password) {
    return next(new AppError('Email and password field is required.'));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.validatePassword(password, user.password))) {
    return next(new AppError('user and password does not match'));
  }

  createAndSendToken(user, 201, req, res);

  // compare email and password

  // if valid than send success response
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError('email field is required.'));
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found', 401));
  }

  const token = user.createForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const protocol = req.protocol;
  const host = req.hostname;
  const url = req.originalUrl;
  const port = process.env.PORT;

  const fullUrl = `${protocol}://${host}:${port}/resetPassword/${token}`;

  await new Email(user, fullUrl).resetPassword();
  // sendEmail({
  //   subject: 'Password reset mail',
  //   to: user.email,
  //   text: `yout password reset link is ${fullUrl}`,
  // });

  res.send({
    token,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const reqToken = req.params.token;

  if (!reqToken) {
    return next(new AppError('token is required.'));
  }

  // check also password and confirm password should be same

  const decode = crypto.createHash('sha256').update(reqToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: decode,
    passwordResetExpireAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('token not found or token is exprired.'));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpireAt = undefined;
  await user.save();

  const token = getJWTToken({ id: user._id });

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(400).json({
        status: 'error',
        message: 'password and confirm password is required field',
      });
    }
    return next(
      new AppError('password and confirm password is required field')
    );
  }

  const user = await User.findOne({ id: req.user.id });

  if (!user.validatePassword(password, req.user.password)) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(400).json({
        status: 'error',
        message: 'password does not match.',
      });
    }
    return next(new AppError('password does not match.'));
  }

  user.password = password;
  await user.save();

  createAndSendToken(user, 201, req, res);
});

exports.protected = catchAsync(async (req, res, next) => {
  //  1. getting token
  const head =
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ');
  let token = null;
  if (head) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not authorise', 401));
  }

  //  2. validate token

  const decode = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRATE_KEY
  );

  //  3. chck user is exists and not change password
  const user = await User.findOne({ _id: decode.id });

  // const tour = await Tour.findById('5c88fa8cf4afda39709c2955');
  if (!user) {
    return next(new AppError('User doesnot exists', 401));
  }
  //  4. password is not changed
  if (user.changedPasswordAfter(user.iat))
    return next(new AppError('Login time out please change password again'));
  req.user = user;
  next();
});
exports.isLoggin = async (req, res, next) => {
  //  1. getting token

  try {
    let token = null;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;

      if (!token) {
        return next();
      }

      //  2. validate token

      const decode = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRATE_KEY
      );

      //  3. chck user is exists and not change password
      const user = await User.findOne({ _id: decode.id });

      // const tour = await Tour.findById('5c88fa8cf4afda39709c2955');
      if (!user) {
        return next();
      }
      //  4. password is not changed
      if (user.changedPasswordAfter(user.iat)) return next();
      res.locals.user = user;
      return next();
    }
  } catch {
    next();
    return;
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('permission dinied', 403));
    }

    next();
  };
};
