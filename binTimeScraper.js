'use strict';

var _ = require('lodash');
var Promise = require("promise");
var request = require("request");
var $ = require("cheerio");
var moment = require("moment");

var url = "https://raw.github.com/mikeal/request/master/package.json";

function getPage(url) {
    return new Promise(function (resolve, reject) {
        request({url:url}, function (err, res, body) {
            if (err) {
                return reject(err);
            } else if (res.statusCode !== 200) {
                err = new Error("Unexpected status code: " + res.statusCode);
                err.res = res;
                return reject(err);
            }
            resolve(body);
        });
    });
}

/*
Takes:
<div>
	foo
	<p>bar</p>
</div>

Returns 'foo'
*/
function getTextOfNode(node){
	return node.contents().filter(function() {
	    return this.type === 'text';
	}).text();
}
var baseUrl = 'http://bins.cambridge.gov.uk/bins.php?';

function scrapeBinsFromUprn (uprn) {
	var url = baseUrl + 'uprn=' + encodeURIComponent(uprn);
	return scrapeBins(url);
}

function scrapeBinsFromAddress (streetAddress, postcode) {
	var url = baseUrl + 'address=' + encodeURIComponent(streetAddress) + '&postcode=' + encodeURIComponent(postcode);
	return scrapeBins(url);
}

function scrapeBins (url) {
	return getPage(url).then(function (data) {
		let parsed = $.load(data);

		var elements = parsed("#bins-text-wrapper").prev().children().find('div');

		var parsedObjects = _.map(elements.toArray(), function(item){
			var div = $(item);

			var binColourText = getTextOfNode(div);

			var dateText = _.replace(div.find('b').html(), '<br>', ' ');
			var parsedDate = moment(dateText, 'dddd D MMMM');

			return {
				binColourText: binColourText,
				dateText: dateText,
				date: parsedDate.toDate()
			};
    	});

	    return parsedObjects;
	});
}

scrapeBinsFromAddress('16', 'CB2 8DP').then(function(data){
	console.log(data);
});
