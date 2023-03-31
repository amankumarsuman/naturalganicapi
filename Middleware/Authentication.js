const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const Users = require("../models/Users");

// const SplitBearer = (req) => {
//   return req.headers.Authorization.split(" ")[1];
// };

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

// this is for login if session is expired and password and email are correct then it will generate new token
const checkSessionsOrGenerateNew = async (user, res, next, callBack) => {
  // const token = SplitBearer(req);
  console.log(user.jwtToken);
  try {
    const decode = jwt.verify(user.jwtToken, process.env.JWT_SECRET);

    console.log(decode, "<<<jwt");
    callBack(true);

    // next();
  } catch (e) {
    console.log(e, "<<<error");
    const updateToken = await Users.findByIdAndUpdate(
      user._id,
      {
        jwtToken: generateJWt({ email: user.email, userType: user.userType }),
      },
      { new: true }
    );
    console.log("updating user", updateToken);

    res.status(401).send({
      success: false,
      message: "Creating New Token, Please login",
      updateToken,
    });
  }
};

// this only check session
const checkSession = async (req, res, next) => {
  console.log(req.headers);
  // console.log("checking session",SplitBearer(req));
  // Header names in Express are auto-converted to lowercase
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  console.log("token", token);
  // Remove Bearer from string
  token = token.replace(/^Bearer\s+/, "");

  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      console.log("error ", err);
      res.status(401).send({ success: false, message: "Session Expired !!!" });
    } else {
      console.log(decode);
      req.decode = decode;
      next();
    }
  });
};

// match tokens
const matchToken = async (req, res, next) => {
  if (!req.body.password) {
    res.status(400).send({ success: false, message: "Password is required" });
  }
  if (!req.body.confirmPassword) {
    res
      .status(400)
      .send({ success: false, message: "Confirm Password is required" });
  }
  if (req.body.password != req.body.confirmPassword) {
    res.status(400).send({
      success: false,
      message: "Password and Confirm Password should be same",
    });
  }
  if (!req.query._id) {
    res
      .status(400)
      .send({ success: false, message: "Query field _id is required." });
  }
  if (!req.query.token) {
    res.status(400).send({
      success: false,
      message: "Query field token is required",
    });
  }
  const user = await Users.findById(req.query._id);

  const sendFromFrontend = req.query.token;
  // console.log(req.params.id, user, sendFromFrontend);
  if (sendFromFrontend == user.jwtToken) {
    req.user = user;
    next();
  } else {
    res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
};

//  it check session and role both

const verifyRole = async (req, res, next) => {
  console.log("verify");
  console.log(req.body, "req");
  if (!req.body.email) {
    res.status(400).send({ success: false, message: "Email is required" });
  }
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    // Remove Bearer from string
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ success: false, message: "Unauthorized !!!" });
      } else {
        if (
          req.body.email == decode.email &&
          req.body.userType == decode.userType
        ) {
          console.log(decode, "<<<jwt");
          next();
        } else {
          res.status(401).send({ success: false, message: "Unauthorized !!!" });
        }
      }
    });
  } catch (e) {
    console.log(e, "<<<error");
    res.status(401).send({ success: false, message: "Unauthorized !!!" });
  }
};

//  email regex
const emailFormat = async (req, res, next) => {
  var emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  const isCorrectEmailFormat = emailRegex.test(req.body.email);

  var passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const checkPasswordValidation = passwordRegex.test(req.body.password);
  if (!isCorrectEmailFormat) {
    res
      .status(400)
      .send({ success: false, message: "Enter correct email address." });
  } else if (!checkPasswordValidation) {
    res.status(400).send({
      success: false,
      message:
        "Password must have atlease 1 Uppercase, 1 lowercase, 1 Special Character, and length shouuld be greater than 8",
    });
  } else {
    next();
  }
};

// signup validation of all fields
const signUpValidations = async (req, res, next) => {
  if (!req.body.confirmPassword)
    res
      .status(400)
      .send({ success: false, message: "Confirm Password is required" });
  if (!req.body.password)
    res.status(400).send({ success: false, message: "Password is required" });
  if (req.body.password != req.body.confirmPassword)
    res.status(400).send({
      success: false,
      message: "Password and Confirm Password dosen't match.",
    });
  next();
};

// sign in validations
const siginInValidations = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email)
    res.status(400).send({ success: false, message: "Email is required" });
  else if (!password)
    res.status(400).send({ success: false, message: "Password is required" });
  else next();
};

const requireAuth = (req, res, next) => {
  const token = req.header("token");
  console.log(token, "token");
  // next()
  // check json web token exists &  is verified
  if (token === "koinpratodayqproductrsstoken") {
    console.log("verified");
    // res.status(200).send({ success: true, message: "Added Handpicked Successfully" });

    next();
  } else {
    res.status(401).send({ success: false, message: "Unauthorized !!!" });
    // console.log("not verified user")
  }
  // try {
  //   jwt.verify(SplitBearer(req), process.env.JWT_SECRET, (err, decode) => {
  //     if (err) {
  //       res.status(401).send({ success: false, message: "Unauthorized !!!" });
  //     // } else {
  //     //   if (
  //     //     req.body.email == decode.email &&
  //     //     req.body.userType == decode.userType
  //     //   ) {
  //     //     console.log(decode, "<<<jwt");
  //     //     next();
  //     //   } else {
  //     //     res.status(401).send({ success: false, message: "Unauthorized !!!" });
  //     //   }
  //     }else{
  //       console.log(decode, "<<<jwt");
  //       next()
  //     }
  //   });
  // } catch (e) {
  //   console.log(e, "<<<error");
  //   res.status(401).send({ success: false, message: "Unauthorized !!!" });
  // }
};

const verifyRoleListing = async (req, res, next) => {
  // const token = req.cookies.jwt;
  console.log(req.headers.authorization.split(" ")[1], "check token");
  console.log("verify");
  console.log(req.body, "reqauth");
  // next()
  if (!req.body.email) {
    res.status(400).send({ success: false, message: "Email is required" });
  }
  try {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET,
      (err, decode) => {
        if (err) {
          console.log(err, "error");
          res.status(401).send({ success: false, message: "Unauthorized !!!" });
        } else {
          if (req.body.email == decode.email) {
            console.log(decode, "<<<jwt");
            next();
          } else {
            res
              .status(401)
              .send({ success: false, message: "Unauthorized !!!" });
          }
        }
      }
    );
  } catch (e) {
    console.log(e, "<<<error");
    res.status(401).send({ success: false, message: "Unauthorized !!!" });
  }
};
module.exports = {
  verifyRole,
  checkSessionsOrGenerateNew,
  emailFormat,
  signUpValidations,
  matchToken,
  checkSession,
  siginInValidations,
  requireAuth,
  verifyRoleListing,
};
