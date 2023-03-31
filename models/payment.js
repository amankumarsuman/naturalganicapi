const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: { type: String },
  productName: { type: String },
  amount: { type: Number },
  orderId: { type: String },
  quantity: { type: Number },
  customerName: { type: String },
  address: { type: String },
  mobile: { type: Number },
});

module.exports = mongoose.model("Payment", paymentSchema);
