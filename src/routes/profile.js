const express=require("express")
const {userAuth}=require("../Middlewares/auth")
const { validateEditProfileData } = require("../utils/validate")
const bcrypt=require("bcrypt")
const User=require("../models/user")

const profileRouter= express.Router()

profileRouter.get("/profile/view",userAuth, async(req,res)=>{
 try{
    const user=req.user
    res.send(user)
 } catch(err){
res.status(400).send("Error"+ err.message)
 }
})

profileRouter.patch("/profile/edit",userAuth,async(req,res)=>{
   try{
    if(!validateEditProfileData(req)){
        throw new Error("Invaild Edit Request")
    }
   const user=req.user;
   Object.keys(req.body).forEach((key)=>(user[key]=req.body[key]))
 await user.save()
   res.json({
    message:`${user.firstName}, your profile was updated sucessfully`,
    data:user
})

   }
   catch(err){
    res.status(400).send("Error" + err.message)
   }
})

profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).send("New password is required");
    }

    if (!req.user) {
      return res.status(401).send("User not authenticated");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    req.user.password = newPasswordHash;
    await req.user.save();

    res.send("Password is updated successfully");
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

module.exports=profileRouter;