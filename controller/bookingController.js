const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../Models/tourModel');
const User = require('../Models/userModel');
const Booking = require('../Models/bookingModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactor');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(  async(req ,res ,next) => {
    // 1) Get the currently booked tour 
       const tour = await Tour.findById(req.params.tourId);

    // 2) create checkout session  
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/api/v1/tours?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}` ,
        success_url: `${req.protocol}://${req.get('host')}/api/v1/tours`,
        cancel_url :  `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                  currency: 'usd',
                  unit_amount: tour.price * 100,
                  product_data: {
                    name: `${tour.name}`,
                    description: `${tour.summary}`,
                    images: ['https://images.unsplash.com/photo-1575936123452-b67c3203c357?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D']
                  },
                },
                quantity: 1,
              }
            ]  
    })  
    const url = session.url  
    // 3) create session a response
    res.status(200).json({
        status: 'success',
        url
    })
})

// exports.createBookingCheckout = catchAsync( async (req,res,next) => {
//   const {tour , user , price} = req.query

//   if(!tour && !user && !price) return next();

//   await Booking.create({tour : tour , user : user , price: price})

//   res.redirect(req.originalUrl.split('?')[0])

// });

exports.createBookingCheckout =  async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({email :session.customer_email})).id;
  const price = session.display_items[0].price_data.unit_amount / 100;

  await Booking.create({tour, user, price})

};

exports.webhooksCheckout = ( req , res , next ) => {
  const signature = req.headers['stripe-signature'];
  console.log('helllooooooooooo')
  let event;
  try {
     event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  }
    catch (err){
    return res.status(400).send(`webhook error: ${err.message}`)
  }
  console.log(event)
  console.log(event.data.object)

  if (event.type === 'checkout.session.completed'){
    createBookingCheckout(event.data.object)
  }

  res.status(200).json({received : true})
}

exports.GetAllBookings = Factory.getAll(Booking);
exports.GetBooking = Factory.getOne(Booking);
exports.UpdateBooking = Factory.updateOne(Booking);
exports.createBooking = Factory.creatOne(Booking);
exports.deleteBooking = Factory.deleteOne(Booking);

