const mongoose = require("mongoose");

const naturalganicOrderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: { type: String },
  title: { type: String },
  amount: { type: Number },
  userId: { type: String },
  image: { type: String },
  quantity: { type: Number },
});

module.exports = mongoose.model(
  "NaturalganicOrderPlaced",
  naturalganicOrderSchema
);
