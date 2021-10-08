const express = require("express");
const Router = express.Router();
const https = require('https');
const csv = require('csvtojson');
const mysqlConnection = require('../sql_connection')

var url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_SouthEast_Asia_24h.csv"

function getData(url) {
    console.log('Started Get Data Function')
  https.get(url, (resp) => {
    let data = '';
 
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });
 
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        pcsv(data);
    });
 
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}


//latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
function pcsv(csvStr) {
    csv({
       noheader:false,
   })
   .fromString(csvStr)
   .then((csvRow)=>{
        insertIntoDB(csvRow);
        console.log("Everything Was Inputted")
   })
}

function insertIntoDB(csvRow) {
    // insert statment
    
    // execute the insert statment
    
    for(var i = 0; i < csvRow.length; i++) {
        let sql = "INSERT INTO nasafirmdata (latitude, longitude, brightness, scan, track, acq_date, acq_time, satellite, confidence, version, bright_t31, frp, daynight) VALUES(";

        for(var key in csvRow[i]) {
            sql = sql + `'${csvRow[i][key]}', `;
        }

        let finalSql = sql.substring(0, sql.length - 2);
        finalSql = finalSql + ')';


        mysqlConnection.query(finalSql, function(err,result) {
            if(err) {
                console.log(err)
            }
            else {
                console.log(finalSql);
            }
        })
    }
    
}

// Router.get("/", (req, res) => {
getData(url);
// })

module.exports = Router;