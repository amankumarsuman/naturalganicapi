const mongoose = require("mongoose");

const handpickedSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String },
  desc: { type: String },
  date: { type: String },

  image: { type: String },
});

module.exports = mongoose.model("Handpicked", handpickedSchema);
