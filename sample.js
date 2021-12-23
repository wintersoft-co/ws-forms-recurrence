(function($) {

	$(function() {
		// Get date of current day within next month.
		var today = new Date(),
				nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
				examples;

		examples = {
			'#recurrence-1': {
				// Restrict modes.
				//modes: ['weekly'],
			},
			'#recurrence-2': {
				recurrenceRule: 'RRULE:FREQ=MONTHLY;INTERVAL=2;UNTIL=' + nextMonth.toISOString().replaceAll(/-|T.+/g, '') + 'T000000',
				timezone: 'Europe/Berlin',

				// Restrict to working days.
				days: [
					'monday',
					'tuesday',
					'wednesday',
					'thursday',
					'friday'
				],
				// Restrict selectable number of days.
				maxDays: 1,

				// Translations. Here german as an example.
				strings: {
					// Frequency.
					frequencyLabel: 'Häufigkeit',

					// Weekly.
					weekly: 'Wöchentlich',
					weeksLabel: 'Alle',
					weeksHint: 'Woche(n)',
					daysLabel: 'Am',
					dayNames: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],

					// Monthly.
					monthly: 'Monatlich',
					monthsLabel: 'Alle',
					monthsHint: 'Monat(e)',

					// Until.
					untilEnabledLabel: 'Wiederhole bis'
				}
			}
		};
		$.each(examples, function(selector, opts) {
			var $recurrence = $(selector).recurrence(opts),
					recurrence = $recurrence.data('plugin_recurrence');
			$recurrence.on('change', function () {
				var obj = recurrence.toObject(),
						rule = recurrence.toRule();
				console.log('obj', obj);
				$recurrence.next('.text').text(rule.toText().replace(/^\w/, function(m) {
					return m.toUpperCase();
				}));
				$recurrence.nextAll('.rrule').text(rule.toString());
			});
			$recurrence.trigger('change');
		});
	});

})(jQuery);
