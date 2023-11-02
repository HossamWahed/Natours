const Review = require('../Models/reviewModel');
const Tour = require('../Models/tourModel');
const Factory = require('./handlerFactor');

exports.setTourUserIds = (req, res, next) => {
  // Allow Nexted routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next()
};

exports.GetAllReview = Factory.getAll(Review)
exports.createReview = Factory.creatOne(Review);
exports.deleteReview = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.getReview = Factory.getOne(Review);
