const fs = require('fs');
const express = require('express');
const path = require('path');

const userController = require('../controller/userController.js');
const authController = require('../controller/authController.js');


const Booking = require('../Models/bookingModel.js');



const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login',authController.login);
Router.post('/forgotpassword', authController.forgotPassword);
Router.patch('/resetpassword/:token', authController.resetPassword);

Router.use(authController.protect); // protect all route after this middeleware

Router.patch('/updatePassword',authController.updatePassword);
Router.get('/me', userController.getMe, userController.Getuser);
Router.delete('/deleteMe', userController.deleteMe, userController.deleteuser);
Router.patch('/updateMe', userController.uploadUserPhoto ,userController.resizeUserPhoto, userController.UpdateMe);

Router.use(authController.restrictTo('admin'));

Router.route('/')
  .get(userController.GetAllUsers)
  .post(userController.createuser);

Router.route('/:id')
  .get(userController.Getuser)
  .patch(userController.Updateuser)
  .delete(userController.deleteuser);

module.exports = Router;
