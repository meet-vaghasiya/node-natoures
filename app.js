const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');
var cors = require('cors');

const cookieParser = require('cookie-parser');

const AppError = require('./appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname, 'views'));

app.use(cookieParser());

app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(
  hpp({
    whitelist: 'duration',
  })
);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many request.',
});
app.use(limiter);

const viewRouter = require('./routes/viewRouter');
const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');
const authRouter = require('./routes/authRouters');
const reviewRouter = require('./routes/reviewRoute');
const bookingRouter = require('./routes/bookingRouter');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(express.static(`${__dirname}/public`));

const url = {
  tours: '/api/v1/tours',
  users: '/api/v1/users',
  reviews: '/api/v1/reviews',
  booking: '/api/v1/booking',
};

app.use(authRouter);
app.use('/', viewRouter);
app.use(url.tours, tourRouter);
app.use(url.users, userRouter);
app.use(url.reviews, reviewRouter);
app.use(url.booking, bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
