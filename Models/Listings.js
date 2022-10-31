const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  websiteLink: String,
  offerTitle: String,
  listingCategory: String,
  logo: String,
  websiteLanguage: String,
  noFollowLinkAllowed: { type: Boolean, default: true },
  doFollowLinkAllowed: { type: Boolean, default: true },
  indexedArticle: { type: String },
  customField: { type: Object },
  linkedin: { type: String },
  googleNews: { type: String },
  socialShare: { type: String },
  facebook: { type: String },
  price: { type: Number, default: 0 },
  twitter: { type: String },
});

module.exports = mongoose.model("Listings", dataSchema);
