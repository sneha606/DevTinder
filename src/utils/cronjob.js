const cron= require("node-cron")
const  ConnectionRequest= require("../models/connectionRequest") 
const{subDays,startOfDay, endOfDay}=require("date-fns")
const sendEmail= require("./sendEmail")

cron.schedule("0 8 * * *",async()=>{
  try{
    const yesterday= subDays(new Date(),1)
    const yesterdaystartDate= startOfDay(yesterday)
    const yesterdayendDate=endOfDay(yesterday)

    const pendingRequests= await ConnectionRequest.find({
        status:"interested",
        createdAt:{
            $gte:yesterdaystartDate,
            $lt:yesterdayendDate
        }
    }).populate("fromUserId toUserId")
 const listofEmails= [...new Set(pendingRequests.map(req=>req.toUserId.emailId))]
 console.log(listofEmails)
 

 for(const email of listofEmails){
    try{
        const res= await sendEmail.run("New Friend Request Pending for " + email , "There are so many friend Request pending . Please login to devtinder.guru . and accept pending friend Request ")
        console.log(res)
    }catch(err){
    console.log(err)
 }
 }

  }catch(err){
    console.log(err)
  }

})