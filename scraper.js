"use strict"

var request = require('request');
var cheerio = require('cheerio');
var fs = require("fs");
var filename = 'recipes.txt'
var _ = require('underscore');
var async = require('async');

var dataObj = {};
var base_url = 'http://www.taste.com.au/recipes/';
var scraped = [];
var not_scraped = [];
var counter = 0;
var page = 1;

function go() {
	var length = not_scraped.length;
	console.log("Not yet scraped links: " + length);
	if (counter > 5) {
		save();
	} else if (length) {
		var path = not_scraped[0];
		var name = path.split('/')[1];
		var url = base_url + path;
		console.log("Start scraping from " + url);
		setTimeout(

			function scrapeData() {
				request(url, function(err, resp, body) {
					// Check for Error
					if (err)
					  console.log(err);

					// Look body into cheerio
					var $ = cheerio.load(body);

					// Retrieve data from body
					var data = [];
					$('.nutrition-table tbody tr td').each(function(nutrition) {
				    data.push($(this).text().replace(/[^0-9.]/g, ''));
					});
					var formatted_name = name.replace(/[+]/g, '_');

					// Put Data into JSON
					dataObj[formatted_name] = {};
					dataObj[formatted_name].kcal = data[0];
					dataObj[formatted_name].fats = data[2];
					dataObj[formatted_name].carbs = data[4];
					dataObj[formatted_name].protein = data[6];

					// Retrieve links from body
					var links = [];
					for (var num = 0; num < 10; num++) {
						$('a[href^="http://www.taste.com.au/recipes/' + num + '"]').each(function(link) {
					    links.push($(this).attr('href').split('?')[0].split('recipes/')[1]);
						});
						$('a[href^="/recipes/' + num + '"]').each(function(link) {
					    links.push($(this).attr('href').split('?')[0].split('recipes/')[1]);
						});
					};
					// Update not_scraped with links that haven't been encountered before
					_.each(links, function(val) {
						if (hajimete(val)) {
							not_scraped.push(val);
						};
					});

					console.log("Finish scraping from " + url);
					counter ++;

					// Callback if there is one
					go();
				});
			}

			, Math.floor((Math.random() * 10000) + 1));
		scraped.push(path);
		not_scraped.splice(0, 1);
	} else {

		request(url, function(err, resp, body) {
			// Check for Error
			if (err)
			  console.log(err);

			// Look body into cheerio
			var $ = cheerio.load(body);

			// Retrieve data from body
			var data = [];
			$('.nutrition-table tbody tr td').each(function(nutrition) {
				  data.push($(this).text().replace(/[^0-9.]/g, ''));
			});
			var formatted_name = name.replace(/[+]/g, '_');

			// Put Data into JSON
			dataObj[formatted_name] = {};
			dataObj[formatted_name].kcal = data[0];
			dataObj[formatted_name].fats = data[2];
			dataObj[formatted_name].carbs = data[4];
			dataObj[formatted_name].protein = data[6];

			// Retrieve links from body
			var links = [];
			for (var num = 0; num < 10; num++) {
				$('a[href^="http://www.taste.com.au/recipes/' + num + '"]').each(function(link) {
			    links.push($(this).attr('href').split('?')[0].split('recipes/')[1]);
				});
				$('a[href^="/recipes/' + num + '"]').each(function(link) {
			    links.push($(this).attr('href').split('?')[0].split('recipes/')[1]);
				});
			};
			// Update not_scraped with links that haven't been encountered before
			_.each(links, function(val) {
				if (hajimete(val)) {
					not_scraped.push(val);
				};
			});
		});

		http://www.taste.com.au/search-recipes/?q=&sort=published&order=asc&page=1

		console.log("Finished scraping. Writing to File.");
		save();
	};
};



function hajimete(str) {
	return _.indexOf(scraped, str) === -1 && _.indexOf(not_scraped, str) === -1;
};

function save() {
	var json_string = JSON.stringify(dataObj);
	fs.writeFile(filename, json_string);
	var scraped_string = JSON.stringify(scraped);
	var not_scraped_string = JSON.stringify(not_scraped);
	fs.writeFile('scraped.txt', scraped_string);
	fs.writeFile('not_scraped.txt', not_scraped_string);
	var page_string = JSON.stringify(page);
	fs.writeFile('page.txt', page_string);
};

function load() {
	fs.readFile('scraped.txt', function (err, data) {
  	if (err) {
  		throw err;
  		console.log('read not_scraped error');
  	};
  	scraped = JSON.parse(data);

  	fs.readFile('not_scraped.txt', function (err, data) {
	  	if (err) {
	  		throw err;
	  		console.log('read not_scraped error');
	  	};
	  	not_scraped = JSON.parse(data);

	  	fs.readFile(filename, function (err, data) {
		  	if (err) {
		  		throw err;
		  		console.log('read recipes error');
		  	};
		  	dataObj = JSON.parse(data);

		  	go();
			});
		});
	});
};

load();
//setTimeout(function() { console.log('yo'); }, Math.floor((Math.random() * 10000) + 1));

