const jwt=require("jsonwebtoken")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const validator=require("validator")
const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4,
        maxLength:50

    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        required:true,
       unique:true,
       lowercase:true,
       trim:true,
       validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Email is not vaild")
        }
       }
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        min:18,
        max:50
    },
    gender:{
        type:String,
        validate(value){
         if (!value) return; 
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender is not vaild")
            }
        }
    },
    about:{
        type: String,
        default:"This is the default about of the user"
    },
    photoURL:{
        type:String,
        default:"https://images.unsplash.com/photo-1750535135593-3a8e5def331d?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

    },
    skills:{
        type:[String],
        validate(value){
            if(value.length>5){
                throw new Error("Skills should only be 5 ")
            }
        }
    }, 
    newPassword:{
        type:String
    },
    isPremium:{
        type:Boolean,
        default:false
    },
    membershipType:{
        type:String
    }
}, {timestamps: true}
)


userSchema.methods.getJWT=async function(){
    const user=this;
    const token=jwt.sign({_id:user._id},"DevTinder@3737",{
                    expiresIn:"7d"
                })

        return token;        
}


userSchema.methods.validatePassword=async function(passwordInputByUser){
    const user=this;
    const passwordHash=user.password;
    const isPasswordVaild=await bcrypt.compare(
        passwordInputByUser,
        passwordHash);
        return isPasswordVaild;
}


const User=mongoose.model("User", userSchema)

module.exports=User;