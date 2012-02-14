var base = require('./base');
var util = require('../util');

var Selector = base.baseConstructor();

util.extend(Selector.prototype, base.base, {
	name: "selector",

	toString: function () {
		this.debug('toString', this.list);
		var simpleSelectors = [];
		var building = "";

		var done = function () {
			if (building != "") {
				simpleSelectors.push(building);
				building = "";
			}
		};

		this.list.forEach(function (token) {
			switch (token.type) {
				case "S":
					done();
					break;

				case "COMBINATOR":
					done();
					building += token.content;
					done();
					break;

				default:
					building += token.content;
			}
		});

		done();
		return simpleSelectors.join(this.parser.options.selector_whitespace);
	}
});

exports.canStartWith = function (token, tokens, container) {
	switch (token.type) {
		case "ATTRIB":
		case "CLASS":
		case "COLON":
		case "COMBINATOR":
		case 'HASH':
		case 'IDENT':
			return true;
	}

	return false;
};

exports.parse = function (tokens, parser, container) {
	var selector = new Selector(parser, container);
	selector.debug('parse', tokens);
	var token = tokens.getToken();

	while (token.type == 'S' || exports.canStartWith(token)) {
		selector.add(token);

		if (token.type == "COMBINATOR") {
			token = tokens.nextToken();

			if (token.type == 'S') {
				selector.add(token);
				token = tokens.nextToken();
			}

			if (token.type == 'COMBINATOR' || ! exports.canStartWith(token)) {
				base.unexpectedToken("expected_selector_after_combinator", token);
			}
		} else if (token.type == 'COLON' || token.type == "COMBINATOR") {
			token = tokens.nextToken();

			if (token.type != 'IDENT') {
				base.unexpectedToken("expected_ident_after_ident", token);
			}
		} else {
			token = tokens.nextToken();
		}
	}

	return selector;
};