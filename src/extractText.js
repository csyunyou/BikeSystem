var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    eventproxy = require('eventproxy'),
    _ =require("underscore"),
    csv=require('csv'),
	fs=require("fs"),
    moment=require('moment')
let filePath='C:/Users/yunyou/Desktop/data/Hospital/care-practice-san-francisco-4-reviewNum=173.csv'
fs.readFile(filePath, function (err, data) {
    if (err) {
    	return console.error(err);
    }
	csv.parse(data, function(err, output){
		console.log(output[0])
	});
});
