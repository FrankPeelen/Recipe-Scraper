var request = require('request');
var cheerio = require('cheerio');

function saveInfoToFile(str) {
	if (str) { console.log("yo") };
	var kcal;
	var fats;
	var carbs;
	var protein;
	// Find Data
	//var nutrition_table = str.split("nutrition-table")[1].split("/table")[0];
	//var energy = nutrition_table.split("Energy")[1].split("/td")[0];
	//var fats = nutrition_table.split("Fat Total")[1].split("/td")[0];
	//var carbs = nutrition_table.split("Carbohydrate Total")[1].split("/td")[0];
	//var protein = nutrition_table.split("Protein")[1].split("/td")[0];
	//console.log(energy);
	//console.log(fats);
	//console.log(carbs);
	//console.log(protein);
	// Save Data

};

function scrape() {
	// Get Data

	// Save to File
	go();
};

function go() {
	var url = 'http://www.taste.com.au/recipes/26620/vegiladas+with+rice+and+corn+salad';
	request(url, function(err, resp, body) {
	  if (err)
	    throw err;
	  $ = cheerio.load(body);
	  $('.nutrition-table tbody tr td').each(function(nutrition) {
    	arr = $(this).text().replace(/[^0-9.]/g, '');
    	//one = arr[0];
    	//two = arr[1];
    	console.log(arr);
    	//console.log('one: ' + one);
    	//console.log('two: ' + two);
		});
	});
};

scrape();
