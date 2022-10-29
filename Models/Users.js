const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  fullName: {
    required: true,
    type: String,
  },
  email: {
    required: [true, "Email is required"],
    type: String,
    unique: [true, "Email should be unique"],
  },
  password: {
    required: true,
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  userType: {
    required: [true, "User type is required (ADVERTISER / PUBLISHER)"],
    type: String,
    enum: ["ADVERTISER", "PUBLISHER"],
    // default: 'NEW'
  },
  jwtToken: String,
});

module.exports = mongoose.model("User", dataSchema);
