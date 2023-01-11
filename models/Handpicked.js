const mongoose = require("mongoose");

const handpickedSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String },
  news1: { type: String },
  news2: { type: String },
  news3: { type: String },
  news4: { type: String },
  news5: { type: String },
  date: { type: String },
  lastUpdated: { type: String },
  email:{type:String},

  image: { type: String },
  news1Link:String,
  news2Link:String,
  news3Link:String,
  news4Link:String,
  news5Link:String,
});

module.exports = mongoose.model("Handpicked", handpickedSchema);
