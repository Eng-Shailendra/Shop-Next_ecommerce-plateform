import express from "express";
import cors from "cors"
import userRouter from "./routers/auth-router.js";
import productRouter from "./routers/product-router.js"
import orderRouter from "./routers/order-router.js"
import paymentRouter from "./routers/payment-route.js"
import analyticsRouter from "./routers/analytics-router.js"
import cookieParser from "cookie-parser";

import v2ProductRouter from "./routers/v2/product-router.js";

const app = express();




//! middileware  
app.use(cors({
    origin: process.env.FRONTEND_PATH_URL,
    credentials: true
}))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/v1/api", userRouter);
app.use("/v1/api/product", productRouter);
app.use("/v1/api/order", orderRouter);
app.use("/v1/api/payment", paymentRouter);
app.use("/v1/api/analytics", analyticsRouter);

app.use("/v2/api/product", v2ProductRouter);

export default app