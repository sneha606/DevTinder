const express=require("express")
const userRouter=express.Router();
const {userAuth}=require("../Middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

userRouter.get("/user/requests/received",userAuth,async(req,res)=>{
    try{
    const loggedInUser=req.user;
    const connectionRequests=await ConnectionRequest.find({
        toUserId:loggedInUser,
        status:"interested"
    }).populate("fromUserId",["firstName","lastName","gender","about","skills","age","photoURL"])
    res.json({
        message:"Data fetched sucessfully",
        data:connectionRequests
    })
} catch(err){
    res.status(400).send('ERROR'+ err.message)
}
})


userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUserId, status: "accepted" },
        { fromUserId: loggedInUserId, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "gender", "about", "skills","photoURL","age"])
      .populate("toUserId", ["firstName", "lastName", "gender", "about", "skills", "photoURL","age"]);

    const data = connectionRequests.map((row) => {
      // agar main sender hoon → receiver bhejo
      if (row.fromUserId._id.equals(loggedInUserId)) {
        return row.toUserId;
      }
      // warna sender bhejo
      return row.fromUserId;
    });

    res.json({
      message: "connections fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR " + err.message);
  }
});


userRouter.get("/feed",userAuth,async(req,res)=>{
  try{
const loggedInUser=req.user
const page=parseInt(req.query.page) || 1;
let limit=parseInt(req.query.limit) || 10;
limit=limit>50? 50 : limit
const skip= (page-1) * limit
const connectionRequests= await ConnectionRequest.find({
  $or:[
    {fromUserId:loggedInUser._id},
    {toUserId:loggedInUser._id}
  ]
}).select("fromUserId toUserId")

const hideUsersFromFeed= new Set()

connectionRequests.forEach((req)=>{
  hideUsersFromFeed.add(req.fromUserId.toString());
  hideUsersFromFeed.add(req.toUserId.toString())
})

const users= await User.find({
  $and:[
    {_id:{$nin:Array.from(hideUsersFromFeed)}},
    {_id:{$ne :loggedInUser._id}}
  ]
}).select("firstName lastName gender about skills age photoURL").skip(skip).limit(limit)
res.send(users)


  }catch(err){
    res.status(400).send("ERROR"+ err.message)
  }
})
module.exports=userRouter