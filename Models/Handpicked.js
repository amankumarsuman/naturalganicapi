const mongoose = require("mongoose");

const handpickedSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String },
  desc: { type: Number },
  date: { type: Number },

  image: { type: String },
});

module.exports = mongoose.model("Handpicked", handpickedSchema);
