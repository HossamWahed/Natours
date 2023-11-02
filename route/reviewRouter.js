const express = require('express');

const reviewController = require('../controller/reviewController.js');
const authController = require('../controller/authController.js');

const Router = express.Router({ mergeParams: true }); // for use param from another Route

Router.use(authController.protect);

Router.route('/')
  .get(reviewController.GetAllReview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

Router.route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = Router ;
