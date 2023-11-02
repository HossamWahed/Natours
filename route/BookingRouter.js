const express = require('express');
const bookingController = require('../controller/bookingController.js');
const authController = require('../controller/authController.js');

const Router = express.Router(); 

Router.get(
    '/checkout-session/:tourId',
    authController.protect,
    bookingController.getCheckoutSession
    )
    
Router.route('/')
.get(bookingController.GetAllBookings)
.post(authController.protect, bookingController.createBooking)

Router.use (authController.protect)

Router.route('/:id')
.get(bookingController.GetBooking)
.patch(bookingController.UpdateBooking)
.delete(bookingController.deleteBooking)

module.exports = Router ;
