
require('dotenv').config();
const mongoose = require("mongoose");

const url = process.env.MONGO_URI;

mongoose.connect

const connectDB = async () => {
  try {
    console.log("connecting DB")
    await mongoose.connect(url, {
      
    });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed", error);
  }
};

module.exports = connectDB;
