const express= require("express")
const {userAuth}=require("../Middlewares/auth")
const razorpayInstance= require("../utils/razorpay")
const paymentRouter= express.Router();
const Payment= require("../models/payment");
const { membershipAmount } = require("../utils/constants");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require("../models/user");


paymentRouter.post("/payment/create", userAuth, async(req,res)=>{
    try{
        const {membershipType}= req.body;
        const{firstName, lastName, emailId}= req.user;
     const order= await razorpayInstance.orders.create({
        amount:membershipAmount[membershipType] * 100,
        "currency":"INR",
        "receipt":"receipt #1",
        "notes":{
           firstName,
           lastName,
           emailId,
            membershipType:membershipType
        }
     })

     const payment= new Payment({
                userId:req.user._id,
                orderId:order.id,
                status:order.status,
                amount:order.amount,
                currency:order.currency,
                receipt:order.receipt,
                notes:order.notes
     })

     const savedPayment= await payment.save()
     console.log(order)
     res.json({...savedPayment.toJSON() , keyId : process.env.RAZORPAY_KEY_ID})
    }
    catch(err){
        console.log(err.message)
  }

})
// paymentRouter.post("/payment/verify", async (req, res) => {
//   try {

//     console.log("Webhook called");
//     console.log("Headers:", req.headers);
// console.log("Body:", req.body);

//     const webhookSignature = req.headers("x-razorpay-signature");

//     const isWebhookValid = validateWebhookSignature(
//       JSON.stringify(req.body),
//       webhookSignature,
//       process.env.RAZORPAY_WEBHOOK_SECRET
//     );

//     if (!isWebhookValid) {
//       return res.status(400).send("Webhook invalid");
//     }

//     const paymentDetails = req.body.payload.payment.entity;

//     const payment = await Payment.findOne({
//       orderId: paymentDetails.order_id
//     });

//     payment.status = paymentDetails.status;
//     await payment.save();

//     console.log("payment saved");

//     const user = await User.findById(payment.userId);

//     user.isPremium = true;
//     user.membershipType = payment.notes.membershipType;

//     await user.save();

//     console.log("user saved");

//     return res.status(200).json({
//       message: "Webhook received successfully"
//     });

//   } catch (err) {
//     console.log(err);
//   }
// });


paymentRouter.post("/payment/verify", async (req, res) => {
  try {

    console.log("🔥 Webhook called");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const paymentDetails = req.body.payload.payment.entity;

    console.log("Payment Details:", paymentDetails);

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id
    });

    payment.status = paymentDetails.status;
    await payment.save();

    console.log("payment saved");

    const user = await User.findById(payment.userId);

    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;

    await user.save();

    console.log("user saved");

    return res.status(200).json({
      message: "Webhook received successfully"
    });

  } catch (err) {
    console.log(err);
  }
});


module.exports= paymentRouter;