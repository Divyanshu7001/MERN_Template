import { Router } from "express";
import "dotenv/config";
import http from "http";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { dbConnection } from "./db/dbConnection.js";
import app from "./app.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";

import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = new Router();

router.get("/", (_, res) => {
  res.send("Hello from Backend");
});

app.use("/v1/api/user/", userRouter);
app.use("/v1/api/admin/", adminRouter);

app.listen(process.env.PORT, () => {
  console.log("Server is listening on PORT: ", process.env.PORT);
});

app.use(errorMiddleware);
dbConnection();
