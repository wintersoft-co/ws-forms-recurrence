(function($) {

	$(function() {
		var constructArgs = {
			'#recurrence-1': {
			},
			'#recurrence-2': {
				maxDays: 1
			}
		};
		Object.keys(constructArgs).forEach(function(selector) {
			var $recurrence = $(selector).recurrence(constructArgs[selector]),
					recurrence = $recurrence.data('plugin_recurrence');
			$recurrence.on('change', function () {
				var obj = recurrence.toObject(),
						rule = recurrence.toRule();
				console.log('obj', obj);
				$recurrence.next('.text').text(rule.toText().replace(/^\w/, function(m) {
					return m.toUpperCase();
				}));
			});
			$recurrence.trigger('change');
		});
	});

})(jQuery);
