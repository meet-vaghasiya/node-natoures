const Tour = require(`${__dirname}/../models/toursModal`);
const AppError = require('../appError');
const catchAsync = require('./catchAsync');
const {
  deleteFactory,
  updateFactory,
  createFactory,
  showFactory,
  listFactory,
} = require('./factoryHandler');
// middlewares

exports.top5TourMiddleware = catchAsync((req, res, next) => {
  req.query.sort = 'rating price';
  req.query.limit = 5;
  next();
});

exports.listAllTours = listFactory(Tour);

exports.createTour = createFactory(Tour);
exports.showTour = showFactory(Tour, {
  path: 'reviews',
  select: 'rating review',
});

exports.createTour = createFactory(Tour);
exports.updateTour = updateFactory(Tour);
exports.deleteTour = deleteFactory(Tour);

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { rating: { $gte: 0 } },
    },
    {
      $group: {
        _id: '$difficulty',
        num: { $sum: 1 },
        avgQty: { $avg: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(201).json({
    type: 'success',
    data: stats,
  });
});
