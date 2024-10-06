import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import morgan from "morgan";

const app = new express();

app.use(morgan("combined"));
app.use(
  cors({
    origin: [process.env.FRONTEND_URI],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "20kb" }));
app.use(bodyParser.urlencoded({ extended: true }));


export default app;
