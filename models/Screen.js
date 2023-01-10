const mongoose = require("mongoose");

const screenSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  link: { type: String },
  showScreen: { type: Boolean },
  text: { type: String },
 
  
  
  
});

module.exports = mongoose.model("ScreenToggle", screenSchema);
