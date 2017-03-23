'use strict';

var chai = require('chai');
var Promise = require('promise');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var fs = require('fs');

var pageGetter = require('../pageGetter');

var icalResponsePromise = new Promise(function(resolve, reject){
	fs.readFile( __dirname + '/exampleResponse.ical', function (err, data) {
	  if (err) {
	    reject(err) 
	  }
	  resolve(data.toString());
	});
});

describe('binTimeScraper', function() {
	var binTimeScraper;

	before(function () {
		var getPageStub = sinon.stub(pageGetter, 'getPage');
		binTimeScraper = proxyquire('../binTimeScraper', { pageGetter: { getPage: getPageStub } } );

		getPageStub.withArgs('https://www.cambridge.gov.uk/binfeed.ical?uprn=0000000').returns(icalResponsePromise);
	})

	after(function () {
		pageGetter.getPage.restore();
	});

	it('parses the correct number of bin times', function(done) {
	 	binTimeScraper.getUpcomingBinsFromUprn('0000000').then(function(response){
	 		expect(response.length).to.be.equal(24);
	 		done();
	 	}).catch(function(err){done(err)});
	});
});
