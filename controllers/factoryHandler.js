const AppError = require('../appError');
const catchAsync = require('./catchAsync');
const ApiResourse = require(`${__dirname}/../utils/ApiResourse.js`);

exports.listFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    let data = new ApiResourse(Model, req.query)
      .filter()
      .sorting()
      .limit()
      .paginate();

    data = await data.query;

    res.status(200).json({
      type: 'success',
      results: data.length,
      data: {
        data,
      },
    });
  });
};

exports.showFactory = (Model, populateOpt) => {
  return catchAsync(async (req, res, next) => {
    const query = Model.findOne({ _id: req.params.id });
    if (populateOpt) query.populate(populateOpt);

    const data = await query;
    if (!data) {
      return next(new AppError('No id found with given id', 404));
    }
    res.status(200).json({
      type: 'success',
      data: {
        data,
      },
    });
  });
};

exports.deleteFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No doc found with given id', 404));
    }
    res.status(201).json({
      type: 'success',
      data: null,
    });
  });
};

exports.updateFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!data) {
      return next(new AppError('No id found with given id', 404));
    }

    res.status(200).json({
      type: 'success',
      data: {
        data,
      },
    });
  });
};

exports.createFactory = (Model) => {
  return catchAsync(async (req, res, next) => {
    const data = req.body;
    const newData = await Model.create(data);
    res.status(200).json(newData);
  });
};
