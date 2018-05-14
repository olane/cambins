'use strict';

var _ = require('lodash');
var Promise = require("promise");
var moment = require("moment");
var ical = require("ical.js");
var pageGetter = require("./pageGetter");

var baseUrl = 'https://www.cambridge.gov.uk/binfeed.ical?';

function scrapeBinsFromUprn (uprn) {
	var url = baseUrl + 'uprn=' + encodeURIComponent(uprn);
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
	return pageGetter.getPage(url).then(function (data) {
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

function orderByDate(list){
	return _.sortBy(list, x => x.date.valueOf());
}

function filterFutureOnly(list){
	// Filter anything earlier than midnight last night (it might be the day of the collection)
	return _.filter(list, x => x.date.isAfter(moment().startOf('day')))
}

function getNext(list){
	var futureOnly = filterFutureOnly(orderByDate(list));

	if(futureOnly.length === 0) {
		throw new Error("No collections found in the future");
	}

	return futureOnly[0];
}

function filterType(type, list) {
	return _.filter(list, x => _.includes(x.binTypes, type));
}

function getUpcomingBinsFromUprn(uprn){
	return scrapeBinsFromUprn(uprn)
		.then(orderByDate)
		.then(filterFutureOnly);
}

function getNextBinsFromUprn(uprn){
	return scrapeBinsFromUprn(uprn)
		.then(getNext);
}

function getNextBinsFromUprnForType(uprn, type){
	return scrapeBinsFromUprn(uprn)
		.then(filterType.bind(null, type))
		.then(getNext);
}

module.exports = {
	getUpcomingBinsFromUprn: getUpcomingBinsFromUprn,
	getNextBinsFromUprn: getNextBinsFromUprn,
	getNextBinsFromUprnForType: getNextBinsFromUprnForType
}
