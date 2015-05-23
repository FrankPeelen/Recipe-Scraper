"use strict"

var request = require('request');
var cheerio = require('cheerio');
var fs = require("fs");
var filename = 'recipes.txt'

var dataObj = {};
var base_url = 'http://www.taste.com.au/recipes/';

function go() {
	// Find Data
	var num = 26620;
	var name = 'vegiladas+with+rice+and+corn+salad';
	var url = base_url + num + '/' + name;
	request(url, function(err, resp, body) {
	  if (err)
	    throw err;
	  var body = cheerio.load(body);
	  var data = [];
	  body('.nutrition-table tbody tr td').each(function(nutrition) {
    	data.push(body(this).text().replace(/[^0-9.]/g, ''));
		});
		var formatted_name = name.replace(/[+]/g, '_');
		dataObj[formatted_name] = {};
	  dataObj[formatted_name].kcal = data[0];
	  dataObj[formatted_name].fats = data[2];
	  dataObj[formatted_name].carbs = data[4];
	  dataObj[formatted_name].protein = data[6];
	  var parsed_data = JSON.stringify(dataObj);
	  fs.appendFile(filename, parsed_data);
	});
};

function readFromFile() {
	fs.readFile(filename, function (err, data) {
  if (err) throw err;
  	var read = JSON.parse(data);
  	console.log(read);
	});
};

go();
//readFromFile();
