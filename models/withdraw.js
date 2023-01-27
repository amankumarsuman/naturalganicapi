const mongoose = require("mongoose");

const withdrawSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  amount: { type: Number },
  method: { type: String },
//   amount: { type: Number },
  
});

module.exports = mongoose.model("WithdrawSchema", withdrawSchema);
