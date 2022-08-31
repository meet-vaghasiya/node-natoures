const Review = require('../models/reviewModal');
const catchAsync = require('./catchAsync');
const {
  deleteFactory,
  updateFactory,
  createFactory,
  showFactory,
} = require('./factoryHandler');

exports.list = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tourId: req.params.tourId };

  const reviews = await Review.find();

  res.status(200).json({
    type: 'success',
    reviews,
  });
});

exports.setTourAndUserId = (req, res, next) => {
  req.body.user = req.user._id;
  req.body.tour = req.params.tourId;
  next();
};

exports.create = createFactory(Review);
exports.show = showFactory(Review);
exports.update = updateFactory(Review);
exports.deleteReview = deleteFactory(Review);
