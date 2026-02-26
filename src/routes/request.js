const express=require('express')
const mongoose = require("mongoose");

const {userAuth}=require("../Middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');
const User=require("../models/user")

const requestRouter=express.Router()
requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
    try{
    const fromUserId=req.user._id;
    const toUserId=req.params.toUserId;
    const status=req.params.status;
   

  const allowedStatus=["ignored","interested"];
  if(!allowedStatus.includes(status)){
    return res.status(400).json({
        message:"Invaild status type" + " " +  status

    })
    
  }  


  if (!mongoose.Types.ObjectId.isValid(toUserId)) {
  return res.status(400).send("Invalid User ID");
}

const toUser= await User.findById(toUserId);
if(!toUser){
  return   res.status(400).send("User Not exist")
}
  

   const existingConnectionRequest=    await ConnectionRequest.findOne({
    $or:[
        {fromUserId,toUserId},
        {fromUserId:toUserId, toUserId:fromUserId}
    ]
  })

  if(existingConnectionRequest){
     return res.status(400).send("Connection Request already exist ")
  }

 

  const connectionRequest=new ConnectionRequest({
    fromUserId,
    toUserId,
    status
  })
  const data=await connectionRequest.save()
  res.json({
    message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
    data
  })
   // req.user.firstName + " is" + status + " in" + touser.firstName,//
} catch(err){
res.status(400).send("ERROR"+ err.message)
}
})

//receiver 

// status - accepted , rejected
// touserID- logged in user 
// status-interetsed
//requestId- present in db 
 
requestRouter.post("/request/review/:status/:requestId",userAuth,async(req,res)=>{
  try{
  const loggedInUser=req.user;
   const allowedStatus=["accepted","rejected"]
   const {status,requestId}=req.params;
  if(!allowedStatus.includes(status)){
    return res.status(400).json({
      message: "Invaild Status"
    })
  }
const connectionRequest= await ConnectionRequest.findOne({
  _id:requestId,
  toUserId:loggedInUser._id,
  status:"interested"

})

if(!connectionRequest){
  return res.status(400).json({
    message:"Connection Request not found"
  })
}
     connectionRequest.status=status;
     const data=await connectionRequest.save()
     res.json({
      message:"connection request " + status,
      data
     })
}

  
catch(err){
    res.status(400).send("ERROR" + err.message)
  }
})

module.exports=requestRouter;