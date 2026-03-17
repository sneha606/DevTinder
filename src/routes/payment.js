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

//     const webhookSignature = req.get("X-Razorpay-Signature");
//       const isWebhookValid= validateWebhookSignature(
//       JSON.stringify(req.body),
//       webhookSignature,
//       process.env.RAZORPAY_WEBHOOK_SECRET
//     );

//     if (!isWebhookValid) {
//       return res.status(400).send("Webhook invalid");
//     }

// const body = JSON.parse(req.body.toString()); 

//     const paymentDetails = req.body.payload.payment.entity;

//     const payment = await Payment.findOne({
//       orderId: paymentDetails.order_id
//     });

//     if (!payment) {
//       return res.status(404).send("Payment not found");
//     }

//     payment.status = paymentDetails.status;
//     await payment.save();

//     const user = await User.findOne({_id:payment.userId});

//     user.isPremium = true;
//     user.membershipType = payment.notes.membershipType;

//     await user.save();

//     return res.status(200).json({
//       message: "Webhook received successfully"
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(500).send("Server error");
//   }
// });
paymentRouter.post("/payment/verify", async (req, res) => {
  try {
    console.log("🔥 Webhook called");

    const webhookSignature = req.get("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      req.body, // ✅ raw body
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("❌ Invalid webhook");
      return res.status(400).send("Webhook invalid");
    }

    // ✅ अब parse करो
    const body = JSON.parse(req.body.toString());

    console.log("✅ Webhook Data:", body);

    const paymentDetails = body.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id
    });

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({ _id: payment.userId });

    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;

    await user.save();

    return res.status(200).json({
      message: "Webhook received successfully"
    });

  } catch (err) {
    console.log("❌ ERROR:", err);
    return res.status(500).send("Server error");
  }
});



module.exports= paymentRouter;