const mongoose = require("mongoose");

const straightFromTheWorldSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  link: { type: String },
  title: { type: String },
  date: { type: String },
  content: { type: String },
  category: { type: Array },
  creator: { type: String },
  summary: { type: String },
  contentSnippet: { type: String },
//   enclosure: { type: Image },
  id: { type: String },
  
  
  
});

module.exports = mongoose.model("StraightFromTheWorld", straightFromTheWorldSchema);
