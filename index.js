'use strict';

var binScraper = require('./binTimeScraper');
var alexa = require('alexa-app');

var app = new alexa.app('binTimeScraper');

binScraper.getUpcomingBinsFromUprn('200004177341').then(console.log);
