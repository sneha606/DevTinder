const User=require("../models/user")
const jwt=require("jsonwebtoken")
const userAuth=async(req,res,next)=>{
    // read the cookies

     const cookies=req.cookies
    const{token}=cookies;
    if(!token){
       return res.status(401).send("Please Login")
    }

    //verify token

    const decodedObj= await jwt.verify(token,"DevTinder@3737")

    //find user

    const{_id}=decodedObj;
    const user=await User.findById(_id)

    if(!user){
        throw new Error("User Not Found")
    }

    req.user=user;
    next();
}

module.exports={
    userAuth
}
