const stripe = require('stripe')(process.env.STRIPE_SECRATE_KEY_API);

const AppError = require('../appError');
const Booking = require('../models/bookingModal');
const Tour = require('../models/toursModal');
const catchAsync = require('./catchAsync');

exports.bookingCreate = catchAsync(async (req, res, next) => {
  const { tour, price, user } = req.query;

  if (!tour || !price || !user) {
    return next();
  }

  await Booking.create({
    tour,
    user,
    price,
  });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.checkout = catchAsync(async (req, res, next) => {
  //   const tours = await Tour.find();
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('tour not found'));
  }

  const session = await stripe.checkout.sessions.create({
    client_reference_id: req.params.tourId,
    customer_email: req.user.email,
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        amount: tour.price * 100,
        quantity: 1,
        name: tour.name,
        description: tour.summary,
        images: [`http://localhost:3000/img/tours/${tour.imageCover}`],
        currency: 'inr',
      },
    ],

    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}?tour=${
      req.params.tourId
    }&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  });

  res.json({
    status: 'success',
    session,
  });
  //   return res.render('overview', {
  //     title: 'overview page',
  //   });
});
