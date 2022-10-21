const express = require("express");
const router = express.Router();

var Publishable_Key = process.env.Publishable_Key;
var Secret_Key = process.env.Secret_Key;

var stripe = require("stripe")(Secret_Key);

router.post("/payment", function (req, res) {
  // Moreover you can take more details from user
  // like Address, Name, etc from form
  stripe.customers
    .create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
      name: "TEst Name",
      address: {
        line1: "TC 9/4 Old MES colony",
        postal_code: "452331",
        city: "Indore",
        state: "Madhya Pradesh",
        country: "India",
      },
    })
    .then((customer) => {
      return stripe.charges.create({
        amount: 1, // Charging Rs 25
        description: "Web Development Product",
        currency: "INR",
        customer: customer.id,
      });
    })
    .then((charge) => {
      res.send("Success"); // If no error occurs
    })
    .catch((err) => {
      res.send(err); // If some error occurs
    });
});
module.exports = router;

// Frontend stripe react code-->https://betterprogramming.pub/stripe-api-tutorial-with-react-and-node-js-1c8f2020a825

// STripe Frontend Code
// <!DOCTYPE html>
// <html>
// <title>Stripe Payment Demo</title>
// <body>
// 	<h3>Welcome to Payment Gateway</h3>
// 	<form action="payment" method="POST">
// 	<script
// 		src="//checkout.stripe.com/v2/checkout.js"
// 		class="stripe-button"
// 		data-key="<%= key %>"
// 		data-amount="2500"
// 		data-currency="inr"
// 		data-name="Crafty Gourav"
// 		data-description="Handmade Art and Craft Products"
// 		data-locale="auto" >
// 		</script>
// 	</form>
// </body>
// </html>
