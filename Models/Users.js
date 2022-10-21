const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  fullName: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
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
    required: true,
    type: String,
    enum: ["ADVERTISER", "PUBLISHER"],
    // default: 'NEW'
  },
  jwtToken: String,
});

module.exports = mongoose.model("User", dataSchema);
