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


paymentRouter.post("/payment/verify", async(req,res)=>{
    try{
      const webhookSignature= req.headers("X- Razorpay.Signature")
      const isWebhookVaild=  validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)
       console.log("webhook called")

      if(!isWebhookVaild){
        return res.status(400).send("Webook invaild")
      }

 const paymentDetails= req.body.payload.Payment.entity
 const Payment= await Payment.findOne({orderId: paymentDetails.order_id})

 Payment.status= paymentDetails.status
 await Payment.save()
 console.log("payment saved")

 const user= await User.findOne({_id:Payment.userId})
 user.isPremium= true;
 user.membershipType= Payment.notes.membershipType
await user.save()
console.log("user saved")
return res.status(200). JSON({message: "Webhook received sucessfully"})


    }catch(err){
        console.log(err)
    }
})




module.exports= paymentRouter;