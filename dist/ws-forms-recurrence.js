(function($, window) {
	'use strict';

	var DateTime = window.luxon && window.luxon.DateTime,
			RecurrenceForm, Modes,
			defaults, days;

	days = {
		monday: { byday: 'MO', index: 1 },
		tuesday: { byday: 'TU', index: 2 },
		wednesday: { byday: 'WE', index: 3 },
		thursday: { byday: 'TH', index: 4 },
		friday: { byday: 'FR', index: 5 },
		saturday: { byday: 'SA', index: 6 },
		sunday: { byday: 'SU', index: 0 }
	},

	defaults = {
		// General settings.
		modes: ['weekly', 'monthly'],
		debounce: 200,
		cssPrefix: 'ws-form',
		timezone: null,

		// Weekly settings.
		days: Object.keys(days),
		//startDayOfWeek: 1,
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
			dayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Object.keys(days).map(function(day) { return day[0].toUpperCase() + day[1]; }),

			// Monthly.
			monthly: 'Monthly',
			monthsLabel: 'Every',
			monthsHint: 'month(s)',

			// Until.
			untilLabel: null,
			untilHint: null,
			untilEnabledLabel: 'Until'
		}
	};

	Modes = {
		weekly: function(plugin) {
			var me = this;
			me.plugin = plugin;
			me.init();
		},
		monthly: function(plugin) {
			var me = this;
			me.plugin = plugin;
			me.init();
		}
	};

	Modes.weekly.prototype = {
		init: function() {
			var me = this,
					plugin = me.plugin,
					settings = plugin.settings,
					tx = settings.strings,
					pluginCls = plugin.getCls.bind(plugin),
					$el, $weeks, $days, $field,
					lastValue,
					inputOnChange,
					changeTimeout;

			// Create wrapper.
			$el = me.$el = $('<div class="' + pluginCls('fieldset', 'fieldset-weekly') + '"></div>');

			// Create weeks field.
			$field = $('<label class="' + pluginCls('field', 'field-weeks') + '"></label>');

			if (tx.weeksLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.weeksLabel + '</span>');

			$weeks = me.$weeks = $('<input type="number" min="1" pattern="/^\d+$/"/>');
			//$weeks.val(lastValue = 1);
			// Set initial value using attr() to prevent clearing during form reset.
			$weeks.attr('value', lastValue = 1);
			inputOnChange = function(e) {
				var value = $weeks.val().replace(/[^\d]/g, '');
				$weeks.val(value);
				if (lastValue !== value)
					plugin._triggerChange();
				lastValue = value;
				// Prevent change event from bubbling since we handle that manually in onChange.
				e && e.stopPropagation();
			};
			$weeks.on('change', inputOnChange);
			$weeks.on('keyup', function() {
				clearTimeout(changeTimeout);
				changeTimeout = setTimeout(inputOnChange, settings.debounce);
			});
			$('<span class="' + pluginCls('field-element') + '"></span>')
				.append($weeks)
				.appendTo($field);

			if (tx.weeksHint)
				$field.append('<span class="' + pluginCls('field-hint') + '">' + tx.weeksHint + '</span>');
			$el.append($field);

			// Create days field.
			$field = $('<div class="' + pluginCls('field', 'field-days') + '"></div>');

			if (tx.daysLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.daysLabel + '</span>');

			$days = $('<span class="' + pluginCls('field-element') + '"></span>');
			me.days = [];
			settings.days.forEach(function(name, day) {
				if (day = days[name]) {
					var $day = $('<button type="button" class="' + pluginCls('day-' + day.index) + '">' + tx.dayNames[day.index] + '</button>');
					$day.on('click', function() {
						var maxDays = plugin.settings.maxDays,
								selectedDays = me.getSelectedDays(),
								newDays = selectedDays.filter(function(dayName) {
							return dayName != name;
						});
						if (newDays.length == selectedDays.length)
							newDays.push(name);

						// If new selection exceeds limit, remove first selection.
						if (newDays.length > maxDays)
							newDays.shift();

						if (me.setSelectedDays(newDays))
							plugin._triggerChange();
					});
					$days.append($day);
					me.days.push({
						name: name,
						selected: false,
						$el: $day
					});
				}
			});
			$field.append($days);
			$el.append($field);

			if (tx.daysHint)
				$field.append('<span class="' + pluginCls('field-hint') + '">' + tx.daysHint + '</span>');

			$el.append($field);
		},

		getSelectedDays: function() {
			var me = this,
					selectedDays = [];
			me.days.forEach(function(day) {
				if (day.selected)
					selectedDays.push(day.name);
			});
			return selectedDays;
		},

		setSelectedDays: function(selectedDays) {
			var me = this;
			if (!me.isValidDays(selectedDays)) {
				console.warn('Invalid days set: [' + selectedDays + ']');
				return false;
			}
			me.days.forEach(function(day) {
				day.selected = selectedDays.indexOf(day.name) > -1;
				day.$el.toggleClass(me.plugin.getCls('active'), day.selected);
			});
			return true;
		},

		toRuleObj: function() {
			var me = this,
					obj, byday;
			byday = me.getSelectedDays().map(function(name) {
				return days[name].byday;
			});
			obj = {
				freq: 'WEEKLY',
				interval: parseInt(me.$weeks.val())
			};
			if (byday.length)
				obj.byday = byday;
			return obj;
		},

		fromRuleObj: function(rule) {
			var me = this,
					selectedDays = [];
			me.$weeks.val(rule.interval);
			rule.byday && $.each(days, function(name, day) {
				if (rule.byday.indexOf(day.byday) > -1)
					selectedDays.push(name);
			});
			me.setSelectedDays(selectedDays);
		},

		isRule: function(rule) {
			return rule.freq === 'WEEKLY';
		},

		isValidDays: function(days) {
			var me = this,
					settings = me.plugin.settings,
					minDays = settings.minDays,
					maxDays = settings.maxDays;
			return (
				(typeof minDays !== 'number' || days.length >= minDays) &&
				(typeof maxDays !== 'number' || days.length <= maxDays)
			);
		}
	};


	Modes.monthly.prototype = {
		init: function() {
			var me = this,
					plugin = me.plugin,
					settings = plugin.settings,
					tx = settings.strings,
					pluginCls = plugin.getCls.bind(plugin),
					$el, $months, $field,
					lastValue,
					inputOnChange,
					changeTimeout;

			// Create wrapper.
			$el = me.$el = $('<div class="' + pluginCls('fieldset', 'fieldset-monthly') + '"></div>');

			// Create weeks field.
			$field = $('<label class="' + pluginCls('field', 'field-months') + '"></label>');

			if (tx.monthsLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.monthsLabel + '</span>');

			$months = me.$months = $('<input type="number" min="1" pattern="/^\d+$/"/>');
			//$months.val(lastValue = 1);
			// Set initial value using attr() to prevent clearing during form reset.
			$months.attr('value', lastValue = 1);
			inputOnChange = function(e) {
				var value = $months.val().replace(/[^\d]/g, '');
				$months.val(value);
				if (lastValue !== value)
					plugin._triggerChange();
				lastValue = value;
				// Prevent change event from bubbling since we handle that manually in onChange.
				e && e.stopPropagation();
			};
			$months.on('change', inputOnChange);
			$months.on('keyup', function() {
				clearTimeout(changeTimeout);
				changeTimeout = setTimeout(inputOnChange, settings.debounce);
			});
			$('<span class="' + pluginCls('field-element') + '"></span>')
				.append($months)
				.appendTo($field);

			if (tx.monthsHint)
				$field.append('<span class="' + pluginCls('field-hint') + '">' + tx.monthsHint + '</span>');
			$el.append($field);
		},

		toRuleObj: function() {
			return {
				freq: 'MONTHLY',
				interval: parseInt(this.$months.val())
			};
		},

		fromRuleObj: function(rule) {
			this.$months.val(rule.interval);
		},

		isRule: function(rule) {
			return rule.freq === 'MONTHLY';
		}
	};


	RecurrenceForm = function(element, opts) {
		var me = this;
		me.$el = $(element);
		me.element = me.$el[0];
		me.settings = jQuery.extend({}, defaults, opts);
		me.settings.strings = jQuery.extend({}, defaults.strings, opts.strings);
		me.currentMode = null;
		me.init();
	}

	RecurrenceForm.prototype = {
		modes: null,

		init: function() {
			var me = this,
					settings = me.settings,
					tx = settings.strings,
					pluginCls = me.getCls.bind(me),
					$el = me.$el,
					$field,
					$frequency, $until, $untilEnabled,
					d, m;
			$el.addClass(pluginCls('wrap', 'wrap-recurrence'));

			// Create frequency field.
			$field = $('<label class="' + pluginCls('field', 'field-frequency') + '"></label>')

			if (tx.frequencyLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.frequencyLabel + '</span>');

			$frequency = me.$frequency = $('<select></select>');
			$frequency.on('change', function() {
				var value = $frequency.val();
				if (!me.modes[value])
					throw new Error('Unknown mode selected: ' + value);
				$.each(me.modes, function(name, mode) {
					mode.$el.toggle(name === value);
				});
				// mode.$el.show();
				me.currentMode = value;
			});
			$('<span class="' + pluginCls('field-element') + '"></span>')
				.append($frequency)
				.appendTo($field);

			if (tx.frequencyHint)
				$field.append('<span class="' + pluginCls('field-hint') + '">' + tx.frequencyHint + '</span>');
			$el.append($field);

			// Create frequency mode fieldsets.
			me.modes = {};
			settings.modes.forEach(function(name) {
				var mode = new Modes[name](me),
						$modeEl = mode.$el;
				$modeEl.hide()
				$el.append($modeEl);
				$frequency.append('<option value="' + name + '">' + tx[name] + '</option>');
				me.modes[name] = mode;
			});
			// Hide frequeny select if only one frequency configured.
			if (settings.modes.length < 2)
				$field.hide();

			// Create until field.
			$field = $('<label class="' + pluginCls('field', 'field-until') + '"></label>')

			if (tx.untilLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.untilLabel + '</span>');

			$untilEnabled = me.$untilEnabled = $('<input type="checkbox"/>');
			$until = me.$until = $('<input type="date"/>');

			// Initialize until to next month.
			d = new Date();
			m = d.getMonth() + 1;
			if (m > 11)
				d.setFullYear(d.getFullYear() + 1);
			d.setMonth(m % 12);
			//$until.val(d.toISOString().substring(0, 10)); // $until.val(moment().add(1, 'month').format('YYYY-MM-DD'));
			// Set initial value using attr() to prevent clearing during form reset.
			$until.attr('value', d.toISOString().substring(0, 10)); // $until.val(moment().add(1, 'month').format('YYYY-MM-DD'));
			$untilEnabled.on('change', function() {
				$until.toggle($untilEnabled.is(':checked'));
			});
			$untilEnabled.trigger('change');

			$('<span class="' + pluginCls('field-element') + '"></span>')
				.append($untilEnabled)
				.append(tx.untilEnabledLabel && ('<span class="' + pluginCls('field-label') + '">' + tx.untilEnabledLabel + '</span>'))
				.append($until)
				.appendTo($field);

			if (tx.untilHint)
				$field.append('<span class="' + pluginCls('field-hint') + '">' + tx.untilHint + '</span>');
			$el.append($field);

			// Ensure initial state is consistent.
			$frequency.trigger('change');
			me.fromRule(settings.recurrenceRule || me.toRule());
		},

		getMode: function(mode) {
			var me = this,
					modes = me.modes;
			return mode && modes[mode] || me.currentMode && modes[me.currentMode];
		},

		toRuleObj: function() {
			var me = this,
					rule = me.getMode().toRuleObj(),
					until;
			if (me.$untilEnabled.is(':checked') && (until = me.getUntilDate()))
				rule.until = until;

			return rule;
		},

		toRule: function() {
			var me = this,
					rule = me.toRuleObj(),
					until = rule.until,
					parts = [];
			if (until)
				rule.until = until.toISOString().substr(0, 19).replace(/-|:/g, '') + 'Z';

			$.each(rule, function(k, v) {
				if (k === 'byday')
					v = v.join(',');
				if (v)
					parts.push(k.toUpperCase() + '=' + v);
			});
			return 'RRULE:' + parts.join(';');
		},

		fromRule: function(arg) {
			var me = this,
					modeKey, mode, obj;

			// Parse RRule.
			// e.g.: RRULE:FREQ=WEEKLY;INTERVAL=5;BYDAY=MO,FR;UNTIL=20221231T000000
			obj = {
				freq: null,
				interval: null
			};
			arg = arg.toUpperCase();
			if (arg.indexOf('RRULE:') === 0)
				arg = arg.slice(6);
			arg.split(';').forEach(function(part, k, v) {
				part = part.split('=');
				k = part[0].toLowerCase();
				v = part[1];
				if (k === 'byday')
					v = v.split(',');
				else if (k === 'until') {
					v = Array.prototype.slice.call(v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/), 1, 7).map(function(d) {
						return parseInt(d);
					});
					// Months are 0 bases. WTF?!?
					v[1]--;
					v = new Date(Date.UTC.apply(Date.UTC, v));
				}
				obj[k] = v;
			});

			for (modeKey in me.modes) {
				mode = me.modes[modeKey];
				if (mode.isRule(obj)) {
					me.currentMode = modeKey;
					break;
				}
			}
			me.setUntilDate(obj.until);
			me.getMode().fromRuleObj(obj);
			me.$frequency.val(me.currentMode).trigger('change');
			me._triggerChange();
		},

		/**
		 * Get prefixed css class name from given name(s).
		 *
		 * @param {...String} name Single class name or array of such.
		 * @returns {String} The prefixed class name for given name(s).
		 */
		getCls: function(/* names */) {
			var cssPrefix = this.settings.cssPrefix;
			return Array.prototype.slice.call(arguments).map(function(name) {
				return cssPrefix + '-' + name;
			}).join(' ');
		},

		getUntilDate: function() {
			var me = this,
					tz = me.settings.timezone,
					until;
			if (!me.$untilEnabled.is(':checked') || !(until = me.$until.val()))
				return null;

			until = until + 'T00:00:00';
			// Check if timezone is present and luxon is available.
			if (tz && DateTime) {
				until = DateTime.fromISO(until, { zone: tz }).toJSDate();
			}
			// Fallback to native javascript dates.
			else {
				until = new Date(until);
			}

			return until;
		},

		/**
		 * Set until date.
		 *
		 * @param {String|Date|DateTime} until Until date as Date like object or string representation.
		 */
		 setUntilDate: function(until) {
			var me = this,
					tz = me.settings.timezone,
					isUntilEnabled = me.$untilEnabled.is(':checked'),
					opts, value;

			if (!until) {
				if (isUntilEnabled) {
					me.$untilEnabled
						.prop('checked', false)
						.trigger('change');
				}
				return;
			}

			// Check if timezone is present and luxon is available.
			if (tz && DateTime) {
				opts = { zone: tz };
				until = DateTime.isDateTime(until) ? until : (typeof until == 'string' ? DateTime.fromISO(until, opts) : DateTime.fromMillis(until.getTime(), opts));
				value = until.toFormat('yyyy-LL-dd');
			}
			// Fallback to native javascript dates.
			else {
				until = new Date(until);
				value = until.getFullYear() + '-' + ('0' + until.getMonth()).slice(-2) + '-' + ('0' + until.getDate()).slice(-2);
			}
			me.$until.val(value);

			if (!isUntilEnabled) {
				me.$untilEnabled
					.prop('checked', true)
					.trigger('change');
			}
		},

		_triggerChange: function() {
			$(this.element).trigger('change');
		}

	};

	// Register as jQuery plugin.
	$.fn.wsFormsRecurrence = function(opts) {
		this.each(function() {
			var me = this,
					dataKey = 'ws.forms.recurrence';
			if (!$.data(me, dataKey))
				$.data(me, dataKey, new RecurrenceForm(me, opts));
		});
		return this;
	};

	// Register ws namespace.
	var ns = window.ws = (window.ws || {});
	ns.forms = $.extend(ns.forms || {}, {
		Recurrence: RecurrenceForm
	});

})(jQuery, window);
