const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN; //prasath_token

// port = 3000;

app.listen(process.env.PORT || 3000, () => {
  console.log("webhook is listening");
});

// //to verify the callback url from dashboard side - cloud api side
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
      let reply_message;
      let button_url;
      let buttons = [];

      if (message_body.includes("I want 100kg of product 2")) {
        reply_message =
          "Okay, let me check the availability. It's available. Placing your order now.";

        // Add buttons for user response
        buttons = [
          {
            type: "web_url",
            title: "Yes",
            url: "https://example.com/place-order",
          },
          {
            type: "web_url",
            title: "No",
            url: "https://example.com/cancel-order",
          },
        ];
      } else if (message_body.includes("I want 270kg of product 3")) {
        reply_message =
          "Okay, let me check the availability. It's not available.";
      } else {
        reply_message = "Hi.. This is Bansal Polymer, how can we help you!";
        button_url = "https://example.com/";
      }

      // Construct message with buttons
      let button_message = {
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: reply_message,
          buttons: buttons,
        },
      };

      // Send message with buttons
      axios({
        method: "POST",
        url: `https://graph.facebook.com/v13.0/${phone_number_id}/messages?access_token=${token}`,
        data: button_message,
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

// // const JAVA_BACKEND_URL = 'http://your-java-backend-url/webhook'

// app.post("/webhook", (req, res) => {
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
//       let phone_number_id =
//         body_param.entry[0].changes[0].value.metadata.phone_number_id;
//       let from = body_param.entry[0].changes[0].value.messages[0].from;
//       let message_body =
//         body_param.entry[0].changes[0].value.messages[0].text.body;

//       console.log("phone number: " + phone_number_id);
//       console.log("from: " + from);
//       console.log("body param: " + message_body);

//       // Define specific replies based on message content

//       let invoice = `C:\Users\mohit\Downloads`;

//       let reply_message;
//       if (message_body.includes("I want to place order")) {
//         reply_message =
//           "Okay, here is today's price list:\n1. Product1=Rs.234/-\n2. Product2=Rs.130/-\n3. Product3=Rs107/-\nTo place an order, please provide the name and quantity of the product you want to order.";
//       } else if (message_body.includes("I want 100kg of product 2")) {
//         reply_message =
//           "Okay, let me check the availability. It's available. Placing your order now.";
//       } else if (message_body.includes("I want 270kg of product 3")) {
//         reply_message =
//           "Okay, let me check the availability. It's not available.";
//       } else {
//         reply_message = "Hi.. This is Bansal Polymer, how can we help you!";
//       }

//       axios({
//         method: "POST",
//         url: `https://graph.facebook.com/v13.0/${phone_number_id}/messages?access_token=${token}`,
//         data: {
//           messaging_product: "whatsapp",
//           to: from,
//           text: {
//             body: reply_message,
//           },
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//         .then(() => {
//           console.log("Reply sent successfully");
//           res.sendStatus(200);
//         })
//         .catch((error) => {
//           console.error("Error sending reply:", error);
//           res.status(500).send("Error sending reply");
//         });
//     } else {
//       res.sendStatus(404);
//     }
//   } else {
//     res.sendStatus(400);
//   }
// });

app.get("/", (req, res) => {
  res.status(200).send("hello this is webhook setup");
});

// const express = require("express");
// const axios = require("axios");

// const app = express();
// app.use(express.json());

// const JAVA_BACKEND_URL = "http://localhost:8080/webhook"; // Update with your Java backend URL

// app.post("/webhook", (req, res) => {
//   let body_param = req.body;

//   // Check if the body_param object exists
//   if (!body_param) {
//     return res.status(400).send("Missing request body");
//   }

//   // Check if the required properties exist
//   if (
//     !body_param.entry ||
//     !body_param.entry[0] ||
//     !body_param.entry[0].changes ||
//     !body_param.entry[0].changes[0] ||
//     !body_param.entry[0].changes[0].value ||
//     !body_param.entry[0].changes[0].value.messages ||
//     !body_param.entry[0].changes[0].value.messages[0] ||
//     !body_param.entry[0].changes[0].value.metadata ||
//     !body_param.entry[0].changes[0].value.metadata.phone_number_id ||
//     !body_param.entry[0].changes[0].value.messages[0].from ||
//     !body_param.entry[0].changes[0].value.messages[0].text ||
//     !body_param.entry[0].changes[0].value.messages[0].text.body
//   ) {
//     return res.status(400).send("Invalid request body format");
//   }

//   // Extract parameters
//   let phone_number_id =
//     body_param.entry[0].changes[0].value.metadata.phone_number_id;
//   let from = body_param.entry[0].changes[0].value.messages[0].from;
//   let message_body = body_param.entry[0].changes[0].value.messages[0].text.body;

//   // Use the extracted parameters for further processing
//   console.log("phone number: " + phone_number_id);
//   console.log("from: " + from);
//   console.log("body param: " + message_body);

//   // Continue with your logic...
// });

// app.post("/webhooks", (req, res) => {
//   let body_param = req.body;

//   // console.log(JSON.stringify(body_param, null, 2));

//   if (body_param.object) {
//     console.log("inside body param");
//     if (
//       body_param.entry &&
//       body_param.entry[0].changes &&
//       body_param.entry[0].changes[0].value.messages &&
//       body_param.entry[0].changes[0].value.messages[0]
//     ) {
//       let phone_number_id =
//         body_param.entry[0].changes[0].value.metadata.phone_number_id;
//       let from = body_param.entry[0].changes[0].value.messages[0].from;
//       let message_body =
//         body_param.entry[0].changes[0].value.messages[0].text.body;

//       console.log("phone number: " + phone_number_id);
//       console.log("from: " + from);
//       console.log("body param: " + message_body);

//       let payload = {
//         phone_number_id: phone_number_id,
//         from: from,
//         message_body: message_body,
//       };

//       axios
//         .post(JAVA_BACKEND_URL, payload)
//         .then((responseFromJava) => {
//           const reply_message = responseFromJava.data.reply_message; // Assuming the response contains a 'reply_message' field
//           // Send reply to WhatsApp using WhatsApp API
//           // ...

//           console.log("Reply from Java backend:", reply_message);
//           res.status(200).send(reply_message);
//         })
//         .catch((error) => {
//           console.error("Error sending message to Java backend:", error);
//           res.status(500).send("Error processing message");
//         });
//     } else {
//       res.sendStatus(404);
//     }
//   } else {
//     res.sendStatus(400);
//   }
// });

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

// const express = require("express");
// const axios = require("axios");
// const bodyParser = require("body-parser");
// require("dotenv").config();

// const app = express();
// app.use(bodyParser.json());

// const mytoken = process.env.MYTOKEN;
// const token = process.env.TOKEN;
// const JAVA_BACKEND_BASE_URL =
//   process.env.JAVA_BACKEND_URL ||
//   "http://javaserver-env.ap-south-1.elasticbeanstalk.com/webhook"; // Update with your Java backend URL

// app.get("/", (req, res) => {
//   res.status(200).send("Hello, this is the webhook setup");
// });

// app.get("/webhook", (req, res) => {
//   let mode = req.query["hub.mode"];
//   let challenge = req.query["hub.challenge"];
//   let verifyToken = req.query["hub.verify_token"];

//   if (mode && verifyToken) {
//     if (mode === "subscribe" && verifyToken === mytoken) {
//       res.status(200).send(challenge);
//     } else {
//       res.status(403).send("Forbidden");
//     }
//   } else {
//     res.status(400).send("Bad Request");
//   }
// });

// app.post("/webhook", (req, res) => {
//   let body_param = req.body;

//   if (
//     body_param.object === "page" &&
//     body_param.entry &&
//     body_param.entry.length > 0
//   ) {
//     let entry = body_param.entry[0];

//     if (entry.changes && entry.changes.length > 0) {
//       let change = entry.changes[0];

//       if (
//         change.value &&
//         change.value.messages &&
//         change.value.messages.length > 0
//       ) {
//         let message = change.value.messages[0];
//         let phone_number_id = change.value.metadata.phone_number_id;
//         let from = message.from;
//         let message_body = message.text.body;

//         console.log("phone number: " + phone_number_id);
//         console.log("from: " + from);
//         console.log("body param: " + message_body);

//         // Choose endpoint based on message content or any other criteria
//         let javaEndpoint = "/msg"; // Default endpoint
//         if (message_body.toLowerCase().includes("orders")) {
//           javaEndpoint = "/getOrders";
//         } else if (message_body.toLowerCase().includes("order details")) {
//           javaEndpoint = "/getOrderDetails";
//         }

//         // Construct Java backend URL based on chosen endpoint
//         const JAVA_BACKEND_URL = JAVA_BACKEND_BASE_URL + javaEndpoint;

//         // Make request to Java backend
//         axios
//           .post(JAVA_BACKEND_URL, {
//             phone_number_id: phone_number_id,
//             from: from,
//             message_body: message_body,
//           })
//           .then((responseFromJava) => {
//             const reply_message = responseFromJava.data.reply_message;
//             console.log("Reply from Java backend:", reply_message);
//             res.status(200).send(reply_message);
//           })
//           .catch((error) => {
//             console.error("Error sending message to Java backend:", error);
//             res.status(500).send("Error processing message");
//           });
//       } else {
//         res.status(400).send("Bad Requesttttt");
//       }
//     } else {
//       res.status(400).send("Bad Requestyyyyy");
//     }
//   } else {
//     res.status(400).send("Bad Requestuuuuu");
//   }
// });

//         axios
//           .post(JAVA_BACKEND_URL, {
//             phone_number_id: phone_number_id,
//             from: from,
//             message_body: message_body,
//           })
//           // .then((responseFromJava) => {
//           //   const reply_message = responseFromJava.data.reply_message; // Assuming the response contains a 'reply_message' field
//           //   console.log("Reply from Java backend:", reply_message);
//           //   res.status(200).send(reply_message);
//           // })
//           .then((responseFromJava) => {
//             // Assuming the response contains a 'reply_message' field
//             const reply_message = responseFromJava.data.reply_message;

//             // Check if reply_message is a string
//             if (typeof reply_message === "string") {
//               console.log("Reply from Java backend (String):", reply_message);
//               res.status(200).send(reply_message);
//             }
//             // Check if reply_message is an array
//             else if (Array.isArray(reply_message)) {
//               console.log("Reply from Java backend (Array):");
//               // Handle array data accordingly
//               // For example, you might want to convert it to a string before sending it as a response
//               const reply_message_string = reply_message.join(", "); // Convert array to comma-separated string
//               res.status(200).send(reply_message_string);
//             }
//           })
//           .catch((error) => {
//             console.error("Error sending message to Java backend:", error);
//             res.status(500).send("Error processing message");
//           });
//       } else {
//         res.status(400).send("Bad Requestdssdsd");
//       }
//     } else {
//       res.status(400).send("Bad Requesttttttt");
//     }
//   } else {
//     res.status(400).send("Bad Requesttoto");
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
