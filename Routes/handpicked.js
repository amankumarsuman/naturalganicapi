const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

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

router.get("/", (req, res, next) => {
  Handpicked.find()
    .select("title desc date _id image")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        handpickedData: docs.map((doc) => {
          return {
            title: doc.name,
            date: doc.date,
            image: doc.image,
            desc: doc.desc,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/handpicked/" + doc._id,
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

router.post("/addHandpicked", upload.single("image"), (req, res, next) => {
  const handpicked = new Handpicked({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    desc: req.body.desc,
    date: req.body.date,
    image: req.file.path,
  });
  handpicked
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: " Handpicked Created successfully",
        handpickedData: {
          title: result.title,
          desc: result.desc,
          date: result.date,
          image: result.image,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/api/handpicked/" + result._id,
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
  Handpicked.findById(id)
    .select("title date desc _id image")
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
