'use strict';

var chai = require('chai');
var Promise = require('promise');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var fs = require('fs');
var _ = require('lodash');

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

	it('returns parsed bin times in time order', function(done) {
	 	binTimeScraper.getUpcomingBinsFromUprn('0000000').then(function(response){
	 		var lastDate;

	 		_.each(response, function(x){
	 			if(lastDate){
	 				var assertionMessage = lastDate.format() + ' is before ' + x.date.format();
	 				expect(lastDate.isBefore(x.date), assertionMessage).to.be.equal(true);
	 			}
 				lastDate = x.date;
	 		});

	 		done();
	 	}).catch(function(err){done(err)});
	});

	it('returns some of all bin types', function(done) {
	 	binTimeScraper.getUpcomingBinsFromUprn('0000000').then(function(response){
	 		var seenBinTypes = {
	 			'blue' : false,
	 			'green': false,
	 			'black': false
	 		};

	 		_.each(response, function(x){
	 			_.each(x.binTypes, function(binType){
 					seenBinTypes[binType] = true;
	 			});
	 		});

	 		_.forOwn(seenBinTypes, function(value, key){
	 			expect(value, 'Seen ' + key).to.be.equal(true);
	 		})

	 		done();
	 	}).catch(function(err){done(err)});
	});

	it('finds at least one rescheduled time', function(done) {
	 	binTimeScraper.getUpcomingBinsFromUprn('0000000').then(function(response){
	 		var foundRescheduledTimes = false;

	 		_.each(response, function(x){
	 			if(x.isRescheduled){
	 				foundRescheduledTimes = true;
	 			}
	 		});

			expect(foundRescheduledTimes, 'found rescheduled times').to.be.equal(true);
			done();
	 	}).catch(function(err){done(err)});
	});
});
