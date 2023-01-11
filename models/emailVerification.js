const mongoose = require("mongoose");
const UserOtpVerificationSchema = new mongoose.Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date,
  });
  
  module.exports = mongoose.model("UserOtpVerification", UserOtpVerificationSchema);