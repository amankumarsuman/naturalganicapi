require("dotenv").config();
const shortid = require("shortid");
const Razorpay = require("razorpay");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
var bodyParser = require("body-parser");
const passport = require("passport");
const { route } = require("./Routes/User");
// const Stripe = require("./Middleware/Stripe");
const Stripe = require("./Routes/Stripe");
const Listing = require("./Routes/Listing");
const userRoute = require("./Routes/User");
const orderRoute = require("./Routes/orderHistory");
// const google = require("./Routes/google");
const handpickedRoutes = require("./Routes/handpicked");
const adminUserRoutes = require("./Routes/adminUser");
var path = require("path");
const rssRoutes = require("./Routes/rss");
const straightFromTheWorldRoutes = require("./Routes/straightFromTheWorld");
const passwordResetRoutes = require("./Routes/PasswordReset");
const ShowScreenRoutes = require("./Routes/screen");
const withdrawRoutes = require("./Routes/withdraw");
const orderDetailsRoutes = require("./Routes/order");
const paymentRoute = require("./Routes/payment");

// const mongoString = process.env.mongoUri;
const googleConfig = require("./Middleware/googleConfig.json");
let Parser = require("rss-parser");
const mongoString =
  "mongodb+srv://expelee:expelee@cluster0.emvn8dw.mongodb.net/?retryWrites=true&w=majority";
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
const { default: axios } = require("axios");
const { requireAuth } = require("./Middleware/Authentication");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use('/uploads', express.static('uploads'));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
//configuring rss parser package
app.use(express.static(path.join(__dirname, "uploads")));
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

// const bitcoinFeedUrl = "https://news.todayq.com/feed/";
// var rssLink=[];

// console.log(rssLink)
async function fetchRssFeed(feedUrl) {
  // console.log(el)
  // rssLink.push(el.link))
  let feed = await parser.parseURL(feedUrl);
  return feed.items.map((item) => {
    // console.log(item)
    // if(item?.categories.includes(categoryParam)){
    //   return
    // }
    return {
      title: item.title,
      link: item.link,
      date: item.pubDate,
      content: item.content,
      category: item.categories,
      creator: item.creator,
      summary: item.summary,
      contentSnippet: item.contentSnippet,
      enclosure: item?.enclosure,
      id: item?.guid,

      //websitename
      //
    };
  });
}

/*******************Payment************** */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Serving company logo
app.get("/logo.png", (req, res) => {
  res.sendFile(path.join(__dirname, "logo.png"));
});

app.post("/razorpay", async (req, res) => {
  const payment_capture = 1;
  const { amount, currency } = req.body; // retrieve amount and currency from the request body
  console.log(amount, currency);

  const options = {
    amount: amount,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    // console.log(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
});

/*******************Payment************** */

// var linkarr=[]

// console.log(linkarr)
// console.log( link)
app.get("/api/getFeed", async (req, res) => {
  if (req.header("token") === "koinpratodayqproductrsstoken") {
    const responseArray = [];
    // console.log(link)
    // for(var i=0;i<link.length;i++){
    let link = await axios
      .get("http://localhost:5000/rss")
      .then((res) => res.data?.rssData);

    for (var i = 0; i < link?.length; i++) {
      await fetchRssFeed(link[i]?.link)
        .then((data) => {
          // res.status(200).json(data);
          responseArray.push(data);
        })
        .catch((err) => {
          res.status(500).json({
            status: "error",
            message: "No news found",
          });
        });
    }
    res.status(200).json(responseArray);
  } else {
    res.status(401).send({ success: false, message: "Unauthorized !!!" });
  }
});

app.get("/api/getFeedCategory", async (req, res) => {
  console.log(req.params);
  const categoryParam = req.query["category"];
  console.log(categoryParam, "cat");

  const responseArray = [];
  // console.log(link)
  // for(var i=0;i<link.length;i++){
  let link = await axios
    .get("http://localhost:5000/rss")
    .then((res) => res.data?.rssData);

  for (var i = 0; i < link?.length; i++) {
    await fetchRssFeed(link[i]?.link)
      .then((data) => {
        // res.status(200).json(data);
        responseArray.push(data);
      })

      .catch((err) => {
        res.status(500).json({
          status: "error",
          message: "No news found",
        });
      });
  }

  // var filteredData=  responseArray.filter((el)=>el.category?.includes(categoryParam.trim()))
  // console.log(filteredData,"filtered")
  const filteredArr = [];
  // console.log(responseArray.category,"res")
  for (var i = 0; i < responseArray.length; i++) {
    responseArray.map((el) => {
      console.log(el[i].category, "cataa");
      console.log(categoryParam);
      if (el[i].category.includes(categoryParam)) {
        filteredArr.push(el[i]);
        // console.log(el,"el")
      } else {
        return;
      }
    });
    //   var filteredData=  responseArray.filter((el)=>el[i].category?.includes(categoryParam.trim()))
    // console.log(filteredData)
  }
  // console.log(filteredArr,"filteredArr")

  //   const filteredUsers = responseArray.filter(el => {
  //   let isValid = true;
  //   for (key in categoryParam) {
  //     console.log(key, el[key], categoryParam[key]);
  //     isValid = isValid && el[key] == categoryParam[key];
  //   }
  //   return isValid;
  // });
  // console.log(filteredUsers)

  // res.send(filteredUsers);
  res.status(200).json(filteredArr);
  // }else{
  // res.status(401).send({ success: false, message: "Unauthorized !!!" });

  // }
});

app.get("/api/ping", (req, res) => {
  var response = { answer: "pong" };
  res.status(200).json(response);
});
app.use(morgan("dev"));
// app.use(passport.initialize());
// app.use(passport.session());
app.use("/uploads", express.static("uploads"));
app.use("/api/handpicked", handpickedRoutes);
app.use("/api/user", userRoute);
app.use("/api/stripe", Stripe);
app.use("/api/listing", Listing);
app.use("/api/orderDetails", orderDetailsRoutes);
app.use("/admin", adminUserRoutes);
app.use("/rss", rssRoutes);
app.use("/api/rssFeed", straightFromTheWorldRoutes);
app.use("/api/order", orderRoute);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/showScreen", ShowScreenRoutes);
app.use("/api/withdraw", withdrawRoutes);

app.use("/api/payment", paymentRoute);
app.listen(5000, () => {
  console.log(`Server Started at ${5000}`);
});
