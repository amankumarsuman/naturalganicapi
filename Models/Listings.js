const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  websiteLink: String,
  offerTitle: String,
  listingCategory: String,
  price: Number,
  logo: String,
  websiteLanguage: String,
  noFollowLinkAllowed: { type: Boolean, default: true },
  doFollowLinkAllowed: { type: Boolean, default: true },
  indexedArticle: { type: String },
  linkedin: { type: String },
  googleNews: { type: String },
  socialShare: { type: String },
  facebook: { type: String },
  twitter: { type: String },
});

module.exports = mongoose.model("Listings", dataSchema);
