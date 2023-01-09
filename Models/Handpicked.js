const mongoose = require("mongoose");

const handpickedSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String },
  desc1: { type: String },
  desc2: { type: String },
  desc3: { type: String },
  desc4: { type: String },
  desc5: { type: String },
  date: { type: String },
  lastUpdated: { type: String },

  image: { type: String },
});

module.exports = mongoose.model("Handpicked", handpickedSchema);
