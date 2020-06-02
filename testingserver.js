var express = require("express");
var bodyParser = require("body-parser");

var db;
var currentRoom = "";
//import puppetter
const puppeteer = require("puppeteer");
var urls = [];
//https://www.amazon.ca/gp/product/B07VG7PMC5/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1
var updatedList = [];
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

//posts request for add item url
app.post("/additem", function (request, response) {
  // console.log(request.body);
  var url = request.body.myurl;
  // console.log(request.body.url);
  // console.log(url);
  console.log(urls);
  var arraycontainsurl = urls.indexOf(url) > -1;
  if (arraycontainsurl == 1) {
    var obj = [
      {
        userId: 0,
        id: 0,
        title: "error",
        body: "item already in list",
      },
    ];
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
    });
    response.write(JSON.stringify(obj));
    response.end();
    console.log("sending post back ALREADY IN LIST");
  } else {
    urls.push(url);
    console.log(urls);
    (async () => {
      var values = await scrapeProduct(url);
      var obj = [
        {
          userId: 1,
          id: 1,
          title: values[0],
          body: values[1],
        },
      ];
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
      });
      response.write(JSON.stringify(obj));
      response.end();
      console.log("sending post back SUCCESS");
    })();
  }
});

//gets a list of current products
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
  var updatedListnew = updatelistfunction(urls, updatedList);
  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.write(JSON.stringify(updatedListnew));
  response.end();
  console.log("sending get request back" + updatedList);

  // (async () => {
  //   var values = await scrapeProduct(
  //     "https://www.amazon.ca/gp/product/B07VG7PMC5/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1"
  //   );
  //   // console.log(values);
  //   // console.log("title" + values[0]);
  //   // console.log("prices" + values[1]);
  //   var obj = [
  //     {
  //       userId: 1,
  //       id: 1,
  //       title: values[0],
  //       body: values[1],
  //     },
  //   ];
  //   response.writeHead(200, {
  //     "Content-Type": "application/json; charset=utf-8",
  //   });
  //   response.write(JSON.stringify(obj));
  //   response.end();
  //   console.log("sending get request back");
  // })();
});

//function to retreive updated title and prices of list of urls
function updatelistfunction(urls, updatedList) {
  for (i = 0; i < urls.length; i++) {
    (async () => {
      // console.log(urls);
      var values = await scrapeProduct(urls[i]);
      console.log("values " + values);
      updatedList.push({
        userId: 1,
        id: i,
        title: values[0],
        body: values[1],
      });
    })();
  }
  return updatedList;
}
//function for retreiving title and price of product from single url
async function scrapeProduct(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const [el] = await page.$x('//*[@id="productTitle"]');
    const txt = await el.getProperty("textContent");
    var title = await txt.jsonValue();

    const [el2] = await page.$x('//*[@id="price_inside_buybox"]');
    const txt2 = await el2.getProperty("textContent");
    var price = await txt2.jsonValue();

    //strips the title and price of whitespaces and new lines
    var title = title.replace(/\n/g, " ");
    var price = price.replace(/\n/g, " ");
    var title = title.replace(/\s\s+/g, " ");
    var price = price.replace(/\s\s+/g, " ");

    // console.log({ title, price });

    browser.close();

    return await [title, price];
  } catch (error) {
    console.log("error cannot display item");
    return await ["error", "cannot get product info"];
    // //catches error if the price is on another div
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto(url);

    // const [el] = await page.$x('//*[@id="productTitle"]');
    // const txt = await el.getProperty("textContent");
    // var title = await txt.jsonValue();

    // const [el2] = await page.$x('//*[@id="priceblock_dealprice"]');
    // const txt2 = await el2.getProperty("textContent");
    // var price = await txt2.jsonValue();

    // //strips the title and price of whitespaces and new lines
    // var title = title.replace(/\n/g, " ");
    // var price = price.replace(/\n/g, " ");
    // var title = title.replace(/\s\s+/g, " ");
    // var price = price.replace(/\s\s+/g, " ");
    // // console.log({ title, price });

    // browser.close();
    // // console.log({ title, price });

    // return await [title, price];
    // //console.log("price in priceblock");
  }
}
