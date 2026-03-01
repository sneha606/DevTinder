const validator=require("validator")
const User = require("../models/user");
const validateSignupData= async (req)=>{
   
    const{firstName,lastName,emailId,password}=req.body;



    if(!firstName || !lastName){
        throw new Error("Name Field is empty")
    }
         const existingUser = await User.findOne({ emailId });
     if (existingUser) {
  throw new Error("Email is already registered");
}
    else if(firstName<4|| firstName>50){
        throw new Error("Name charcters should between 4-50")
    }
    
    else if(!validator.isEmail(emailId)){
        throw new Error("Please enter corerct email Address")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("please enter a strong password")
    }
}

const validateEditProfileData=(req)=>{
    const allowedEditFields=["firstName","lastName","about","skills","age","gender","photoURL"]

    const isEditAllowed=Object.keys(req.body).every(field=>allowedEditFields.includes(field))
    
    return isEditAllowed
}

module.exports={
validateSignupData,
validateEditProfileData,
}

