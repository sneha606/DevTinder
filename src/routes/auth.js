const express=require("express");
const authRouter=express.Router();
const {validateSignupData}=require("../utils/validate")
const User=require("../models/user")
const bcrypt=require("bcrypt")

authRouter.post("/signup", async(req,res)=>{
    try{
        //validate data
 await validateSignupData(req);
        
        //encrypt password

        const {firstName,lastName,emailId,password}=req.body
        const PasswordHash= await bcrypt.hash(password,10);

        //add to database
        const user=new User({
            firstName,lastName,emailId,password:PasswordHash
        })
        const savedUser= await user.save();
        const token= await savedUser.getJWT();
        res.cookie("token",token,{
            expires: new Date(Date.now() + 8 * 360000)
        })

    
    res.json({message:"User Added Successfully",data: savedUser})
    } catch(err){
   res.status(400).json({
      message: err.message
   })
}
    
})



authRouter.post("/login",async (req,res)=>{
    try{
        const{emailId,password}=req.body
        const user=await User.findOne({emailId:emailId})
        if(!user){
            throw new Error("User is not present ")
        }

        const isPasswordVaild=await user.validatePassword(password)
        if(isPasswordVaild){

            //creating a jwt token 
            const token= await user.getJWT()
            console.log(token)
            //sending to user by wrapping into cookies

            res.cookie("token",token)
            res.send(user);
        }
        else{
            throw new Error("Password is incorrect")
        }
    }  catch(err){
        res.status(400).send("Error: "+ err.message)
    }
})


authRouter.post("/logout",async(req,res)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now())
    })
    res.send("Logout Sucessful")
})
module.exports=authRouter;