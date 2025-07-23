require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

let urlDB = []
let id = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res) => {
  const originURL = req.body.url;

  if (!/^https?:\/\/.+/i.test(originURL)) {
    return res.json({ error: "invalid url" });
  }
  
  let hostname;
  try {
    hostname = urlParser.parse(originURL.toString()).hostname;
  } catch (error) {
    return res.json({
      error: "invalid url"
    })
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({
        error: "invalid url"
      })
    }
    else {
      const shorten = id++;
      urlDB[shorten] = originURL;
      res.json({ original_url: originURL, short_url: shorten })
    }
  })
})

app.get("/api/shorturl/:short_url", (req, res) => {
  const shorten = req.params.short_url;
  const originURL = urlDB[shorten]
  if (originURL) {
    res.redirect(originURL)
  }
  else {
    res.json({
      error: "invalid url"
    })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
