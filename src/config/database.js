const mongoose=require('mongoose')

const connectDB=async ()=>{
    await mongoose.connect("mongodb+srv://DevTinder:PtVVpcZ7OGnqhSsu@devtinder.aeilcvl.mongodb.net/devtinder")

}
module.exports=connectDB;


