require("dotenv").config();
console.log(process.env.AWS_ACCESS_KEY);
console.log(process.env.AWS_SECRET_KEY);
const express = require("express");
const connectDB = require("./config/database");
const authRouter=require("./routes/auth")
const profileRouter=require("./routes/profile")
const requestRouter=require("./routes/request")



const app = express();

const cookieparser = require("cookie-parser");
const userRouter = require("./routes/user");
const cors = require("cors");
const paymentRouter = require("./routes/payment");



// for converting json code into js
app.use(cors({
  origin: "http://localhost:5173",
  credentials:true
}))
app.use(express.json());
app.use(
  "/payment/verify",
  express.raw({ type: "application/json" }) // webhook ke liye
);
app.use(cookieparser());

app.use("/", authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter)
app.use("/",paymentRouter)
require("./utils/cronjob")

connectDB()
  .then(() => {
    console.log("Database connected sucessfulyy");
    app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
  })
  .catch((err) => {
    console.error(err.message);
  });



  