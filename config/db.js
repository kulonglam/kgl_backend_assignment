const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.DATABASE_URI;
    await mongoose.connect(uri);
    console.log("Database connected successfully");

  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
