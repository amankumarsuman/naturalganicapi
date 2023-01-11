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
    .select("title news1 news1Link news2  news2Link news3 news3Link news4 news4Link news5 news5Link date lastUpdated  _id image")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        handpickedData: docs.map((doc) => {

          const news1=doc.news1
          return {

            title: doc.title,
            date: doc.date,
            image: doc.image,
            news:[{news:doc.news1,link:doc.news1Link},{news:doc.news2,link:doc.news2Link},{news:doc.news3,link:doc.news3Link},{news:doc.news4,link:doc.news4Link},{news:doc.news5,link:doc.news5Link}],
            // newsLink:[doc.news1Link,doc.news2Link,doc.news3Link,doc.news4Link,doc.news5Link],
            // news1: doc.news1,
            // news1Link: doc.news1Link,
            // news2: doc.news2,
            // news2Link: doc.news2Link,
            // news3: doc.news3,
            // news3Link: doc.news3Link,
            // news4: doc.news4,
            // news4Link: doc.news4Link,
            // news5: doc.news5,
            // news5Link: doc.news5Link,
            // lastUpdated:new Date(),
            lastUpdated:doc.lastUpdated,
            // link:doc.link,
            _id: doc._id,
          
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

router.post("/addHandpicked",requireAuth,async(req, res) => {
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
            lastUpdated:new Date(),

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
  //           url: "https://user.koinpr.com/api/handpicked/",
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
    .select("title news1 news1Link news2  news2Link news3 news3Link news4 news4Link news5 news5Link date lastUpdated  _id image")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          handpickedData: doc,
        
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
  const handpicked = await Handpicked.findByIdAndDelete(req.params.id);

  res.send({ success: true, data: handpicked, message: "handpicked Deleted" });
});

module.exports = router;
