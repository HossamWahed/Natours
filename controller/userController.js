const fs = require('fs');
const User = require('../Models/userModel');
const multer = require('multer');
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactor');
const { now } = require('mongoose');

// const multerStorge = multer.diskStorage({
//   destination: (req ,file , cb) => {
//     cb (null ,'public/img/users' )
//   },
//   filename: (req ,file ,cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb (null ,`user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync( async (req , file , next) => {
  if(!req.file) return next ();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('jpeg')
  .jpeg({quality : 90 })
  .toFile (`public/img/users/${req.file.filename}`)

  next()
})

const filterobj = (obj, ...allowedFields) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (!allowedFields.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};


exports.deleteMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.getMe = (req , res ,next) => {
  req.params.id = req.user.id
  next()
}

exports.createuser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messagge: 'route is not defind! ',
  });
};

exports.UpdateMe = catchAsync(async (req, res, next) => {

  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for update password. please use /updatePassword ',
        400
        )
    );
  }
  // 2) filter out unwanted fields names that are not allowed to be updated
  const filterBody = filterobj(req.body,'email','role' );
  if(req.file) filterBody.photo = req.file.filename;

  // 3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true ,
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.GetAllUsers = Factory.getAll(User)
exports.deleteuser = Factory.deleteOne(User);
exports.Updateuser = Factory.updateOne(User);
exports.Getuser = Factory.getOne(User);