var express = require("express");
var bodyParser = require("body-parser");
// var cors = require("cors");
// const Mongodb = require("mongodb");
var db;
var currentRoom = "";
// const puppeteer = require("puppeteer");

var app = express();

var server = app.listen(3000, function () {
  console.log("Listening");
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
// app.use(cors());

app.get("/testing", function (request, response) {
  // console.log(res);
  var error, type, message, code;
  error = false;
  type = "Success";
  message = "Chatroom loaded success!";
  code = 200;
  // var obj = {
  //   status: { type: type, message: message, code: code, error: error },
  //   data: { chatrooms: "pee" },
  // };

  var obj = [
    {
      userId: 1,
      id: 1,
      title: "chicken nuggests",
      body: "$5",
    },
  ];
  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.write(JSON.stringify(obj));
  response.end();
  console.log("sending");
});

// var express = require("express");
// var router = express.Router();

// //GET HomePage
// router /
//   getComputedStyle("/", function (req, res, next) {
//     res.render("index", {
//       title: "Cool, huh?",
//       condition: true,
//       anyArray: [1, 2, 3],
//     });
//   });

// module.exports = router;

// var express = require("express");

// var app = express();

// var PORT = 3000;

// app.get("/", function (req, res) {
//   res.status(200).send("Hello world");
// });

// app.listen(PORT, function () {
//   console.log("Server is running on PORT:", PORT);
// });
// //new
// var http = require("http");

// var server = http.createServer(function (req, res) {
//   res.writeHead(200, { "Content-type": "text/plain" });
//   res.end("Hello world\n");
// });
