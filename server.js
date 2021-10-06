const line = require('@line/bot-sdk');
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 5000;
const myLiffId = process.env.MY_LIFF_ID;
//const wget = require('node-wget');
const https = require("https");
const fs = require("fs");
const request = require('request');
const bodyParser = require("body-parser");
const mysqlConnection=require("./public/sql_connection")
const Nasa_Firms = require("./public/routes/nasa_firms")




require('dotenv').config();

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

app.use(express.static('public'));

app.get('/send-id', function(req, res) {
  res.json({
    id: myLiffId
  });
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/LIFF.html");
});

app.get("/Home", function(req, res) {
  res.sendFile(__dirname + "/public/LIFF.html");
});

app.get("/LINE", function(req, res) {
  res.sendFile(__dirname + "/public/line.html");
});

app.get("/Fire%20Timeline", function(req, res) {
  res.sendFile(__dirname + "/public/firetimeline.html")
});



// DATABASE STUFF
app.use('/nasa_firms', Nasa_Firms)

app.post("/getdata", bodyParser.json(), function(req, res) {
  let query = req.body
  mysqlConnection.query(query["query"], (err, rows, fields) => {
    if(!err) {
      let mapData = rows;
      res.send(mapData)
    }
    else {
      console.log(err);
    }
  })
})



// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});


//mongodb connection setupf
// const mysqlConnection = require('./public/testconnection')
// const uri = `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.em7pv.mongodb.net/FireData?retryWrites=true&w=majority`;
// const dbClient = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a text message
  const echo = {
    type: 'text',
    text: event.message.text
  };
  if (event.message.text.match("NASA FIRMS")) {
    //let test = csvDownload();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "Currently, our Nasa FIRMS Fire Hotspot tool is underdevelopment. \n \n \n Please take a look at the following to see our webpage to view the tool: \n \n https://maepingfirepa.herokuapp.com/Fire%20Timeline"
    });
  } else if (event.message.text.match("About Bushfire")) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "Currently, our 'About Bushfire' section is underdevelopment. \n \n \n Please take a look at the following to see instructional videos about wildfires \n \n https://maepingfirepa.herokuapp.com/Windy"
    });
  }
  // use reply API
  return client.replyMessage(event.replyToken,
    echo);
}


app.listen(port, () => console.log(`app listening on port ${port}!`));
