var express = require("express");
var bodyParser = require("body-parser");

var db;
var currentRoom = "";
//import puppetter
const puppeteer = require("puppeteer");
var urls = [
  "https://www.amazon.ca/gp/product/B075GVZTDZ?pf_rd_r=CBGPYKVXJ6Z36GMQM4VP&pf_rd_p=05326fd5-c43e-4948-99b1-a65b129fdd73",
  "https://www.amazon.ca/Bluetooth-Arteck-Stainless-Smartphone-Rechargeable/dp/B015LSEUS8/ref=pd_sbs_147_4/138-6187995-9719521?_encoding=UTF8&pd_rd_i=B015LSEUS8&pd_rd_r=9f38ffb1-8987-410e-98b0-bcf8e77763a7&pd_rd_w=DFekK&pd_rd_wg=jmJwy&pf_rd_p=0ec96c83-1800-4e36-8486-44f5573a2612&pf_rd_r=D5XFQND5K3T58B8YZJF3&psc=1&refRID=D5XFQND5K3T58B8YZJF3",
];
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
  console.log("refreseed");
  var error, type, message, code;
  error = false;
  type = "Success";
  code = 200;
  updatedList = [];

  someFunction(urls)
    .then((results) => {
      // array of results in order here
      console.log("RESULTS" + results[0][0]);
      for (let i = 0; i < urls.length; i++) {
        updatedList.push({
          userId: 1,
          id: urls[i],
          title: results[i][0],
          body: results[i][1],
        });
      }
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
      });
      response.write(JSON.stringify(updatedList));
      response.end();
    })
    .catch((err) => {
      console.log(err);
    });

  // var updatedListnew = updatelistfunction(urls);
  // response.writeHead(200, {
  //   "Content-Type": "application/json; charset=utf-8",
  // });
  // response.write(JSON.stringify(updatedListnew));
  // response.end();
  // console.log("sending get request back" + updatedListnew);
});

//function about promises
function someFunction(urls) {
  let promises = [];
  for (let i = 0; i < urls.length; i++) {
    promises.push(scrapeProduct(urls[i]));
  }
  return Promise.all(promises);
}

//function to retreive updated title and prices of list of urls
function updatelistfunction(urls) {
  for (let i = 0; i < urls.length; i++) {
    if (i == 0) {
      updatedList = [];
    }
    (async () => {
      // console.log(urls);
      var values = await scrapeProduct(urls[i]);
      console.log("values why tho " + values);
      newupdatedList = {
        userId: 1,
        id: urls[i],
        title: values[0],
        body: values[1],
      };
      updatedList.push(newupdatedList);
    })();
  }
  console.log(updatedList);
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
  }
}
