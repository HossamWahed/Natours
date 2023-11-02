const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //for nested to get all reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const Features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitfields()
      .panigation();
    // const doc = await Features.query.explain();
    const doc = await Features.query;

    res.status(200).json({
      status: 'succes',
      results: doc.length,
      data: {
        data : doc
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document with this ID', 404));
    }
    res.status(204).json({
      status: 'succes',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document with this ID', 404));
    }
    res.status(200).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });

exports.creatOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document with this ID', 404));
    }
    res.status(200).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });
