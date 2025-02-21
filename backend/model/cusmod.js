const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      // unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
    otpExpiration: 
    {
         type: Date
    },
    isVerified: {
      type: Boolean,
      default: false,
    }, // User verification status
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema); // Ensure this is exported
