const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { requireAuth } = require("../Middleware/Authentication");
require("dotenv").config();
const shortid = require("shortid");
const Razorpay = require("razorpay");
const crypto = require("crypto");

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

router.post("/verifyPayment", async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.order_id === orderId && payment.status === "captured") {
      // payment is successful, update the order status in your database
      // and send a response to the frontend
      res.json({ success: true });
    } else {
      // payment verification failed, send a response to the frontend
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});

// configure webhook endpoint
router.post("/webhook", (req, res) => {
  // verify the webhook signature
  const { razorpay_signature, ...payload } = req.body;
  const hmac = crypto.createHmac("sha256", "rzp_test_neDr28vZagHxf1Alkaaman");
  hmac.update(JSON.stringify(payload));
  const generatedSignature = hmac.digest("hex");
  if (generatedSignature !== razorpay_signature) {
    console.error("Invalid webhook signature");
    return res.sendStatus(400);
  }

  // handle the webhook event
  const event = req.body.event;
  switch (event) {
    case "payment.captured":
      const paymentId = req.body.payload.payment.entity.id;
      // retrieve the payment details from Razorpay API
      //   const razorpay = new Razorpay({
      //     key_id: "YOUR_RAZORPAY_KEY_ID",
      //     key_secret: "YOUR_RAZORPAY_KEY_SECRET",
      //   });
      razorpay.payments
        .fetch(paymentId)
        .then((payment) => {
          // handle the successful payment
          console.log("Payment successful:", payment);
          // send a response to Razorpay indicating the webhook event was handled successfully
          res.sendStatus(200);
        })
        .catch((error) => {
          console.error("Error fetching payment details:", error);
          res.sendStatus(500);
        });
      break;
    case "payment.failed":
      // handle the failed payment
      console.log("Payment failed:", req.body.payload.payment.entity);
      // send a response to Razorpay indicating the webhook event was handled successfully
      res.sendStatus(200);
      break;
    default:
      // handle other webhook events
      console.log("Unhandled webhook event:", event);
      // send a response to Razorpay indicating the webhook event was handled successfully
      res.sendStatus(200);
      break;
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
