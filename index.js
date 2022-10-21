require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

var bodyParser = require("body-parser");
const { route } = require("./Routes/User");
const Stripe = require("./Middleware/Stripe");
const userRoute = require("./Routes/User");
const mongoString = process.env.mongoUri;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});
const app = express();
app.use(express.json({ limit: "50mb" }));

var cors = require("cors");
app.use(cors({ origin: true, credentials: true }));

// Put these statements before you define any routes.
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  console.log(req._parsedUrl.path, "----<<<<<<<<<<<Current ");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// --------------

app.use("/api/user", userRoute);
app.use("/api/stripe", Stripe);
app.listen(5000, () => {
  console.log(`Server Started at ${5000}`);
});
