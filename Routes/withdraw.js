const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { requireAuth } = require("../Middleware/Authentication");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const Withdraw = require("../models/withdraw");

router.get("/", (req, res) => {
  // if(req.header('token')==="koinpratodayqproductrsstoken"){

  Withdraw.find()
    .select("amount method  _id ")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        withdrawData: docs.map((doc) => {
          return {
            amount: doc.amount,
            method: doc.method,
           
            _id: doc._id,
            request: {
              type: "GET",
              url: "https://user.koinpr.com/api/withdraw",
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
  // }
  // else{
  //   res.status(401).send({ success: false, message: "Unauthorized !!!" });

  // }
});

router.post("/addWithdrawRequest", (req, res) => {
  const withdraw = new Withdraw({
    _id: new mongoose.Types.ObjectId(),
    amount: req.body.amount,
    method: req.body.method,
    
  });
  withdraw
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: " Withdraw Request Created successfully",
        withdrawRequestData: {
          amount: result.amount,
          method: result.method,
        
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

router.get("/:id",requireAuth, (req, res) => {
  const id = req.params.id;
  Withdraw.findById(id)
    .select("amount method  _id ")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          withdrawData: doc,
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
    const withdraw = await Withdraw.findByIdAndDelete(req.params.id);
  
    res.send({ success: true, data: withdraw, message: "Withdraw request Deleted Successfully" });
  });

module.exports = router;
