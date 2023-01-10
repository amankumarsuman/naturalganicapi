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

const ScreenToggle = require("../models/Screen");

router.get("/", requireAuth, (req, res) => {
  // if(req.header('token')==="koinpratodayqproductrsstoken"){

  ScreenToggle.find()
    .select("link text showScreen _id ")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        showScreenData: docs.map((doc) => {
          return {
            link: doc.link,
            text: doc.text,
            showScreen: doc.showScreen,
           
            _id: doc._id,
            request: {
              type: "GET",
              url: "https://user.koinpr.com/api/showScreen",
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

router.post("/addShowScreenData",requireAuth, (req, res) => {
  const screenToggleData = new ScreenToggle({
    _id: new mongoose.Types.ObjectId(),
    link: req.body.link,
    text: req.body.text,
    showScreen: req.body.showScreen,
    
  });
  screenToggleData
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: " ShowScreen Data Created successfully",
        shoeScreenData: {
          link: result.link,
          text: result.text,
          showScreen: result.showScreen,
        
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


  


// });

//Delete by ID Method
router.delete("/delete/:id", async (req, res) => {
    const showScreen = await ScreenToggle.findByIdAndDelete(req.params.id);
  
    res.send({ success: true, data: showScreen, message: "showScreen data Deleted Successfully" });
  });

module.exports = router;
