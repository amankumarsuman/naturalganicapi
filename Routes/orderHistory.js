const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");



const OrderHistory = require("../models/orderHistory");

router.get("/", (req, res, next) => {
    OrderHistory.find()
    .select("desc amount date _id ")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        OrderList: docs.map((doc) => {
          return {
            date: doc.date,
           desc:doc.desc,
           amount:doc.amount,
            id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/order",
            },
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
});

router.post("/addOrder",  (req, res, next) => {
  const order = new OrderHistory({
    _id: new mongoose.Types.ObjectId(),
    desc: req.body.desc,
    date:req.body.date,
    amount:req.body.amount
    
  });
  order
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: " Order Created successfully",
        rssData: {
          date: result.date,
          desc: result.desc,
          amount: result.amount,
        
          _id: result._id,
          request: {
            type: "GET",
            
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  OrderHistory.findById(id)
    .select("desc amount date _id ")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          rssLink: doc,
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

//Delete by ID Method
router.delete("/delete/:id", async (req, res) => {
    const order = await OrderHistory.findByIdAndDelete(req.params.id);
  
    res.send({ success: true, data: order, message: `Order with id ${req.params.id} Deleted Successfully`});
  });

module.exports = router;
