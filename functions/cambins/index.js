'use strict';

var binScraper = require('./binTimeScraper');
var voiceFormatter = require('./binTimeVoiceFormatter');
var Alexa = require('alexa-sdk');
var _ = require('lodash');

const APP_ID = 'amzn1.ask.skill.6ef2339c-d9b3-4ad5-9100-1f62a4a2f98e';
const binTypes = ['green', 'blue', 'black'];

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
    'NextBinTimeForTypeIntent': function(){
        this.emit('GetNextBinTimeForType');
    },
    'GetNextBinTime': function () {
        binScraper.getNextBinsFromUprn('200004177341')
            .then(voiceFormatter.formatBinEntry)
            .then(emitTell.bind(this));
    },
    'GetNextBinTimeForType': function (type) {
        var type = this.event.request.intent.slots.BinType.value;

        if(!_.includes(binTypes, type)){
            this.emit(":tell", "Sorry, I didn't recognise the bin type " + type);
            return;
        }

        binScraper.getNextBinsFromUprnForType('200004177341', type)
            .then(voiceFormatter.formatBinEntry)
            .then(emitTell.bind(this));
    }
};

exports.handle = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
  	alexa.registerHandlers(handlers);
    alexa.execute();
};
