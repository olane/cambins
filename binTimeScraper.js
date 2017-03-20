'use strict';

var _ = require('lodash');
var Promise = require("promise");
var request = require("request");
var moment = require("moment");
var ical = require("ical.js");

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

var baseUrl = 'http://www.cambridge.gov.uk/binfeed.ical?';

function scrapeBinsFromUprn (uprn) {
	var url = baseUrl + 'uprn=' + encodeURIComponent(uprn);
	return scrapeBins(url);
}

function scrapeBinsFromAddress (streetAddress, postcode) {
	var url = baseUrl + 'address=' + encodeURIComponent(streetAddress) + '&postcode=' + encodeURIComponent(postcode);
	return scrapeBins(url);
}

var binTypeNames = ["black", "green", "blue"];
function getBinTypesFromSummary (summaryText) {
	return _.filter(binTypeNames, function(binTypeName){
		return _.includes(_.lowerCase(summaryText), binTypeName);
	});
}

function isRescheduled (summaryText) {
	return _.includes(_.lowerCase(summaryText), "rescheduled");
}

function scrapeBins (url) {
	return getPage(url).then(function (data) {
		let jcal = ical.parse(data);
		let component = new ical.Component(jcal);
		let events = _.map(component.getAllSubcomponents("vevent"), function(x){
			return new ical.Event(x);
		});

		return _.map(events, function(x){
			return {
				summary: x.summary,
				date: moment(x.startDate.toJSDate()),
				binTypes: getBinTypesFromSummary(x.summary),
				isRescheduled: isRescheduled(x.summary)
			}
		});
	});
}

scrapeBinsFromUprn('200004177341').then(function(data){
	console.log(data);
});
