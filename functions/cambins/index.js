'use strict';

var binScraper = require('./binTimeScraper');
var voiceFormatter = require('./binTimeVoiceFormatter');
var Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.6ef2339c-d9b3-4ad5-9100-1f62a4a2f98e';

function emitTell(content){
	this.emit(":tell", content);
};

var handlers = {
	'LaunchRequest': function () {
        this.emit('GetNextBinTime');
    },
    'NextBinTimeIntent': function () {
        this.emit('GetNextBinTime');
    },
    'GetNextBinTime': function () {
		binScraper.getNextBinsFromUprn('200004177341')
			.then(voiceFormatter.formatBinEntry)
			.then(emitTell.bind(this));
    }
};

exports.handle = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
  	alexa.registerHandlers(handlers);
    alexa.execute();
};
