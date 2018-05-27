/* eslint-disable  func-names */
/* eslint-disable  no-console */

'use strict';

var binScraper = require('./binTimeScraper');
var voiceFormatter = require('./binTimeVoiceFormatter');
const Alexa = require('ask-sdk');
var _ = require('lodash');

const binTypes = ['green', 'blue', 'black'];

const GetNextBinTimeHandler = {
  canHandle(handlerInput) {
    const requestType = handlerInput.requestEnvelope.request.type;
    const intentName = handlerInput.requestEnvelope.request.intent.name;

    if(requestType === 'LaunchRequest') return true;

    if (requestType === 'IntentRequest' && intentName === 'NextBinTimeIntent') {
        return true;
    }
    
    return false;
  },
  handle(handlerInput) {
    return binScraper.getNextBinsFromUprn('200004177341')
        .then(voiceFormatter.formatBinEntry)
        .then(response => {
          return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
        });
  },
};

const GetNextBinTimeForTypeHandler = {
  canHandle(handlerInput) {
    const requestType = handlerInput.requestEnvelope.request.type;
    const intentName = handlerInput.requestEnvelope.request.intent.name;

    if(requestType === 'LaunchRequest') return true;

    if (requestType === 'IntentRequest' && intentName === 'NextBinTimeIntent') {
        return true;
    }
    
    return false;
  },
  handle(handlerInput) {
    var type = handlerInput.requestEnvelope.request.intent.slots.BinType.value;

    if(!_.includes(binTypes, type)){
        const response = "Sorry, I didn't recognise the bin type " + type;

        return handlerInput.responseBuilder
          .speak(response)
          .getResponse();
    }
    
    return binScraper.getNextBinsFromUprn('200004177341', type)
        .then(voiceFormatter.formatBinEntry)
        .then(response => {
          return handlerInput.responseBuilder
          .speak(response)
          .reprompt(response)
            .getResponse();
        });
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Try asking Cambridge Bins when the bins will be collected';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Try asking Cambridge Bins when the bins will be collected.')
      .reprompt('Sorry, I can\'t understand the command. Try asking Cambridge Bins when the bins will be collected.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNextBinTimeHandler,
    GetNextBinTimeForTypeHandler,
    HelpIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
