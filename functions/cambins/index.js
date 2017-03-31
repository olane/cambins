'use strict';

var binScraper = require('./binTimeScraper');
var voiceFormatter = require('./binTimeVoiceFormatter');
var Alexa = require('alexa-sdk');

function emitTell(content){
	this.emit(":tell", content);
};

var handlers = {
	'LaunchRequest': function () {
        this.emit('GetUpcomingBinTimes');
    },
    'NextBinTimeIntent': function () {
        this.emit('GetUpcomingBinTimes');
    },
    'GetNextBinTime': function () {
		binScraper.getNextBinsFromUprn('200004177341')
			.then(voiceFormatter.formatBinEntry)
			.then(emitTell.bind(this));
    }
};

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
  	alexa.registerHandlers(handlers);
    alexa.execute();
};
