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
	if (counter > 100) {
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
					var nutrition_data = [];
					$('.nutrition-table tbody tr td').each(function(something) {
				    nutrition_data.push($(this).text().replace(/[^0-9.]/g, ''));
					});
					var formatted_name = name.replace(/[+]/g, '_');
					var nutrition_json = {
						"kcal" : Math.ceil(nutrition_data[0] / 4.2),
						"fats" : nutrition_data[2],
						"carbs" : nutrition_data[4],
						"protein" : nutrition_data[6],
					};

					var data_json = {};
					data_json["prep_time"] = formatTime($('em[itemprop="prepTime"]').text());
					data_json["cook_time"] = formatTime($('em[itemprop="cookTime"]').text());
					data_json["total_time"] = data_json["prep_time"] + data_json["cook_time"];
					data_json["num_of_ingredients"] = $('.ingredientCount em').text();
					data_json["difficulty"] = $('.difficultyTitle em').text();
					data_json["servings"] = $('em[itemprop="recipeYield"]').text();
					data_json["rating"] = $('span[itemprop="ratingValue"]').text();

					var ingredients = [];
					$('label[itemprop="ingredients"]').each(function(something) {
				    ingredients.push($(this).text());
					});

					var instructions = [];
					$('p[itemprop="recipeInstructions"]').each(function(something) {
				    instructions.push($(this).text());
					});

					// Put Data into JSON Object
					dataObj[formatted_name] = {
						"link":url,
					};
					dataObj[formatted_name].nutrition = nutrition_json;
					dataObj[formatted_name].data = data_json;
					dataObj[formatted_name].ingredients = ingredients;
					dataObj[formatted_name].instructions = instructions;

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

					go();
				});
			}, Math.floor((Math.random() * 10000) + 1)
		);
		scraped.push(path);
		not_scraped.splice(0, 1);
	} else {

		var url = 'http://www.taste.com.au/search-recipes/?q=&sort=published&order=asc&page=' + page;
		page ++;

		setTimeout(
			function scrapeLinks() {
				request(url, function(err, resp, body) {
					// Check for Error
					if (err) {
						console.log('yo');
						console.log(err);
					  console.log('Error searching: ' + err);
						save();
						return;
					};

					// Look body into cheerio
					var $ = cheerio.load(body);

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

					counter ++;
					go();
				});
			}, Math.floor((Math.random() * 10000) + 1)
		);
	};
};

function formatTime(str) {
	var hours = parseInt(str.split(':')[0]);
	var minutes = parseInt(str.split(':')[1]);
	return hours * 60 + minutes;
};

function hajimete(str) {
	return _.indexOf(scraped, str) === -1 && _.indexOf(not_scraped, str) === -1;
};

function save() {
	console.log("Total # of Recipes scraped: " + _.size(dataObj));
	console.log("Finished scraping. Writing to File.");
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

		  	fs.readFile('page.txt', function (err, data) {
			  	if (err) {
			  		throw err;
			  		console.log('read page error');
			  	};
			  	page = JSON.parse(data);

			  	go();
				});
			});
		});
	});
};

function readJSON() {
	fs.readFile(filename, function (err, data) {
		if (err) {
		  throw err;
		  console.log('read recipes error');
		};
		dataObj = JSON.parse(data);
		console.log(dataObj);
	});
};

load();
//readJSON();

