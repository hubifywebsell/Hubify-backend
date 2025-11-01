import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";
import orderRouter from "./routes/orderRouter.js";

dotenv.config();

const app = express();

// ✅ Load allowed origins from .env
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked CORS request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies/headers
  })
);

app.use(express.json());

// ✅ JWT middleware
app.use((req, res, next) => {
  let token = req.header("Authorization");

  if (token) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid token, please login again",
        });
      }
      req.user = decoded;
      next();
    });
  } else {
    next();
  }
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database connected successfully"))
  .catch(() => console.log("❌ Database connection failed"));

// ✅ Routes
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
