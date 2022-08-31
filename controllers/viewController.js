const AppError = require('../appError');
const Booking = require('../models/bookingModal');
const catchAsync = require('./catchAsync');
const Tour = require(`${__dirname}/../models/toursModal`);
const User = require(`${__dirname}/../models/userModal`);

const filterObj = (obje, ...keys) => {
  const newObj = {};

  Object.keys(obje).forEach((element) => {
    if (keys.includes(element)) newObj[element] = obje[element];
  });
  return newObj;
};

exports.overview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  return res.render('overview', {
    title: 'overview page',
    tours,
  });
});
exports.myBooking = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id });

  const tourIds = bookings.map((b) => b.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  return res.render('overview', {
    title: 'My booking',
    tours,
  });
});

exports.tour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });

  if (!tour) {
    return next(new AppError('Tour not found.', 404));
  }

  return res.render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.profile = catchAsync(async (req, res, next) => {
  return res.render('profile', {
    title: 'Profile',
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  req.body = filterObj(req.body, 'name', 'email');
  if (req.file) req.body.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user.id, req.body);

  return res.json({
    status: 'success',
    user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  return res.render('login', {
    title: 'Login page',
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logout', {
    expire: new Date() + 1,
    httpOnly: true,
  });
  console.log(
    'asssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss'
  );
  res.status(200).json({ type: 'success' });
});
