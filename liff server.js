const line = require('@line/bot-sdk');
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 5000;
const myLiffId = process.env.MY_LIFF_ID;
var wget = require('wget');

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

app.get("/CuSense", function(req, res) {
  res.sendFile(__dirname + "/public/cusense.html")
});

app.get("/Windy", function(req, res) {
  res.sendFile(__dirname + "/public/windy.html")
});

app.get("/Nasa%20FIRMS", function(req, res) {
  res.sendFile(__dirname + "/public/nasafirms.html")
});

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

function csvDownload() {
  var src = 'https://raw.github.com/Fyrd/caniuse/master/data.json';
  var output = '/tmp/data.json';
  var options = {
    proxy: 'http://host:port'
  };
  var download = wget.download(src, output, options);
  download.on('error', function(err) {
    console.log(err);
  });
  download.on('end', function(output) {
    console.log(output);
  });
  download.on('progress', function(progress) {
    console.log("I am downloading!");
  });
  return download;
}

async function windyFetch() {
  return await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: 17.573,
        lon: 98.808,
        model: "gfs",
        parameters: ["temp", "precip", "wind", "windGust", "ptype", "rh", "pressure", "cosc"],
        levels: ["surface"],
        key: '8Cq5Sg5sJRRvjtj58rFQurjPUfFaVGCH'
      })
    })
    .then(response => {
      return response.json();
    })
    .then(responseData => {
      console.log(responseData);
      return responseData;
    })
}

async function cuSenseFetch(sensor) {
  return await fetch('https://www.cusense.net:8082/api/v1/sensorData/realtime/all', {
      method: 'POST',
      headers: {
        'X-Gravitee-Api-Key': '3d9c7df5-1262-45ad-a311-ff5ae72b4cb8',
        'Content-Type': 'application/json'
      },
      body: '{\"topic\":\"' + sensor + '\"}'
    })
    .then(response => {
      let json = response.json();
      return json;
    })
    .then(responseData => {
      const stationData = responseData[sensor].data;
      stationData.name = responseData[sensor].info["name"];
      stationData.province = responseData[sensor].info["province"];
      stationData.sensor = responseData[sensor].info["project"];

      const date = new Date(stationData[0].time.substr(0, 19));
      const messageResponse = "Data provided by " + stationData.sensor + " for " + stationData.name + " in " + stationData.province + "\n" + "On " + date.toDateString() +
        ", \n" + "The temperature is " + stationData[0].temp + " ℃, \n" + "PM1 concentration is " + stationData[0]["pm1"] + " µg/m3, \n" + "PM25 concentration is " + stationData[0]["pm25"] + " µg/m3, \n" + "PM10 concentration is " + stationData[0]["pm10"] + " µg/m3, \n" + "The humidity is " + stationData[0].humid + "%. \n" + "Data changes every hour!";

      return messageResponse;
    });
}

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
    let test = csvDownload();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "Currently, our Nasa FIRMS Fire Hotspot tool is underdevelopment. \n \n \n Please take a look at the following to see our instructional video on how to use Nasa Firms: \n \n https://maepingfirepa.herokuapp.com/Nasa%20FIRMS"
    });
  } else if (event.message.text.match("CUsense")) {

    let sensorOne = await cuSenseFetch("cusensor3/8CAAB5852984");
    let sensorTwo = await cuSenseFetch("cusensor3/8CAAB5851AD4");
    return client.replyMessage(event.replyToken, [{
      type: 'text',
      text: sensorOne + "\n \n \n" + sensorTwo + "\n \n \n"
    }, {
      type: 'text',
      text: "For more info look at : https://cusense.net/map"
    }]);
  } else if (event.message.text.match("Windy")) {

    let windyData = await windyFetch();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "To view our Windy App, please take a look at the following link which includes an instructional video and the app itself: \n \n https://maepingfirepa.herokuapp.com/Windy "
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