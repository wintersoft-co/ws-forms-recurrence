jquery-recurrence
=================

A jQuery widget for specifying event recurrences in scheduling systems.

![screenshot](docs/screenshots/jquery-recurrence.png?raw=true)

This plugin uses [aramk:rrule](https://github.com/aramk/rrule) to calculate the recurrence rules.

## Installation

### Npm

	npm i jquery-recurrence --save

## Demo

Launch [sample.html](sample.html).

## Usage
`
$('#container').recurrence(opts)
`

## Options
`
{
	// General settings.
	modes: ['weekly', 'monthly'],
	debounce: 200,
	cssPrefix: 'recurrence',

	// Weekly settings.
	days: ['monday', 'tuesday', ...],
	minDays: 1,
	maxDays: 7,

	strings: {
		// Frequency.
		frequencyLabel: 'Frequency',
		frequencyHint: null,

		// Weekly.
		weekly: 'Weekly',
		weeksLabel: 'Every',
		weeksHint: 'weeks(s)',
		daysLabel: 'On',
		daysHint: null,
		dayNames: ['Mo', 'Di', ...],

		// Monthly.
		monthly: 'Monthly',
		monthsLabel: 'Every',
		monthsHint: 'month(s)',

		// Until.
		untilLabel: null,
		untilHint: null,
		untilEnabledLabel: 'Until'
	}
}
`
