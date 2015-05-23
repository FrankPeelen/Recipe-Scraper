"use strict"

var request = require('request');
var cheerio = require('cheerio');
var fs = require("fs");
var filename = 'recipes.txt'

var dataObj = {};
var base_url = 'http://www.taste.com.au/recipes/';

function go() {
	// Find Link
	var num = 26620;
	var name = 'vegiladas+with+rice+and+corn+salad';
	var url = base_url + num + '/' + name;

	// Request Data
	
	request(url, function(err, resp, body) {
	// Check for Error
		if (err)
		  console.log(err);

		// Retrieve data from body
		var body = cheerio.load(body);
		var data = [];
		body('.nutrition-table tbody tr td').each(function(nutrition) {
	   data.push(body(this).text().replace(/[^0-9.]/g, ''));
		});
		var formatted_name = name.replace(/[+]/g, '_');

		// Put Data into JSON
		dataObj[formatted_name] = {};
		dataObj[formatted_name].kcal = data[0];
		dataObj[formatted_name].fats = data[2];
		dataObj[formatted_name].carbs = data[4];
		dataObj[formatted_name].protein = data[6];

		// Callback
		writeToFile();
	});
};



function writeToFile() {
	// Stringify and save dataObj to file
	var json_string = JSON.stringify(dataObj);
	fs.appendFile(filename, json_string);
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
