const express = require('express');

const tourController = require('../controller/tourController.js');
const authController = require('../controller/authController.js');
const reviewRouter = require('./reviewRouter');
const bookingController = require('../controller/bookingController.js');


const Router = express.Router();
// Router.param('id',tourController.checkID);

Router.use('/:tourId/reviews', reviewRouter);

Router.route('/top-5-cheap').get(
  tourController.aliasTopTour,
  tourController.GetAllTour
);

Router.route('/tours-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMontlyTour
);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourController.getTourWithin
);

Router.route('/distances/:latlng/unit/:unit').get(
  tourController.getDistances
);

Router.route('/')
  .get(bookingController.createBookingCheckout, tourController.GetAllTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

Router.route('/:id')
  .get(authController.protect,tourController.GetTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.Updatetour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
