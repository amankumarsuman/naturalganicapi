// const express = require("express");
// const Users = require("../Models/Users");
// var bodyParser = require("body-parser");
// const multer = require("multer");

// // const mail = require("../Middleware/MailSetup");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// var jwt = require("jsonwebtoken");
// const sendMail = require("../Middleware/MailSetup");
// const { verifyRole } = require("../Middleware/Authentication");
// const Listings = require("../Models/Listings");
// const { default: mongoose } = require("mongoose");
// var urlencodedParser = bodyParser.urlencoded({ extended: false });
// var jsonParser = bodyParser.json();
// const getHashPass = async (pass) => {
//   const salt = await bcrypt.genSalt(saltRounds);
//   const hash = await bcrypt.hash(pass, salt);
//   return hash;
// };

// const generateJWt = (data) => {
//   console.log(data, "<<<<datasss");
//   const token = jwt.sign(
//     {
//       ...data,
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" }
//   );
//   return token;
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   fileFilter: fileFilter,
// });

// const router = express.Router();

// //  add listing
// // router.post("/add", upload.single("image"),  async (req, res) => {
// //   console.log(req.body)
// //   // console.log(req.file)
// //   const addList = new Listings({
// //     ...req.body,
// //     image: req.file.path,

// //   });
// //   const checkSave = await addList.save();
// //   res.status(200).send({ success: true, message: "Added", data: checkSave });
// // });
// //modified add listing

// router.post("/add", verifyRole, upload.single("image"), async (req, res) => {
//   const addList = new Listings({
//     userId: new mongoose.Types.ObjectId(),
//     websiteLink: req.body.websiteLink,
//     offerTitle: req.body.offerTitle,
//     listingCategory: req.body.listingCategory,
//     price: req.body.price,
//     websiteLanguage: req.body.websiteLanguage,
//     noFollowLinkAllowed: req.body.noFollowLinkAllowed,
//     doFollowLinkAllowed: req.body.doFollowLinkAllowed,
//     indexedArticle: req.body.indexedArticle,
//     linkedin: req.body.linkedin,
//     googleNews: req.body.googleNews,
//     socialShare: req.body.socialShare,
//     facebook: req.body.facebook,
//     twitter: req.body.twitter,
//     image: req.file.path,
//     email:req.body.email,

//   });
//   addList.save().then((res) => {
//     res.status(200).json({
//       success: true,
//       message: "List Added successfully",
//       data: res,
//     });
//   });
// });
// router.get("/get-all", async (req, res) => {
//   try {
//     console.log(req.query);

//     let filterQuery = { ...req.query };

//     if (req.query.userId) {
//       filterQuery = {
//         ...filterQuery,
//         userId: mongoose.Types.ObjectId(req.query.userId),
//       };
//     }

//     const data = await Listings.aggregate([
//       {
//         $match: filterQuery,
//       },
//       // { $match: req.query },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $unwind: "$user",
//       },
//       {
//         $project: {
//           _id: 1,
//           userId: 1,
//           websiteLink: 1,
//           offerTitle: 1,
//           listingCategory: 1,
//           logo: 1,
//           websiteLanguage: 1,
//           noFollowLinkAllowed: 1,
//           doFollowLinkAllowed: 1,
//           indexedArticle: 1,
//           linkedin: 1,
//           price: 1,
//           googleNews: 1,
//           socialShare: 1,
//           facebook: 1,
//           twitter: 1,
//           price:1,
//           image:1,
//           "user.fullName": 1,
//           "user.email": 1,
//           "user.userType": 1,
//         },
//       },
//       //   { $match: { userId: req.query.userId } },
//       //   {
//       //     $lookup: {
//       //       from: "Users",
//       //       localField: "userId",
//       //       foreignField: "_id",
//       //       as: "user",
//       //     },
//       //   },
//     ]);
//     // const data = await Listings.find(req.query)
//     //   .populate({
//     //     path: "userId",
//     //     select: "fullName email userType",
//     //   })

//     res.status(200).send({ success: true, message: "All Listing", data });
//   } catch (e) {
//     console.log(e);
//   }
// });

// // router.get("/:userId", (req, res, next) => {
// //   const id = req.params.userId;
// //   UserDetails.findById(id)
// //     .exec()
// //     .then((doc) => {
// //       console.log(doc);
// //       if (doc) {
// //         res.status(200).json(doc);
// //       } else {
// //         res.status.apply(404).json({ message: " no valid id matched" });
// //       }
// //     })
// //     .catch((err) => {
// //       console.log(err);
// //       res.status(500).json({ error: err });
// //     });
// // });

// router.delete("/delete/:id", async (req, res, next) => {
//   const deleted = await Listings.findByIdAndDelete(req.params.id);
//   res.status(200).send({ success: true, message: "Successfully Deleted" });
// });

// module.exports = router;
const express = require("express");
const Users = require("../models/Users");
var bodyParser = require("body-parser");
// const mail = require("../Middleware/MailSetup");
const upload = require("../common");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const sendMail = require("../Middleware/MailSetup");
const { verifyRole, requireAuth } = require("../Middleware/Authentication");
const Listings = require("../models/Listings");
const { default: mongoose } = require("mongoose");
const { uploadFile } = require("../s3");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);




var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
const getHashPass = async (pass) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(pass, salt);
  return hash;
};

const generateJWt = (data) => {
  console.log(data, "<<<<datasss");
  const token = jwt.sign(
    {
      ...data,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
};

const router = express.Router();

//  add listing
// upload.single("image"),
router.post("/add", requireAuth,upload.single("image"), async (req, res) => {
  //   const {}=req.body
  console.log(req.body)
  // console.log(req.file);
  // uploading to AWS S3
  // const result = await uploadFile(req.file);  // Calling above function in s3.js
  // console.log("S3 response", result);
  // You may apply filter, resize image before sending to client
  // Deleting from local if uploaded in S3 bucket
  // await unlinkFile(req.file.path);
  const addList = new Listings({
    ...req.body,
    // image:req.file.path,
  });
  const checkSave = await addList.save();
  res.status(200).send({ success: true, message: "Added", data: checkSave });
});

router.get("/",requireAuth, (req, res) => {
  const date = new Date();
  Listings.find()
    .select("offerTitle listingCategory price image  specialPrice desc   _id ")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        productData: docs.map((doc) => {

          
          return {

            offerTitle: doc.offerTitle,
            listingCategory: doc.listingCategory,
            price: doc.price,
            specialPrice: doc.specialPrice,
            desc: doc.desc,
            image: doc.image,
            // news:[{news:doc.news1,link:doc.news1Link},{news:doc.news2,link:doc.news2Link},{news:doc.news3,link:doc.news3Link},{news:doc.news4,link:doc.news4Link},{news:doc.news5,link:doc.news5Link}],
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
router.get("/get-all",requireAuth, async (req, res) => {
  try {
    console.log(req.query);

    let filterQuery = { ...req.query };

    if (req.query.userId) {
      filterQuery = {
        ...filterQuery,
        userId: mongoose.Types.ObjectId(req.query.userId),
      };
    }

    const data = await Listings.aggregate([
      {
        $match: filterQuery,
      },
      // { $match: req.query },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          // websiteLink: 1,
          offerTitle: 1,
          listingCategory: 1,
          // image: 1,
          // websiteLanguage: 1,
          // noFollowLinkAllowed: 1,
          // doFollowLinkAllowed: 1,
          // indexedArticle: 1,
          // linkedin: 1,
          // googleNews: 1,
          // socialShare: 1,
          // facebook: 1,
          // twitter: 1,
          price:1,
          image:1,
          specialPrice:1,
          desc:1,
          // "user.fullName": 1,
          // "user.email": 1,
          // "user.userType": 1,
        },
      },
      //   { $match: { userId: req.query.userId } },
      //   {
      //     $lookup: {
      //       from: "Users",
      //       localField: "userId",
      //       foreignField: "_id",
      //       as: "user",
      //     },
      //   },
    ]);
    // const data = await Listings.find(req.query)
    //   .populate({
    //     path: "userId",
    //     select: "fullName email userType",
    //   })

    res.status(200).send({ success: true, message: "All Listing", data });
  } catch (e) {
    console.log(e);
  }
});

router.delete("/delete/:id", async (req, res, next) => {
  const deleted = await Listings.findByIdAndDelete(req.params.id);
  res.status(200).send({ success: true, message: "Successfully Deleted" });
});

module.exports = router;
