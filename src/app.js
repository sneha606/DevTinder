require("dotenv").config();

const express = require("express");
const connectDB = require("./config/database");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");

const cookieparser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ✅ CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ✅ 🔥 VERY IMPORTANT: webhook RAW body FIRST
app.use(
  "/payment/verify",
  express.raw({ type: "application/json" })
);

// ✅ baaki routes ke liye JSON parser
app.use(express.json());

app.use(cookieparser());

// ✅ routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

require("./utils/cronjob");

// ✅ DB connect
connectDB()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(err.message);
  });


  