import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: process.env.DBNAME,
    })
    .then(() => {
      console.log(`Server Connected to ${process.env.DBNAME} Database!!`);
    })
    .catch((error) => {
      console.log("Error While Connecting to Database: ", error);
    });
};
