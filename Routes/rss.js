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

const Rss = require("../models/rss");

router.get("/", (req, res) => {
  // if(req.header('token')==="koinpratodayqproductrsstoken"){

    Rss.find()
    .select("link  _id ")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        rssData: docs.map((doc) => {
          return {
            link: doc.link,
           
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/rss/",
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

router.post("/addRss", (req, res) => {
  const rss = new Rss({
    _id: new mongoose.Types.ObjectId(),
    link: req.body.link,
    
  });
  rss
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: " Rss Created successfully",
        rssData: {
          link: result.link,
        
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
  Rss.findById(id)
    .select("link  _id ")
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
router.get("/:category",requireAuth, (req, res) => {
  const category = req.params.category;
  Rss.find(category).then((doc)=>{
    console.log(doc)
  })
  // Rss.findById(category)
  //   .select("link  _id ")
  //   .exec()
  //   .then((doc) => {
  //     console.log("From database", doc);
  //     if (doc) {
  //       res.status(200).json({
  //         rssLink: doc,
  //         request: {
  //           type: "GET",
  //           url: "",
  //         },
  //       });
  //     } else {
  //       res
  //         .status(404)
  //         .json({ message: "No valid entry found for provided ID" });
  //     }
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.status(500).json({ error: err });
  //   });

  // const filteredCategory = data.filter(user => {
  //   let isValid = true;
  //   for (key in filters) {
  //     console.log(key, user[key], filters[key]);
  //     isValid = isValid && user[key] == filters[key];
  //   }
  //   return isValid;
  // });
  // res.send(filteredCategory);
});
  


// });

//Delete by ID Method
router.delete("/delete/:id", async (req, res) => {
    const rss = await Rss.findByIdAndDelete(req.params.id);
  
    res.send({ success: true, data: rss, message: "Rss Deleted Successfully" });
  });

module.exports = router;
