'use strict';

var moment = require('moment');
var _ = require('lodash');

var calendarFormats = {
    lastDay : '[yesterday]',
    sameDay : '[today]',
    nextDay : '[tomorrow]',
    lastWeek : '[last] dddd',
    nextWeek : '[on] dddd',
    sameElse : '[on] dddd Do MMMM'
};

var formatBinEntry = function(binEntry){
	date = binEntry.date;
	binTypes = binEntry.binTypes;
	isRescheduled = binEntry.isRescheduled;

	var result = "The ";
	result += _.join(binTypes, " and ");
	result += " bins will be collected ";
	result += date.calendar(null, calendarFormats);
	result += ".";

	if(isRescheduled){
		result += "This is a rescheduled collection.";
	}

	return result;
};

module.exports = {
	formatBinEntry: formatBinEntry
};