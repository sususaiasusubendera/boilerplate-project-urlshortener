require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const { MongoClient } = require("mongodb");
const dns = require("dns");
// const urlParser = require('url'); // url.parse() usage was deprecated
const { URL } = require("url");

// database connection
const client = new MongoClient(process.env.DB_URL);
const db = client.db("url-shortener");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // check false (OK)

app.use("/public", express.static(`${process.cwd()}/public`));

// use body-parser to parse POST requests
// app.use(bodyParser.urlencoded({ extended: false })); // check using bodyParser + check false (OK + OK)

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// tests
// test 2
app.post("/api/shorturl", (req, res) => {
  console.log(req.body);
  const url = req.body.url;
  // url.parse() is deprecated, use new URL() instead
  const dnslookup = dns.lookup(new URL(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL"}); // test 4
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({
        original_url: url,
        short_url: urlCount
      });
    }
  });
});

// test 3
app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

/*
p.s.
use await for database method (async-await)
*/
