/* eslint-disable  func-names */
/* eslint-disable  no-console */

'use strict';

const binScraper = require('./binTimeScraper');
const voiceFormatter = require('./binTimeVoiceFormatter');
const Alexa = require('ask-sdk');
const _ = require('lodash');

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
    return handlerInput.attributesManager.getPersistentAttributes()
      .then(attributes => {
        //TODO check uprn has been set
        return binScraper.getNextBinsFromUprn(attributes.uprn);
        //return binScraper.getNextBinsFromUprn('200004177341');
      })
      .then(voiceFormatter.formatBinEntry)
      .then(response => {
        return handlerInput.responseBuilder
          .speak(response)
          .reprompt(response)
          .getResponse();
      });
  },
};

const GetNextBinTimeForTypeHandler = {
  canHandle(handlerInput) {
    const requestType = handlerInput.requestEnvelope.request.type;
    const intentName = handlerInput.requestEnvelope.request.intent.name;

    if(requestType === 'LaunchRequest') return true;

    if (requestType === 'IntentRequest' && intentName === 'NextBinTimeForTypeIntent') {
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
    
    return handlerInput.attributesManager.getPersistentAttributes()
      .then(attributes => {
        //TODO check uprn has been set
        return binScraper.getNextBinsFromUprn(attributes.uprn, type);
        //return binScraper.getNextBinsFromUprn('200004177341', type);
      })
      .then(voiceFormatter.formatBinEntry)
      .then(response => {
        return handlerInput.responseBuilder
          .speak(response)
          .reprompt(response)
          .getResponse();
      });
  },
};

const SetUprnHandler = {
  canHandle(handlerInput) {
    const requestType = handlerInput.requestEnvelope.request.type;
    const intentName = handlerInput.requestEnvelope.request.intent.name;

    return requestType === 'IntentRequest' && intentName === 'SetUprnIntent';
  },
  handle(handlerInput) {
    if(handlerInput.requestEnvelope.request.dialogState != "COMPLETED") {
      // let the built in dialog model reprompt for the remaining info (this will be because the UPRN was not provided)
      return handlerInput.responseBuilder.addDelegateDirective().getResponse();
    }
    
    let uprnInput = handlerInput.requestEnvelope.request.intent.slots.Uprn.value;
    // TODO validate uprn
    return handlerInput.attributesManager.getPersistentAttributes()
      .then((attributes) => {
        attributes.uprn = uprnInput;
        handlerInput.attributesManager.setPersistentAttributes(attributes);
        return handlerInput.attributesManager.savePersistentAttributes();
      })
      .then(() => {
        return handlerInput.responseBuilder.speak('UPRN set').getResponse();
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
      .speak('Sorry, I can\'t understand the command. Try asking Cambridge Bins when the bins will be collected. ' + error.message)
      .reprompt('Sorry, I can\'t understand the command. Try asking Cambridge Bins when the bins will be collected.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNextBinTimeHandler,
    GetNextBinTimeForTypeHandler,
    SetUprnHandler,
    HelpIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withAutoCreateTable(true)
  .withTableName("cbins")
  .lambda();
