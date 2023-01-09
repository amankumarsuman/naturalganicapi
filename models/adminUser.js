const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
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
 
  image:{
    type:String
  },
  jwtToken: String,
});

module.exports = mongoose.model("AdminUser", adminSchema);
