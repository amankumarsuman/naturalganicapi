const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: { type: String },
  desc:{type:String},
  amount:{type:Number},
  
});

module.exports = mongoose.model("Order", orderSchema);
