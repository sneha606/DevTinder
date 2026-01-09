const express=require("express")

const app=express()
app.use( "/test",(req,res)=>{
    res.send("hello from the  test server")
})
app.use("/blog",(req,res)=>{
    res.send("hello from the blog server")
})
app.use("/",(req,res)=>{
    res.send("hello from the server")
})

app.listen(3000,()=>{
    console.log("Server is sucessfully listening from port ")
})