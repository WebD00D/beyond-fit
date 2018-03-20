var express = require('express');
var bodyParser = require('body-parser');

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static/css",express.static(__dirname + "/static/css"));
app.use("/static/scss",express.static(__dirname + "/static/scss"));
app.use("/static/img",express.static(__dirname + "/static/img"));
app.use("/static/js",express.static(__dirname + "/static/js"));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

app.get('/packages', function (req, res) {
  res.sendFile(__dirname + '/packages.html');
})

app.get('/testimonials', function (req, res) {
  res.sendFile(__dirname + '/testimonials.html');
})


app.listen(process.env.PORT || 8091, function () {
  console.log('Listening on port 8091!')
})

app.post('/send-message', function(request, res){

  var postmark = require("postmark");
  var client = new postmark.Client("ddd14bfd-7b39-476b-92d1-44281ae614ed");

  var name = request.body.name;
  var email = request.body.email;
  var phone = request.body.phone;
  var serviceAddress = request.body.address;
  var city = request.body.city;
  var zipcode = request.body.zip
  var message = request.body.message;

  client.sendEmailWithTemplate({
  "From": "sales@richmondsealing.com",
  "To": "sales@richmondsealing.com",
  "ReplyTo": request.body.email,
  "TemplateId": 1245581,
  "TemplateModel": {
    "name": name,
    "address": serviceAddress,
    "city": city,
    "zip" : zipcode,
    "email": email,
    "phone": phone,
    "message": message
  }
});

res.end("successful");

})



app.post('/checkout', function (request, res) {

    //var stripe = require("stripe")('sk_test_dWF0TGuecEqV2mjch2hM0tg0');
    var stripe = require("stripe")('sk_live_lGIIudU426JgsWttDrbIsLhf');

    var token = request.body.token;
    var email = request.body.email;
    var serviceAddress = request.body.servicedAt;
    var subtotal = request.body.subtotal;
    var fee = request.body.fee;
    var totalpaid = request.body.total;

    var charge = stripe.charges.create({
      amount: totalpaid, // Amount in cents
      currency: "usd",
      source: token,
      receipt_email: email,
      description: 'Seal This service at ' + serviceAddress
    }, function(err, charge) {
      console.log(charge, err)
      if (err && err.type === 'StripeCardError') {

        res.end("card failed");

      } else {

      var postmark = require("postmark");
      var client = new postmark.Client("ddd14bfd-7b39-476b-92d1-44281ae614ed");

      // Send to Steve. Customer receipt is handles by Stripe.
      client.sendEmail({
          "From": "sales@richmondsealing.com",
          "To": "sales@richmondsealing.com",
          "Subject": "An Invoice has been Paid!",
          "TextBody": "Customer ("+ email +") at " + serviceAddress + " has paid invoice for $" + subtotal  + ". A 3% ($ " + parseFloat(fee).toFixed(2) + ") Fee was added."
      });

      res.end("successful");

    }

  });

});
