'use strict';

var chai = require('chai');
var Promise = require('promise');
var expect = chai.expect;
var _ = require('lodash');
var moment = require('moment');

var voiceFormatter = require('../binTimeVoiceFormatter');

describe('binTimeVoiceFormatter', function() {
	it('formats a black bin time today correctly', function(done){
		var binTime = {
			date: moment(),
			binTypes: ['black'],
			isRescheduled: false
		};

		expect(voiceFormatter.formatBinEntry(binTime)).to.be.equal('The black bins will be collected today.');
		done();
	});

	it('formats a blue and green bin time today correctly', function(done){
		var binTime = {
			date: moment(),
			binTypes: ['blue', 'green'],
			isRescheduled: false
		};

		expect(voiceFormatter.formatBinEntry(binTime)).to.be.equal('The blue and green bins will be collected today.');
		done();
	});

	it('formats a blue and green rescheduled bin time today correctly', function(done){
		var binTime = {
			date: moment(),
			binTypes: ['blue', 'green'],
			isRescheduled: true
		};

		expect(voiceFormatter.formatBinEntry(binTime)).to.be.equal('The blue and green bins will be collected today. This is a rescheduled collection.');
		done();
	});
});
