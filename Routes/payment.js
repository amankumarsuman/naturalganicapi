const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { requireAuth } = require("../Middleware/Authentication");
require("dotenv").config();
const shortid = require("shortid");
const Razorpay = require("razorpay");
const Order = require("../models/payment");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get("/logo.png", (req, res) => {
  res.sendFile(path.join(__dirname, "logo.png"));
});
router.get("/", (req, res) => {
  // if(req.header('token')==="koinpratodayqproductrsstoken"){

  Order.find()
    .select(
      "amount productName date orderId quantity customerName address mobile   _id "
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        orderData: docs.map((doc) => {
          return {
            amount: doc.amount,
            date: doc.date,
            title: doc.title,
            userId: doc.userId,

            _id: doc._id,
            // request: {
            //   type: "GET",
            //   url: "https://user.koinpr.com/rss/",
            // },
          };
        }),
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
  // }
  // else{
  //   res.status(401).send({ success: false, message: "Unauthorized !!!" });

  // }
});

router.post("/addOrder", async (req, res) => {
  console.log(req?.body);
  const payment_capture = 1;
  const data = JSON.parse(Object.keys(req.body)[0]);
  console.log(data?.amount, data, "test");

  //   const order = new Order({
  //     _id: new mongoose.Types.ObjectId(),
  //     userId: req.body.id,
  //     amount: req.body.amount,
  //     date: Date.now(),
  //     currency: "INR",
  //     receipt: shortid.generate(),
  //     payment_capture,
  //     title: req.body.title,
  //   });
  const options = {
    amount: data?.amount * 100,
    currency: "INR",
    receipt: shortid.generate(),
    payment_capture,
  };
  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    // response.save().then((result) => {
    //   console.log(result);
    //   res.status(201).json({
    //     message: " order Created successfully",
    //     orderData: {
    //       userId: result?.userId,
    //       amount: result?.amount,
    //       date: result?.date,
    //       title: result?.title,

    //       _id: result?._id,
    //       request: {
    //         type: "GET",
    //       },
    //     },
    //   });
    // });
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", requireAuth, (req, res) => {
  const id = req.params.id;
  Order.findById(id)
    .select("amount date userId title  _id ")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          orderData: doc,
          request: {
            type: "GET",
            url: "",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
// router.get("/:category",requireAuth, (req, res) => {
//   const category = req.params.category;
//   Rss.find(category).then((doc)=>{
//     console.log(doc)
//   })
//   // Rss.findById(category)
//   //   .select("link  _id ")
//   //   .exec()
//   //   .then((doc) => {
//   //     console.log("From database", doc);
//   //     if (doc) {
//   //       res.status(200).json({
//   //         rssLink: doc,
//   //         request: {
//   //           type: "GET",
//   //           url: "",
//   //         },
//   //       });
//   //     } else {
//   //       res
//   //         .status(404)
//   //         .json({ message: "No valid entry found for provided ID" });
//   //     }
//   //   })
//   //   .catch((err) => {
//   //     console.log(err);
//   //     res.status(500).json({ error: err });
//   //   });

//   // const filteredCategory = data.filter(user => {
//   //   let isValid = true;
//   //   for (key in filters) {
//   //     console.log(key, user[key], filters[key]);
//   //     isValid = isValid && user[key] == filters[key];
//   //   }
//   //   return isValid;
//   // });
//   // res.send(filteredCategory);
// });

// });

//Delete by ID Method
router.delete("/delete/:id", async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  order.send({
    success: true,
    data: rss,
    message: "Order Deleted Successfully",
  });
});

module.exports = router;
