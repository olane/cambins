'use strict';

var _ = require('lodash');
var Promise = require("promise");
var request = require("request");
var $ = require("cheerio");

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

function scrapeBins (streetAddress, postcode){
	var url = 'http://bins.cambridge.gov.uk/bins.php?address=' + encodeURIComponent(streetAddress) + '&postcode=' + encodeURIComponent(postcode);

	return getPage(url).then(function (data) {
		let parsed = $.load(data);

		var elements = parsed("#bins-text-wrapper").prev().children().find('div');

		var parsedObjects = _.map(elements.toArray(), function(item){
			var div = $(item);

			var binColourText = getTextOfNode(div);
			var dateText = _.replace(div.find('b').html(), '<br>', ' ');
			
			return {
				binColourText: binColourText,
				dateText: dateText
			};
    	});

	    return parsedObjects;
	});
}

scrapeBins('109 Gwydir St', 'CB1 2LG').then(function(data){
	console.log(data);
});
