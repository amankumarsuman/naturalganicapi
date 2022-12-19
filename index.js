require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
var bodyParser = require("body-parser");
const { route } = require("./Routes/User");
const Stripe = require("./Middleware/Stripe");
const Listing = require("./Routes/Listing");
const userRoute = require("./Routes/User");
const google = require("./Routes/google");
const handpickedRoutes = require("./Routes/handpicked");
const mongoString = process.env.mongoUri;
const googleConfig = require("./Middleware/googleConfig.json");
let Parser = require("rss-parser");
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//configuring rss parser package

let parser = new Parser({
  headers: { "User-Agent": "Chrome" },
});

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
// console.log(googleConfig.web, "<<<");

const bitcoinFeedUrl = "https://news.bitcoin.com/feed/";

async function fetchRssFeed(feedUrl) {
  let feed = await parser.parseURL(feedUrl);
  return feed.items.map((item) => {
    return {
      title: item.title,
      link: item.link,
      date: item.pubDate,
    };
  });
}

app.get("/api/getFeed", async (req, res) => {
  await fetchRssFeed(bitcoinFeedUrl)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        message: "No news found",
      });
    });
});

app.get("/api/ping", (req, res) => {
  var response = { answer: "pong" };
  res.status(200).json(response);
});
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use("/api/handpicked", handpickedRoutes);
app.use("/api/user", userRoute);
app.use("/api/stripe", Stripe);
app.use("/api/listing", Listing);
app.use("/api/google", google);
app.listen(5000, () => {
  console.log(`Server Started at ${5000}`);
});
