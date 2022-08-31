const AppError = require('../appError');
const catchAsync = require('./catchAsync');
const User = require('./../models/userModal');
const {
  deleteFactory,
  updateFactory,
  showFactory,
  listFactory,
} = require('./factoryHandler');

const filterObj = (obje, ...keys) => {
  const newObj = {};

  Object.keys(obje).forEach((element) => {
    if (keys.includes(element)) newObj[element] = obje[element];
  });
  return newObj;
};

exports.list = listFactory(User);

exports.showMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.create = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    type: 'success',
    data: user,
  });
});
exports.showUser = showFactory(User);
exports.filterBody = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password || confirmPassword) {
    return next(new AppError('passsword fields is not editable.'));
  }

  req.body = filterObj(req.body, 'name', 'email');
  next();
};

exports.updateUser = updateFactory(User);
exports.deleteUser = deleteFactory(User);
