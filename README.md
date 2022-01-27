ws-forms-recurrence
=================

A jQuery widget for specifying event recurrences in scheduling systems.

![screenshot](docs/screenshots/ws-forms-recurrence.png?raw=true)

## Installation

### Npm

	npm i ws-forms-recurrence --save

## Demo

Launch [sample.html](sample.html).

## Usage
```html
<script type="text/javascript" src="node_modules/jquery/dist/jquery.min.js"></script>
<!-- If using timezones include luxon library.
<script type="text/javascript" src="node_modules/luxon/build/global/luxon.min.js"></script>
-->
<script type="text/javascript" src="node_modules/ws-forms-recurrence/dist/ws-forms-recurrence.min.js"></script>
```

```javascript
// Initialization.
$('#container').wsFormsRecurrence(opts);

// Instance access
$('#container').data('ws.forms.recurrence');
```
Or
```javascript
// Directly create instance.
new ws.forms.Recurrence('#container', opts);
```

By default everything is in local time. If you want to create timezone based recurrences include the [luxon](https://github.com/moment/luxon/) library before ws-forms-recurrence script and pass an IANA timezone name in the recurrence options.

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
		dayNames: ['Su', 'Mo', 'Di', ...], // 0-based.

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
