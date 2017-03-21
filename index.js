'use strict';

var binScraper = require('./binTimeScraper');

binScraper.getUpcomingBinsFromUprn('200004177341').then(console.log);
