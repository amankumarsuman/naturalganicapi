const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { verifyRole, verifyRoleListing, requireAuth } = require("../Middleware/Authentication");

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

const Handpicked = require("../models/Handpicked");

router.get("/",requireAuth, (req, res) => {
  const date = new Date();
  Handpicked.find()
    .select("title desc1 desc2 desc3 desc4 desc5 date _id image")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        handpickedData: docs.map((doc) => {
          return {
            title: doc.name,
            date: doc.date,
            image: doc.image,
            desc1: doc.desc1,
            desc2: doc.desc2,
            desc3: doc.desc3,
            desc4: doc.desc4,
            desc5: doc.desc5,
            lastUpdated:new Date(),
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/handpicked/",
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

router.post("/addHandpicked",verifyRoleListing,async(req, res) => {
  console.log(req.body,"req")
  const handpicked = new Handpicked({
    _id: new mongoose.Types.ObjectId(),
    // title: req.body.title,
    // desc1: req.body.desc1,
    // desc2: req.body.desc2,
    // desc3: req.body.desc3,
    // desc4: req.body.desc4,
    // desc5: req.body.desc5,
    // date: req.body.date,
    // image: req.file.path,
    // email:req.body.email,
    ...req.body,
    // email: req.decode.email
  });
  const checkSave = await handpicked.save();
  res.status(200).send({ success: true, message: "Added Handpicked Successfully", data: checkSave });
  // handpicked
  //   .save()
  //   .then((result) => {
  //     console.log(result);
  //     res.status(201).json({
  //       message: " Handpicked Created successfully",
  //       handpickedData: {
  //         title: result.title,
  //         desc: result.desc,
  //         date: result.date,
  //         image: result.image,
  //         _id: result._id,
  //         request: {
  //           type: "GET",
  //           url: "http://localhost:3000/api/handpicked/",
  //         },
  //       },
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.status(500).json({
  //       error: err,
  //     });
  //   });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Handpicked.findById(id)
    .select("title date desc1 desc2 desc3 desc4 desc5 _id image")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
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

module.exports = router;
