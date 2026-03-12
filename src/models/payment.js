const mongoose= require("mongoose")

const paymentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderId:{
        type:String,
        required:true
    },
    paymentId:{
        type:String
        
    },
    status:{
        type:String
    },
    amount:{
        type:String
    },
    currency:{
        type: String     
    },
    Receipt:{
        type:String
    },
    Notes:{
     firstName:{
        type:String,
     },
     lastName:{
        type:String
     },
     membershipType:{
        type:String
     }
    }
},{timestamps:true})

module.exports= new mongoose.model("payment",paymentSchema)