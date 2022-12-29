const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  fullName: {
    required: true,
    type: String,
  },
  email: {
    required: [true, "Email is required"],
    type: String,
    unique: [true, "Email should be unique"],
  },
  password: {
    required: true,
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  userType: {
    required: [true, "User type is required (ADVERTISER / PUBLISHER)"],
    type: String,
    enum: ["ADVERTISER", "PUBLISHER"],
    // default: 'NEW'
  },
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  countryOfResidency: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  firstName: {
    type: String,
    default: null,
  },
  representCompany: {
    type: Boolean,
    default: null,
  },
  companyName: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  companyId: {
    type: String,
    default: null,
  },
  bankTransfer: {
    type: Boolean,
    default: null,
  },
  cryptoCurrency: {
    type: Boolean,
    default: null,
  },
  tokenType: {
    type: String,
    default: null,
  },
  walletAddress: {
    type: String,
    default: null,
  },
  accNo:{
    type:Number,
    required: true,


  },
  swiftCode:{
    type:String,
    required: true,

  },
  bankName:{
    type:String,
    required: true,

  },
  accountNo:{
    type:String,
    required: true,

  },
  image:{
    type:String
  },
  jwtToken: String,
});

module.exports = mongoose.model("User", dataSchema);
