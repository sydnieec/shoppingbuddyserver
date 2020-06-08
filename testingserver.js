var express = require("express");
var bodyParser = require("body-parser");

//import puppetter
const puppeteer = require("puppeteer");
var urls = [
  "https://www.amazon.ca/gp/product/B075GVZTDZ?pf_rd_r=CBGPYKVXJ6Z36GMQM4VP&pf_rd_p=05326fd5-c43e-4948-99b1-a65b129fdd73",
  "https://www.amazon.ca/Bluetooth-Arteck-Stainless-Smartphone-Rechargeable/dp/B015LSEUS8/ref=pd_sbs_147_4/138-6187995-9719521?_encoding=UTF8&pd_rd_i=B015LSEUS8&pd_rd_r=9f38ffb1-8987-410e-98b0-bcf8e77763a7&pd_rd_w=DFekK&pd_rd_wg=jmJwy&pf_rd_p=0ec96c83-1800-4e36-8486-44f5573a2612&pf_rd_r=D5XFQND5K3T58B8YZJF3&psc=1&refRID=D5XFQND5K3T58B8YZJF3",
];
var currentlist = [];
var updatedList = [];
var testingCurrentList = [
  {
    userId: 1,
    id:
      "https://www.amazon.ca/gp/product/B075GVZTDZ?pf_rd_r=CBGPYKVXJ6Z36GMQM4VP&pf_rd_p=05326fd5-c43e-4948-99b1-a65b129fdd73",
    title:
      " OMOTON Ultra-Slim Wireless Bluetooth Keyboard for iPad 7th Generation 10.2 inch, iPad Pro 11/12.9, iPad Air 10.5, iPad 9.7, iPad Mini, All iPhones and Other Bluetooth Enabled Devices, White ",
    body: " CDN$ 28.99 ",
  },
  {
    userId: 1,
    id:
      "https://www.amazon.ca/Bluetooth-Arteck-Stainless-Smartphone-Rechargeable/dp/B015LSEUS8/ref=pd_sbs_147_4/138-6187995-9719521?_encoding=UTF8&pd_rd_i=B015LSEUS8&pd_rd_r=9f38ffb1-8987-410e-98b0-bcf8e77763a7&pd_rd_w=DFekK&pd_rd_wg=jmJwy&pf_rd_p=0ec96c83-1800-4e36-8486-44f5573a2612&pf_rd_r=D5XFQND5K3T58B8YZJF3&psc=1&refRID=D5XFQND5K3T58B8YZJF3",
    title:
      " Arteck Stainless Steel Universal Portable Wireless Bluetooth Keyboard for iOS iPad Air, Pro, iPad Mini, Android ",
    body: " CDN$ 20.99 ",
  },
  [
    "https://www.amazon.ca/gp/product/B075GVZTDZ?pf_rd_r=CBGPYKVXJ6Z36GMQM4VP&pf_rd_p=05326fd5-c43e-4948-99b1-a65b129fdd73",
    "https://www.amazon.ca/Bluetooth-Arteck-Stainless-Smartphone-Rechargeable/dp/B015LSEUS8/ref=pd_sbs_147_4/138-6187995-9719521?_encoding=UTF8&pd_rd_i=B015LSEUS8&pd_rd_r=9f38ffb1-8987-410e-98b0-bcf8e77763a7&pd_rd_w=DFekK&pd_rd_wg=jmJwy&pf_rd_p=0ec96c83-1800-4e36-8486-44f5573a2612&pf_rd_r=D5XFQND5K3T58B8YZJF3&psc=1&refRID=D5XFQND5K3T58B8YZJF3",
  ],
];
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

//posts request for add item url
app.post("/additem", function (request, response) {
  var url = request.body.myurl;
  console.log(urls);
  //checks if item is in the list already
  var arraycontainsurl = urls.indexOf(url) > -1;
  if (arraycontainsurl == 1) {
    var obj = [
      {
        userId: 0,
        id: 0,
        title: "error",
        body: "Whoops this item is already in your list!",
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
          id: url,
          title: values[0],
          body: values[1],
        },
        urls,
      ];
      //gets rid of updated url at the very end
      currentlist.splice(-1, 1);
      //pushes the object to the currentlist
      var objToCurrentList = {
        userId: 1,
        id: url,
        title: values[0],
        body: values[1],
      };
      currentlist.push(objToCurrentList);
      currentlist.push(urls);
      console.log(currentlist);
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
  console.log("PAGE REFRESHED");
  var error, type, message, code;
  error = false;
  type = "Success";
  code = 200;
  //refreshes updated list to keept most recent products
  updatedList = [];
  updatedlistfunction(urls, currentlist)
    .then((results) => {
      // array of results in order here
      if (currentlist === undefined || currentlist.length == 0) {
        //checks if user has visited before
        console.log("first time user");
        for (let i = 0; i < urls.length; i++) {
          if (results[i][0] === "error") {
            updatedList.push({
              userId: 1,
              id: urls[i],
              title: results[i][0],
              body: results[i][1],
            });
            //delete the url in list if there is it says error
            const indexOfError = urls.indexOf(results[i][0]);
            urls.splice(indexOfError, 1);
          } else {
            updatedList.push({
              userId: 1,
              id: urls[i],
              title: results[i][0],
              body: results[i][1],
            });
          }
        }
      } else {
        //checks and compares previous prices that user had with new retreived prices
        console.log("user has visited before");
        for (let i = 0; i < urls.length; i++) {
          if (results[i][0] === "error") {
            updatedList.push({
              userId: 1,
              id: urls[i],
              title: results[i][0],
              body: results[i][1],
            });
            //delete the url in list if there is it says error
            const indexOfError = urls.indexOf(results[i][0]);
            urls.splice(indexOfError, 1);
          } else {
            //finds the position of old item and converts object into interger
            var elementPos = currentlist
              .map(function (x) {
                return x.id;
              })
              .indexOf(urls[i]);
            var objectFound = currentlist[elementPos].body;
            objectFound = JSON.stringify(objectFound);
            objectFound = objectFound.replace(/\D/g, "");
            objectFound = parseInt(objectFound);
            //converts the retreived price into interger
            var newPrice = JSON.stringify(results[i][1]);
            newPrice = newPrice.replace(/\D/g, "");
            newPrice = parseInt(newPrice);
            //compares prices and sends deals to list
            if (newPrice < objectFound) {
              console.log("SALE");
              updatedList.push({
                userId: 1,
                id: urls[i],
                title: results[i][0],
                body: "SALE" + results[i][1],
              });
            } else if (newPrice > objectFound) {
              console.log("price went up");
              updatedList.push({
                userId: 1,
                id: urls[i],
                title: results[i][0],
                body: "Price increased" + results[i][1],
              });
            } else {
              console.log(newPrice + objectFound);
              updatedList.push({
                userId: 1,
                id: urls[i],
                title: results[i][0],
                body: results[i][1],
              });
            }
          }
        }
      }
      updatedList.push(urls);
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
      });
      response.write(JSON.stringify(updatedList));
      response.end();
      currentlist = updatedList;
    })
    .catch((err) => {
      console.log(err);
    });
});

//function that gets call whenever changes are made to url list called whenever an item is deleted
app.post("/updatelist", function (request, response) {
  urls = request.body.urls;
  productId = request.body.productId;
  currentlist = currentlist.filter((x) => {
    return x.id != productId;
  });
  currentlist.splice(-1, 1);
  currentlist.push(urls);
  var obj = [
    {
      userId: 0,
      id: 0,
      title: "success",
      body: "urls successfully updated ",
    },
  ];
  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.write(JSON.stringify(obj));
  response.end();
  console.log("updated the list success!");
});

//function that updates list with promises
function updatedlistfunction(urls) {
  let promises = [];
  for (let i = 0; i < urls.length; i++) {
    promises.push(scrapeProduct(urls[i]));
  }
  return Promise.all(promises);
}

//function for retreiving title and price of product from single url
async function scrapeProduct(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    //checks which website user has requested for
    if (url.startsWith("https://www.amazon.ca") === true) {
      const [el] = await page.$x('//*[@id="productTitle"]');
      const txt = await el.getProperty("textContent");
      var title = await txt.jsonValue();
      const [el2] = await page.$x('//*[@id="price_inside_buybox"]');
      const txt2 = await el2.getProperty("textContent");
      var price = await txt2.jsonValue();
    } else if (url.startsWith("https://www.bestbuy.ca/") === true) {
      const [el] = await page.$x("/html/body/div[1]/div/div/div[4]/div[1]/h1");
      const txt = await el.getProperty("textContent");
      var title = await txt.jsonValue();
      const [el2] = await page.$x(
        "/html/body/div[1]/div/div/div[4]/div[1]/div[2]/div[2]/div[1]/div/span/div"
      );
      const txt2 = await el2.getProperty("textContent");
      var price = await txt2.jsonValue();
      var price = price.slice(0, -2) + "." + price.slice(-2);
    }

    //strips the title and price of whitespaces and new lines
    var title = title.replace(/\n/g, " ");
    var price = price.replace(/\n/g, " ");
    var title = title.replace(/\s\s+/g, " ");
    var price = price.replace(/\s\s+/g, " ");

    browser.close();

    return await [title, price];
  } catch (error) {
    console.log(error);
    console.log("error cannot display item");
    return await ["error", "Sorry we cannot get the product info!"];
    //sends back to clients an error messages
  }
}
