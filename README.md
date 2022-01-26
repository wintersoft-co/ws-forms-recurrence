ws-forms-recurrence
=================

A jQuery widget for specifying event recurrences in scheduling systems.

![screenshot](docs/screenshots/ws-forms-recurrence.png?raw=true)

This plugin uses [jakubroztocil:rrule](https://jakubroztocil.github.io/rrule) to calculate the recurrence rules.

## Installation

### Npm

	npm i ws-forms-recurrence --save

## Demo

Launch [sample.html](sample.html).

## Usage
```javascript
// Initialization.
$('#container').wsFormsRecurrence(opts);

// Instance access
$('#container').data('plugin-wsFormsRecurrence');
```
Or
```javascript
// Directly create instance.
new ws.forms.Recurrence('#container', opts);
```

See [sample.html](sample.html) for more details.


## Default Options
```javascript
{
	// General settings.
	modes: ['weekly', 'monthly'],
	debounce: 200,
	cssPrefix: 'ws-form',
	timezone: null, // A valid IANA Timezone name.

	// Weekly settings.
	days: ['monday', 'tuesday', ...],
	minDays: 0,
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
```
