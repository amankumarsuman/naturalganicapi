const express = require("express");
const Users = require("../models/Users");
var bodyParser = require("body-parser");
// const mail = require("../Middleware/MailSetup");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const saltRounds = 10;
var jwt = require("jsonwebtoken");
const uuid = require("uuid");
const JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;
const speakeasy = require("speakeasy");
const UserOtpVerification=require("../models/emailVerification")
// const sendMail = require("../Middleware/MailSetup");
const {
  checkSessionsOrGenerateNew,
  emailFormat,
  signUpValidations,
  siginInValidations,
  checkSession,
  matchToken,
} = require("../Middleware/Authentication");
const { sendMail, ForgetPasswordMail } = require("../Middleware/MailSetup");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
const getHashPass = async (pass) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(pass, salt);
  return hash;
};


var db = new JsonDB(new Config("myDataBase", true, false, '/'));


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

//Post Method
router.post("/sign-up", emailFormat,signUpValidations, async (req, res) => {
  // const id = uuid.v4();
 
  const token = await generateJWt({
    email: req.body.email,
    userType: req.body.userType,
  });
//  const path = `/user/${_id}`;
const temp_secret = speakeasy.generateSecret();

  const data = new Users({
    fullName: req.body.fullName,
    email: req.body.email,
    password: await getHashPass(req.body.password),
    userType: req.body.userType,
    jwtToken: token,
    emailVerified: false,
    // path,
    secret:temp_secret
  });

  try {
    const dataToSave = await data.save().then((result)=>{
      sendOtpVerificationEmail(result,res, temp_secret.base32)
      res.status(200).send({ success: true, data:result,secret: temp_secret.base32 });
    });

    // sendMail(dataToSave.email);
  } catch (error) {
    // console.log(error);
    if (error.message.match("email_1 dup key")) {
      res.status(400).send({
        success: false,
        message: "Already have an account from this email",
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.post("/login", siginInValidations, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (user == null)
      res
        .status(400)
        .send({ success: false, message: "User not found with this email" });

    const matchPass = await bcrypt.compareSync(password, user.password); // true
    if (!matchPass)
      res
        .status(401)
        .send({ success: false, message: "Incorrect email or password" });
    checkSessionsOrGenerateNew(user, res, next, (result) => {
      if (result == true) {
        res.status(200).send({
          success: true,
          user: {
            email: user.email,
            emailVerified: user.emailVerified,
            token: user.jwtToken,
            fullName: user.fullName,

            _id: user._id,
            userType: user.userType,
          },
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
});

// forgetPasswordMail
router.post("/forget-pass-confirmation", async (req, res) => {
  if (!req.body.email)
    res.status(400).send({ success: false, message: "Email is required" });
  const user = await Users.findOne({ email: req.body.email });
  ForgetPasswordMail(user);
});

router.post("/forget-pass", matchToken, async (req, res) => {
  console.log(req.user, "<<<<");
  const token = await generateJWt({
    email: req.user.email,
    userType: req.user.userType,
  });
  const updateUser = await Users.findByIdAndUpdate(
    req.user._id,
    { password: await getHashPass(req.body.password), jwtToken: token },
    { new: true }
  );
  console.log(updateUser, "<<<updated");
  res
    .status(200)
    .send({ success: true, message: "Password successfully updated" });
});

//Get all Method
router.get("/get-all", async (req, res) => {
  console.log(req.query);
  const users = await Users.find(req.query);
  res.status(200).send({ success: true, data: users });
});

// get user by token
router.post("/get-user-by-token", checkSession, async (req, res) => {
  console.log("here");
  // const { email } = req.decode;
  // console.log(req.decode.email);
  const user = await Users.findOne({ email: req.decode.email });
  console.log(user);
  if (!user)
    res.status(400).send({ success: false, message: "User doesn't exist!!" });
  res.status(200).send({
    success: true,
    message: "User details fetched successfully",
    user,
  });
});

//Get by ID Method
router.get("/getOne/:id", (req, res) => {
  res.send("Get by ID API");
});

//Update by ID Method
router.patch("/update/:id", async (req, res) => {
  console.log(req.body);
  const user = await Users.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res
    .status(200)
    .send({ success: true, message: "User Successfully updated", user });
});

//Delete by ID Method
router.delete("/delete/:id", async (req, res) => {
  const user = await Users.findByIdAndDelete(req.params.id);

  res.send({ success: true, data: user, message: "User Deleted" });
});
router.post("/register", (req, res) => {
  const id = uuid.v4();
  try {
    const path = `/user/${id}`;
    // Create temporary secret until it it verified
    const temp_secret = speakeasy.generateSecret();
    // Create user in the database
    db.push(path, { id, temp_secret });
    // Send user id and base32 key to user
    res.json({ id, secret: temp_secret.base32 })
  } catch(e) {
    console.log(e);
    res.status(500).json({ message: 'Error generating secret key'})
  }
})


router.post("/verify", (req,res) => {
  const { userId, token } = req.body;
  try {
    // Retrieve user from database
    const path = `/user/${userId}`;
    const user = db.getData(path);
    console.log({ user })
    const { base32: secret } = user.temp_secret;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    });
    if (verified) {
      // Update user data
      db.push(path, { id: userId, secret: user.temp_secret });
      res.json({ verified: true })
    } else {
      res.json({ verified: false})
    }
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user'})
  };
})

router.post("/api/validate", (req,res) => {
  const { userId, token } = req.body;
  try {
    // Retrieve user from database
    const path = `/user/${userId}`;
    const user = db.getData(path);
    console.log({ user })
    const { base32: secret } = user.secret;
    // Returns true if the token matches
    const tokenValidates = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1
    });
    if (tokenValidates) {
      res.json({ validated: true })
    } else {
      res.json({ validated: false})
    }
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user'})
  };
})

//send otp verification email

const sendOtpVerificationEmail=async({_id,email},res)=>{
  try {
    const otp=`${Math.floor(1000+Math.random()*9000)}`;

    //mail option

    const mailOption={
      from: "amankumar.dev98@gmail.com",
			to: email,
			subject: "Verify Your Email",
			html:`<p>Enter <b>${otp} </b> in the App to verify your email address</p>
      <p>This code <b>expires in 1 hour</b>.</p>
      `
    };

    //hash the otp
    // const saltRounds=10;
   const hashedOtp= await bcrypt.hash(otp,saltRounds);
   const newOtpVerification=await new UserOtpVerification({
    userId:_id,
    otp:hashedOtp,
    createdAt:Date.now(),
    expiresAt:Date.now()+3600000,
   });

   //save otp records to database
   await newOtpVerification.save()

   const transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    // service: process.env.SERVICE,
          service:"gmail",
    port: 587,
    secure: true,
    auth: {
      user: "amankumar.dev98@gmail.com", // generated ethereal user
    pass: "rkghkhglilxqwsux", // generated ethereal password
    },
  });
  await transporter.sendMail(mailOption);
  // res.json({
  //   status:"Pending",
  //   message:"Verification otp sent to the email",
  //   data:{
  //     userId:_id,
  //     email,
  //   },
  // });
  } catch (error) {
    res.json({
      status:"Failed",
      message:error.message,
    });
  }
}

//verify email with otp

router.post("/verifyOtp",async (req,res)=>{
  try {
    let {userId,otp}=req.body;
    if(!userId || !otp){
      throw Error("Empty otp details are not allowed, Enter otp and userid");

    }else{
      const UserOtpVerificationRecords=await UserOtpVerification.find({
        userId,
      });
      if(UserOtpVerificationRecords.length<=0){
        throw new Error("Account record doesn't exist or has been verified already. Please signup again or enter correct details")
      }else{

        //user otp exists

        const {expiresAt} = UserOtpVerificationRecords[0];
        const hashedOtp=UserOtpVerificationRecords[0].otp;

        if(expiresAt<Date.now()){

          //user otp records expired
          await UserOtpVerification.deleteMany({userId});
          throw new Error("Code has Expired.Please Request again.");
        }else{
         const validOtp=await bcrypt.compare(otp,hashedOtp);
         if(!validOtp){
          //entered otp is wrong
          throw new Error("Invalid OTP Entered.check you inbox again");
         }else{
          //success

          await Users.updateOne({_id:userId},{emailVerified:true});
          await UserOtpVerification.deleteMany({userId});
          res.json({
            status:"Verified",
            message:`User email verified successfully.`,
          })
         }
        }
      }
    }
  } catch (error) {
    res.json({
      status:"Failed",
      message:error.message,
    })
  }

  //resend verification otp

  router.post("/resendOtpVerification",async(req,res)=>
  {
  try{
    let {userId,email}=req.body;

    if(!userId || !email){
      throw Error("Empty user Details not allowed, either userId or email is not entered");

    }else{

      //delete existing records and resend it 

      await UserOtpVerification.deleteMany({userId});
      sendOtpVerificationEmail({_id:userId,email},res);
    }
  }catch (error){
res.json({
  status:"Failed",
  message:error.message,
})
  }
  })
})
module.exports = router;
// module.exports = generateJWt;
