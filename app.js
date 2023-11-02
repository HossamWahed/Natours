const fs = require('fs');
const express = require('express');
const busboyBodyParser = require('busboy-body-parser');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouters = require('./route/tourRouters.js');
const userRouters = require('./route/userRouters.js');
const reviewRouters = require('./route/reviewRouter.js');
const bookingRouters = require('./route/BookingRouter.js');

const Tour = require('./Models/tourModel');

const app = express();

// 1) global middleware

// Set security HTTP header
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Parse form data using busboy-body-parser
// app.use(busboyBodyParser({
//   limit: '50mb',
// }));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data santization against NOSQL query injection
app.use(mongoSantize());

// Data santization against xss
app.use(xss());

// Preventing paramter pollution
app.use(
  hpp({
    whitelist: [
      'ratingsAverage',
      'ratingsQuantity',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serveing static files
app.use(express.static('./public'));

// Test middelware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) route
app.use('/api/v1/tours', tourRouters);
app.use('/api/v1/users', userRouters);
app.use('/api/v1/reviews',reviewRouters);
app.use('/api/v1/bookings',bookingRouters);






app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this serve!`,404));
});

app.use(globalErrorHandler);

  
module.exports = app;
