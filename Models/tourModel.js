const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourController = require('../controller/tourController.js');

// const User = require('./userModel.js')

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'tour name must less or equal 40 characters '],
      minlength: [10, 'tour name must more or equal 10 characters '],
      // validate : [validator.isAlpha , 'tour name must be contain only characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficlty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is esither: easy or medium ro difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating avg must be above 1.0'],
      max: [5, 'rating avg must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666 , 64.6 , 47 , 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // this only work when creat new document
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discountprice ({VALUE}) must be below price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a decription'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image'],
    },
    images: [String],
    CreatedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
      select : false
    },
    startLocation: 
      {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        select: false,

      },

    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('duartionWeeks').get(function () {
  return this.duration / 7;
});

// virtual population
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next()
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises)
//  next()
// });

// tourSchema.post('save', function (doc,next) {
//   console.log(doc);
//  next()
// });

tourSchema.pre(/^find/, function (next) {
  /* to work with any thing start find */
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -PasswordchangedAt',
  });
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
