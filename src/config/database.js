const mongoose=require('mongoose')

const connectDB=async ()=>{
    await mongoose.connect(process.env.MONGODB_DATABASE)

}
module.exports=connectDB;


