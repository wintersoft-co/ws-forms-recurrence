(function($, DateTime) {

	$(function() {
		var timezone = 'Europe/Berlin',
				// Calculate midnight next month at timezone.
				nextMonth = DateTime.fromObject({}, { zone: timezone }).plus({ months: 1 }).startOf('day'),
				// Format midnight next month to RRule-timestamp-format at UTC timezone.
				until = nextMonth.toUTC().toFormat('yyyyLLdd\'T\'HHmmss\'Z\''),
				examples;

		examples = {
			'#recurrence-1': {
				// Restrict modes.
				//modes: ['weekly'],
			},
			'#recurrence-2': {
				recurrenceRule: 'RRULE:FREQ=MONTHLY;INTERVAL=2;UNTIL=' + until,
				timezone: timezone,

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
					dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],

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
			var $recurrence = $(selector).wsFormsRecurrence(opts),
					recurrence = $recurrence.data('ws.forms.recurrence');
			$recurrence.on('change', function() {
				var obj = recurrence.toRuleObj(),
						rule = recurrence.toRule();
				console.log('obj', obj);
				$recurrence.nextAll('.rrule').text(rule);
			});
			$recurrence.trigger('change');
		});
	});

})(jQuery, luxon.DateTime);
