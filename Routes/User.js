const express = require("express");
const Users = require("../Models/Users");
var bodyParser = require("body-parser");
// const mail = require("../Middleware/MailSetup");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const sendMail = require("../Middleware/MailSetup");
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

//Post Method
router.post("/sign-up", async (req, res) => {
  const token = await generateJWt({
    email: req.body.email,
    userType: req.body.userType,
  });
  if (!req.body.password)
    res.status(400).send({ success: false, message: "Password is required" });
  const data = new Users({
    fullName: req.body.fullName,
    email: req.body.email,
    password: await getHashPass(req.body.password),
    userType: req.body.userType,
    jwtToken: token,
    emailVerified: false,
  });
  try {
    const dataToSave = await data.save();

    sendMail(dataToSave.email);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email)
      res.status(400).send({ success: false, message: "Email is required" });
    if (!password)
      res.status(400).send({ success: false, message: "Password is required" });
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
  } catch (e) {
    console.log(e);
  }
});

//Get all Method
router.get("/get-all", async (req, res) => {
  console.log(req.query);
  const users = await Users.find(req.query);
  res.status(200).send({ success: true, data: users });
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

module.exports = router;
