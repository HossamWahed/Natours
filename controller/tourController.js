const Tour = require('../Models/tourModel');
const multer = require('multer');
const sharp = require('sharp')
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactor');
const AppError = require('../utils/appError');
const { promises } = require('nodemailer/lib/xoauth2');

const multerStorge = multer.memoryStorage();

const multerfilter = (req,file,cb) => {
  if (file.mimetype.startsWith('image')){
    cb(null ,true)
  } else {
    cb (new AppError('not an image please upload only image ',400) ,false)
  }
} 

const upload = multer({
  storage : multerStorge ,
  fileFilter : multerfilter
 })

exports.uploadTourPhoto = upload.fields([
  {name: 'imageCover' , maxCount : 1 } ,
  {name: 'images' , maxCount : 3 } 
]);

exports.resizeTourPhoto = catchAsync( async(req , res, next) => {
console.log(req.files)
  // if( !req.files.images || !req.files.imageCover ) return next ();

  // 1) image cover
  if( req.files.imageCover ) {
    req.body.imageCover  = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality : 90 })
    .toFile (`public/img/tours/${req.body.imageCover}`)
    // req.body.imageCover = imageCoverFilename; 
  }

 // 2) images
    if( req.files.images ) {
      req.body.images  = [];
  
      await Promise.all(
      req.files.images.map(async (file , i) => {
        console.log(file.buffer)
       const filename = `tours-${req.params.id}-${Date.now()}-${i+1}.jpeg`
        await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality : 90 })
        .toFile (`public/img/tours/${filename}`)
  
        req.body.images.push(filename)
      })
    );
    console.log(req.body.images)
    }
  next()
})

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.GetAllTour = Factory.getAll(Tour);
exports.GetTour = Factory.getOne(Tour, { path: 'reviews', select: '-__v -CreatedAt' });
exports.Updatetour = Factory.updateOne(Tour);
exports.createTour = Factory.creatOne(Tour);
exports.deleteTour = Factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        sumprice: { $sum: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        avgprice: { $avg: '$price' },
        minprice: { $min: '$price' },
        maxpriceg: { $max: '$price' },
      },
    },

    {
      $sort: { avgprice: 1 },
    },

    // {
    //   $match: {_id:{$ne:'EASY'}}
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMontlyTour = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTourstart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },

    {
      $project: { _id: 0 },

    },

    {
      $sort: { numTourstart: -1 },
    },
    
    {
      $limit: 5,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'please provid latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });


  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});


exports.getDistances = catchAsync(async (req, res, next) => {
  const {latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001 ;

  if (!lat || !lng) {
    next(
      new AppError(
        'please provid latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
    $geoNear : {
      near: {
        type : 'Point',
        coordinates : [  lng * 1 , lat * 1 ]
      },
      distanceField : 'distance',
      distanceMultiplier : multiplier
    },
  },
  {
    $project : {
      distance : 1,
      name : 1
    }
  }
])
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });

});