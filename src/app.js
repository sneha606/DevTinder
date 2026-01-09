const express=require("express")

const app=express()

// app.use( "/test",(req,res)=>{
//     res.send("hello from the  test server")
// })

app.get( "/ab?c",(req,res)=>{
    res.send("hello from the  test server")
})


app.listen(3000,()=>{
    console.log("Server is sucessfully listening from port ")
})