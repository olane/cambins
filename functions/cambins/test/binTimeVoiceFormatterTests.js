'use strict';

var chai = require('chai');
var Promise = require('promise');
var expect = chai.expect;
var _ = require('lodash');
var moment = require('moment');
var sinon = require('sinon');

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

	describe('time based tests', function() {
		var clock;
		var currentTime = new Date('2017-04-08T01:10:00'); // Saturday 8th April

		before(function () {
			clock = sinon.useFakeTimers(currentTime);
		});

		after(function () {
			clock.restore();
		});

		it('formats a black bin collection on a day next week correctly', function(done){
			var binTime = {
				date: moment().add(2, 'days'),
				binTypes: ['black'],
				isRescheduled: false
			};

			expect(voiceFormatter.formatBinEntry(binTime)).to.be.equal('The black bins will be collected on Monday.');
			done();
		});

		it('formats a black bin collection on a day two weeks away correctly', function(done){
			var binTime = {
				date: moment().add(2, 'weeks'),
				binTypes: ['black'],
				isRescheduled: false
			};

			expect(voiceFormatter.formatBinEntry(binTime)).to.be.equal('The black bins will be collected on Saturday 22nd April.');
			done();
		});

		it('formats a black bin collection on a day next month correctly', function(done){
			var binTime = {
				date: moment().add(5, 'weeks').add(4, 'days'),
				binTypes: ['black'],
				isRescheduled: false
			};

			expect(voiceFormatter.formatBinEntry(binTime)).to.be.equal('The black bins will be collected on Wednesday 17th May.');
			done();
		});

		it('formats a black bin collection on a day next year correctly', function(done){
			var binTime = {
				date: moment().add(10, 'months'),
				binTypes: ['black'],
				isRescheduled: false
			};

			expect(voiceFormatter.formatBinEntry(binTime)).to.be.equal('The black bins will be collected on Thursday 8th February.');
			done();
		});
	});
});
