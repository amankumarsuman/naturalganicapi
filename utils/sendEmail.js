const nodemailer = require("nodemailer");
module.exports = async (email, subject, text) => {
    let testAccount = await nodemailer.createTestAccount();
	try {
		const transporter = nodemailer.createTransport({
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

		let info=await transporter.sendMail({
			from: "amankumar.dev98@gmail.com",
			to: email,
			subject: subject,
			text: text,
		});
		console.log("email sent successfully");
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
};