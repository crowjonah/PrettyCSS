"use strict";
var assert = require('assert');
var tokenizer = require('../../../lib/tokenizer');
var unparsed = require('../../../lib/css/values/unparsed');
var vows = require('vows');

exports.makeVows = function (name, batches) {
	var obj = require('../../../lib/css/values/' + name);
	var batchRework = {};

	for (var i in batches) {
		batchRework[i] = testValue(name, obj, batches[i]);
	}

	return vows.describe('lib/css/' + name + '.js').addBatch(batchRework);
};

var tokensToStringArray = function (list) {
	var out = [];

	list.forEach(function (item) {
		out.push(item.type);
	});

	return out;
};

var warningsToStringArray = function (list) {
	var out = [];

	list.forEach(function (item) {
		out.push(item[0]);
	});

	return out;
};

var testValue = function (name, obj, expected) {
	expected.name = name;

	if (expected.toString === null) {
		expected.warnings = null;
		expected.name = null;
	}

	var context = {
		topic: function () {
			var valueString = this.context.name;
			var actualTokens = tokenizer.tokenize(valueString);
			var actualTokensStringArray = tokensToStringArray(actualTokens.tokens);
			var container = {};
			var parser = {
				debug: function () {},
				options: {
					functionComma: ", ",
					debug: false
				}
			};
			var unparsedReal = new unparsed.constructor(actualTokens.tokens, parser, container);
			var parseResult = obj.parse(unparsedReal, parser, container);
			var actual = {
				tokens: actualTokensStringArray,
				tokensAfter: tokensToStringArray(actualTokens.tokens)
			};

			if (parseResult) {
				actual.name = parseResult.name;
				actual.toString = parseResult.toString();
				actual.unparsed = tokensToStringArray(parseResult.unparsed.list);
				actual.warnings = warningsToStringArray(parseResult.warningList);
			} else {
				actual.name = null;
				actual.toString = null;
				actual.unparsed = actual.tokens;
				actual.warnings = null;
			}

			return actual;
		},

		'Name': function (actual) {
			assert.equal(actual.name, expected.name);
		},

		'ToString': function (actual) {
			assert.equal(actual.toString, expected.toString);
		},

		'Tokens': function (actual) {
			assert.deepEqual(actual.tokens, expected.tokens);
		},

		'Unparsed': function (actual) {
			assert.deepEqual(actual.unparsed, expected.unparsed);
		},

		'Warnings': function (actual) {
			assert.deepEqual(actual.warnings, expected.warnings);
		},

		'Tokens are not changed': function (actual) {
			assert.deepEqual(actual.tokensAfter, actual.tokens);
		}
	};

	return context;
};

