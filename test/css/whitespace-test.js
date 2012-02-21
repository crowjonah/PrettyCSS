var vows = require('vows');
var whitespace = require('../../lib/css/whitespace')
var util = require('./util');

vows.describe('lib/css/whitespace.js').addBatch({
	'whitespace.css': util.tokenizeFile({
		'whitespace.json': util.compareResult(whitespace)
	})
}).export(module);
