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

import cors from "cors";

app.use(
  cors({
    origin: [
      "https://hubify-origin-frontend-pl16.vercel.app", // ✅ your frontend domain
      "http://localhost:5173", // ✅ optional for local testing
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // ✅ if you send cookies or tokens
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
