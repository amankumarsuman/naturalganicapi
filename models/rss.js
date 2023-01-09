const mongoose = require("mongoose");

const rssSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  link: { type: String },
  
});

module.exports = mongoose.model("Rss", rssSchema);
