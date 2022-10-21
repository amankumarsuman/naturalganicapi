const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIEL_ID,
    pass: process.env.PASSWORD,
  },
});

let mailDetails = {
  from: process.env.MAIEL_ID,
  to: "lakheraakshay1@gmail.com",
  subject: "Vefiy your account",
  //   text: "Node.js testing mail for GeeksforGeeks",
  html: "<div style='color:white;display:flex;justify-content:center;width:100%'> <button style='width:300px;padding:10px'>Verify Your account</button></div>",
};

const sendMail = (email) => {
  mailTransporter.sendMail(
    {
      ...mailDetails,
      to: email,
    },
    function (err, data) {
      if (err) {
        console.log("Error Occurs", err);
      } else {
        console.log("Email sent successfully");
      }
    }
  );
};

module.exports = sendMail;
