'use strict';

var binScraper = require('./binTimeScraper');
var voiceFormatter = require('./binTimeVoiceFormatter');
var Alexa = require('alexa-sdk');
var _ = require('lodash');

const APP_ID = 'amzn1.ask.skill.6ef2339c-d9b3-4ad5-9100-1f62a4a2f98e';
const binTypes = ['green', 'blue', 'black'];

// Note that the normal mode is that state is empty, and that the user is just issuing one-shot requests
var states = {
    SETUPRN: '_SETUPRN',     // User is trying to set their UPRN.
};

function emitTell(content){
	this.emit(":tell", content);
};

var newSessionHandlers = {
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
        //TODO get uprn from dynamodb
        binScraper.getNextBinsFromUprn('200004177341')
            .then(voiceFormatter.formatBinEntry)
            .then(emitTell.bind(this));
    },
    'GetNextBinTimeForType': function () {
        var type = this.event.request.intent.slots.BinType.value;

        if(!_.includes(binTypes, type)){
            this.emit(":tell", "Sorry, I didn't recognise the bin type " + type);
            return;
        }

        binScraper.getNextBinsFromUprnForType('200004177341', type)
            .then(voiceFormatter.formatBinEntry)
            .then(emitTell.bind(this));
    },
    'SetUprnIntent': function () {
        this.handler.state = states.SETUPRN;
        this.emit(':ask', 'What would you like to set your U.P.R.N. to? It should be a twelve digit number.');
    },
    'Unhandled': function() {
        this.emit(':tell', 'Sorry, I didn\'t get that. Try asking Cambridge Bins when the bins will be collected.');
    }
};

var setupUprnHandlers = Alexa.CreateStateHandler(states.SETUPRN, {
    'UprnIntent': function (){
        //TODO set uprn in dynamodb
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. What would you like to set your U.P.R.N. to? It should be a twelve digit number.');
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'What would you like to set your U.P.R.N. to? It should be a twelve digit number. You can find it on the Cambridge bins website in the URL for your address\'s bin schedule.');
    }
});

exports.handle = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers);
    alexa.registerHandlers(setupUprnHandlers);
    alexa.execute();
};
