/* <template>
 *
 * Used by <display> for creating templates
 * [ <string> [ / <row-height> ]? ]+ <col-width>*
 */

var base = require('./value-base');
var colWidth = require('./col-width');
var rowHeight = require('./row-height');
var util = require('../../util');

var Template = base.baseConstructor();

util.extend(Template.prototype, base.base, {
	name: "template",

	toString: function () {
		var out = [];

		this.rows.forEach(function (rowDef) {
			var rowOut = "";
			rowDef.forEach(function (rowDefPart) {
				rowOut += rowDefPart.toString();
			});
			out.push(rowOut);
		});

		this.columns.forEach(function (colDef) {
			out.push(colDef.toString());
		});

		return out.join(' ');
	}
});

exports.parse = function (tokensReal, parser, container) {
	var template = new Template(parser, container);
	var tokens = tokensReal.slice(0);
	template.debug('parse', tokens);
	template.rows = [];
	template.columns = [];
	template.addWarning('working_draft', tokens[0]);

	// TODO:  Validate that number of columns are consistent
	// TODO:  Validate that there aren't more column widths than defined
	// TODO:  Should warn if fewer column widths are found (except 0 widths)
	// TODO:  If widths are all percentages, they must add to 100%, keeping
	// in mind that percentages are rounded
	// TODO:  Could trim * at end of column widths or add * to match columns
	while (tokens.length && tokens[0].type == 'STRING') {
		// <string>
		var rowDef = [ tokens.shift() ];

		if (tokens.length && tokens[0].type == 'S') {
			tokens.shift();
		}

		// Look for the "/" - we might need to undo this
		if (tokens.length && tokens[0].content == '/') {
			var slashToken = tokens.shift();
			var undo = [];
			undo.push(slashToken);

			if (tokens.length && tokens[0].type == 'S') {
				undo.push(tokens.shift());
			}

			var result = rowHeight.parse(tokens, parser, template);

			if (result) {
				// Successful row height parsing
				rowDef.push(slashToken);
				rowDef.push(result.value);
				template.add(result.value);  // for warnings
				template.rows.push(rowDef);
				tokens = result.tokens;
			} else {
				// Need to undo our changes to tokens
				while (undo.length) {
					tokens.unshift(undo.pop());
				}
			}
		} else {
			template.rows.push(rowDef);
		}
	}

	// Done parsing [ <string> [ / <row-height> ]? ]+
	if (template.rows.length == 0) {
		// Not a template - no strings found
		template.debug('parse fail');
		return null;
	}

	// Continue with <col-width>*
	var result = true;

	while (tokens.length && result) {
		result = colWidth.parse(tokens, parser, template);

		if (result) {
			template.columns.push(result.value);
			template.add(result.value); // for warnings
			tokens = result.tokens;
		}
	}

	template.debug('parse success', tokens);

	return {
		tokens: tokens,
		value: template
	};
};