const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN; //prasath_token

// port = 3000;

app.listen(process.env.PORT, () => {
  console.log("webhook is listening");
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (body_param.object) {
    console.log("inside body param");
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let message_body =
        body_param.entry[0].changes[0].value.messages[0].text.body;

      console.log("phone number: " + phone_number_id);
      console.log("from: " + from);
      console.log("body param: " + message_body);

      // Define specific replies based on message content
      // let reply_message;
      // if (message_body.includes("I want to place order")) {
      //   reply_message =
      //     "Okay, please provide the name and quantity of the product you want to order.";
      // } elseIf(message_body.includes("I want 100kg of Product2")){
      //   reply_message =
      //   "Okay, let me check the availability. It's available. Placing your order now"

      // }elseIf(message_body.includes("I want 270kg of Product3")){
      //   reply_message =
      //   "Okay, let me check the availability. It's not available."

      // }else {
      //   // reply_message = `Hi.. This is BansalPolymer, your message is ${message_body}`;
      //   reply_message = `Hi.. This is BansalPolymer, how can we help you!`;
      // }

      let invoice = `C:\Users\mohit\Downloads`;

      let reply_message;
      if (message_body.includes("I want to place order")) {
        reply_message =
          "Okay, here is today's price list:\n1. Product1=Rs.234/-\n2. Product2=Rs.130/-\n3. Product3=Rs107/-\nTo place an order, please provide the name and quantity of the product you want to order.";
      } else if (message_body.includes("I want 100kg of product 2")) {
        reply_message =
          "Okay, let me check the availability. It's available. Placing your order now.";
      } else if (message_body.includes("I want 270kg of product 3")) {
        reply_message =
          "Okay, let me check the availability. It's not available.";
      } else {
        reply_message = "Hi.. This is Bansal Polymer, how can we help you!";
      }

      axios({
        method: "POST",
        url: `https://graph.facebook.com/v13.0/${phone_number_id}/messages?access_token=${token}`,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: reply_message,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(() => {
          console.log("Reply sent successfully");
          res.sendStatus(200);
        })
        .catch((error) => {
          console.error("Error sending reply:", error);
          res.status(500).send("Error sending reply");
        });
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
});

// app.post("/webhook", (req, res) => {
//   //i want some

//   let body_param = req.body;

//   console.log(JSON.stringify(body_param, null, 2));

//   if (body_param.object) {
//     console.log("inside body param");
//     if (
//       body_param.entry &&
//       body_param.entry[0].changes &&
//       body_param.entry[0].changes[0].value.messages &&
//       body_param.entry[0].changes[0].value.messages[0]
//     ) {
//       let phon_no_id =
//         body_param.entry[0].changes[0].value.metadata.phone_number_id;
//       let from = body_param.entry[0].changes[0].value.messages[0].from;
//       let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

//       console.log("phone number " + phon_no_id);
//       console.log("from " + from);
//       console.log("boady param " + msg_body);

//       axios({
//         method: "POST",
//         url:
//           "https://graph.facebook.com/v13.0/" +
//           phon_no_id +
//           "/messages?access_token=" +
//           token,
//         data: {
//           messaging_product: "whatsapp",
//           to: from,
//           text: {
//             body: "Hi.. I'm Prasath, your message is " + msg_body,
//           },
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       res.sendStatus(200);
//     } else {
//       res.sendStatus(404);
//     }
//   }
// });

app.get("/", (req, res) => {
  res.status(200).send("hello this is webhook setup");
});
