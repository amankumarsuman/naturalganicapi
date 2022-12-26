const { OAuth2Client } = require("google-auth-library");
const express = require("express");
const Users = require("../Models/Users");
var bodyParser = require("body-parser");
// const mail = require("../Middleware/MailSetup");
const googleConfig = require("../Middleware/googleConfig.json");

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

const { client_id } = googleConfig.web;
const client = new OAuth2Client(client_id);

router.post("/auth", async (req, res) => {
  const { token, userType } = req.body;
  console.log(token, "<<<token");
  const ticket = await client.verifyIdToken({
    idToken: token,

    audience: client_id,
  });
  const googleProvided = ticket.getPayload();

  //   {
  //     iss: 'accounts.google.com',
  //     azp: '990734078330-qteq6i15s9cni5apfkt9qv2okudhqk93.apps.googleusercontent.com',
  //     aud: '990734078330-qteq6i15s9cni5apfkt9qv2okudhqk93.apps.googleusercontent.com',
  //     sub: '110467460121602445975',
  //     email: 'lakheraakshay@gmail.com',
  //     email_verified: true,
  //     at_hash: 'uAse4oB04pAsxKUIsue5lg',
  //     name: 'Akshay lakhera',
  //     picture: 'https://lh3.googleusercontent.com/a/ALm5wu24Ybmxwvp2NIbVRIq-ccACnvKeUFS1kcBXQl-hvA=s96-c',
  //     given_name: 'Akshay',
  //     family_name: 'lakhera',
  //     locale: 'en',
  //     iat: 1666727206,
  //     exp: 1666730806,
  //     jti: 'a6840692abafb0ffc183dcf334eeaedb7296c246'
  //   }
  //   const { name, email, picture } = ticket.getPayload();
  const data = new Users({
    fullName: googleProvided?.name,
    email: googleProvided?.email,
    password: token,
    userType: req.body?.userType,
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

module.exports = router;

// this is google button for frontend react
// npm i react-google-login
// We can render the component in our app like:

// <GoogleLogin
//     clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
//     buttonText="Log in with Google"
//     onSuccess={handleLogin}
//     onFailure={handleLogin}
//     cookiePolicy={'single_host_origin'}
// />
