#!/usr/bin/node

"use strict";
var prettycss = require('../lib/prettycss');
var fs = require('fs');
var filenames = process.argv;
filenames.shift(); // Remove "node"
filenames.shift(); // Remove current script
var count = 0;
var parseOptions = true;
var parseFiles = true;
var options = {
	debug: false,
	extendedInfo: false
};

for (var i = 0; i < filenames.length; i ++) {
	var parseThisFile = true;

	if (parseOptions) {
		parseThisFile = false;

		switch (filenames[i]) {
			case '--debug':
			case '-d':
				options.debug = true;
				break;

			case '--extended-info':
			case '-e':
				options.extendedInfo = true;
				break;

			case '--help':
			case '-h':
				help();
				parseOptions = false;
				parseFiles = false;
				break;

			case '--':
				parseOptions = false;
				break;

			default:
				parseThisFile = true;
				break;
		}
	}

	if (parseFiles && parseThisFile) {
		var stars = "************************************";
		var timeStart = new Date();
		var contents = fs.readFileSync(filenames[i], 'utf-8');
		var timeLoaded = new Date();
		var result = prettycss.parse(contents, options);
		var timeParsed = new Date();
		var resultString = result.toString();
		var timeToString = new Date();

		if (options.debug) {
			console.log('/' + stars + stars + '/');
		}

		console.log(resultString);

		if (options.extendedInfo) {
			var showProblem = function (problemInfo) {
				var msg = "\t" + problemInfo.code + "  ";

				if (problemInfo.token) {
					msg += problemInfo.token.type + " (" + problemInfo.token.toString() + ") on line " + problemInfo.token.line;
				} else {
					msg += "[no token]";
				}

				console.log(msg);
			};
			var formatTime = function (t) {
				var ms = t % 1000;
				var s = Math.floor(t / 1000);
				ms = ("00" + ms.toString()).substr(-3);
				return s + "." + ms + " sec";
			};

			console.log("");
			console.log("/" + stars + stars);
			console.log("");
			console.log("Extended Information:");
			console.log("\tInput size:  " + contents.length);
			console.log("\tOutput size:  " + resultString.length);
			console.log("\tTime to read file:  " + formatTime(timeLoaded - timeStart));
			console.log("\tTime to tokenize and parse:  " + formatTime(timeParsed - timeLoaded));
			console.log("\tTime to convert to a string:  " + formatTime(timeToString - timeParsed));
			console.log("");

			if (result.errors.length) {
				console.log("Errors:");
				result.errors.forEach(showProblem);
			} else {
				console.log("No errors detected.");
			}

			console.log("");

			if (result.warnings.length) {
				console.log("Warnings:");
				result.warnings.forEach(showProblem);
			} else {
				console.log("No warnings detected.");
			}

			console.log("");
			console.log(stars + stars + "/");
		}

		count ++;
	}
}

if (count === 0) {
	console.log('Please pass filenames on the command line');
}

function help() {
	console.log("Parse a CSS file");
	console.log("Options:");
	console.log(" -d = Debug mode");
	console.log(" -e = Extended info - appends a comment with errors/warnings");
	console.log(" -h = Help (what you are reading right now)");
}
