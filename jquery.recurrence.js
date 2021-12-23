(function($, window) {
	'use strict';

	var pluginName = 'recurrence',
			RRule = window.rrule ? rrule.RRule : window.RRule,
			Plugin, Modes,
			defaults, days;

	days = {
		monday: { label: 'M', rule: RRule.MO },
		tuesday: { label: 'T', rule: RRule.TU },
		wednesday: { label: 'W', rule: RRule.WE },
		thursday: { label: 'T', rule: RRule.TH },
		friday: { label: 'F', rule: RRule.FR },
		saturday: { label: 'S', rule: RRule.SA },
		sunday: { label: 'S', rule: RRule.SU }
	},

	defaults = {
		// General settings.
		modes: ['weekly', 'monthly'],
		debounce: 200,
		cssPrefix: pluginName,
		timezone: null,

		// Weekly settings.
		days: Object.keys(days),
		//startDayOfWeek: 1,
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
			dayNames: Object.keys(days).map(function(day) { return day[0].toUpperCase() + day[1]; }),

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
			$field = $('<label class="' + pluginCls('field', 'field-weeks') + '"></label>')

			if (tx.weeksLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.weeksLabel + '</span>');

			$weeks = me.$weeks = $('<input type="number" min="1" pattern="/^\d+$/"/>');
			$weeks.val(lastValue = 1);
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
			$field = $('<label class="' + pluginCls('field', 'field-days') + '"></label>');

			if (tx.daysLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.daysLabel + '</span>');

			$days = $('<span class="' + pluginCls('field-element') + '"></span>');
			me.days = [];
			settings.days.forEach(function(name, day) {
				if (day = days[name]) {
					var $day = $('<button type="button" class="' + pluginCls('day-' + day.rule.weekday) + '">' + tx.dayNames[day.rule.weekday] + '</button>');
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

		toObject: function() {
			var me = this;
			return {
				weeks: parseInt(me.$weeks.val()),
				days: me.getSelectedDays()
			};
		},

		toRule: function() {
			var me = this,
					obj = me.toObject();
			return new RRule({
				freq: RRule.WEEKLY,
				interval: obj.weeks,
				byweekday: obj.days.map(function(name) {
					return days[name].rule;
				})
			});
		},

		fromRule: function(rule) {
			var me = this,
					options = rule.options,
					selectedDays = [];
			me.$weeks.val(options.interval);
			$.each(days, function(name, day) {
				if (options.byweekday.indexOf(day.rule.weekday) >= 0)
					selectedDays.push(name);
			});
			me.setSelectedDays(selectedDays);
		},

		isRule(rule) {
			return rule.options.freq === RRule.WEEKLY;
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
			$field = $('<label class="' + pluginCls('field', 'field-months') + '"></label>')

			if (tx.monthsLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.monthsLabel + '</span>');

			$months = me.$months = $('<input type="number" min="1" pattern="/^\d+$/"/>');
			$months.val(lastValue = 1);
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

		toObject: function() {
			return {
				months: parseInt(this.$months.val()),
			};
		},

		toRule: function() {
			var obj = this.toObject();
			return new RRule({
				freq: RRule.MONTHLY,
				interval: obj.months
			});
		},

		fromRule: function(rule) {
			var options = rule.options;
			this.$months.val(options.interval);
		},

		isRule(rule) {
			return rule.options.freq === RRule.MONTHLY;
		},
	};


	Plugin = function(element, options) {
		var me = this;
		me.element = element;
		me.$el = $(element);
		me.settings = jQuery.extend({}, defaults, options);
		me.settings.strings = jQuery.extend({}, defaults.strings, options.strings);
		me._name = pluginName;
		me.currentMode = null;
		me.init();
	}

	Plugin.prototype = {
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
			$el.addClass(pluginName);

			// Create frequency field.
			$field = $('<label class="' + pluginCls('field', 'field-frequency') + '"></label>')

			if (tx.frequencyLabel)
				$field.append('<span class="' + pluginCls('field-label') + '">' + tx.frequencyLabel + '</span>');

			$frequency = me.$frequency = $('<select></select>');
			$frequency.on('change', function() {
				var val = $frequency.val(),
						mode = me.modes[val];
				if (!mode)
					throw new Error('Unknown mode selected: ' + val);
				me.hideAll();
				mode.$el.show();
				me.currentMode = val;
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
			$until.val(d.toISOString().substring(0, 10)); // $until.val(moment().add(1, 'month').format('YYYY-MM-DD'));
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
			me.fromRule(settings.recurrenceRule || me.toRule().toString());
		},

		hideAll: function() {
			$.each(this.modes, function(_, mode) {
				mode.$el.hide();
			});
		},

		getMode: function(mode) {
			var me = this,
					modes = me.modes;
			return mode && modes[mode] || me.currentMode && modes[me.currentMode];
		},

		toObject: function() {
			var me = this,
					obj = me.getMode().toObject(),
					until;
			if (!me.$untilEnabled.is(':checked') || !(until = me.getUntilDate()))
				return obj;

			return $.extend({}, obj, {
				until: until
			});
		},

		toRule: function() {
			var me = this,
					tz = me.settings.timezone,
					rule = me.getMode().toRule(),
					until;
			if (!me.$untilEnabled.is(':checked') || !(until = me.getUntilDate()))
				return rule;

			return new RRule($.extend({}, rule.origOptions, {
				until: until,
				tzid: tz === null ? 'UTC' : null
			}));
		},

		fromRule: function(arg) {
			var me = this,
					rule = typeof arg === 'string' ? RRule.fromString(arg) : arg,
					modeKey, mode;
			if (!(rule instanceof RRule))
				throw new Error('Invalid argument - must be a string or RRule object: ' + arg);

			for (modeKey in me.modes) {
				mode = me.modes[modeKey];
				if (mode.isRule(rule)) {
					me.currentMode = modeKey;
					break;
				}
			}
			me.$untilEnabled
				.prop('checked', !!rule.origOptions.until)
				.trigger('change');
			if (rule.origOptions.until) {
				var d = new Date(rule.origOptions.until);
				me.$until.val(d.toISOString().substring(0, 10)); // this.$until.val(moment(rule.origOptions.until).format('YYYY-MM-DD'));
			}
			// TODO(aramk) Select the current mode based on the "freq" option of the rule.
			me.getMode().fromRule(rule);
			me.$frequency.val(me.currentMode).trigger('change');
			this._triggerChange();
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

			until = new Date(until + 'T00:00:00' + (tz === null ? 'Z' : ''));
			if (tz !== null) {
				// Use RRule timezone functionality to calculate until at given timezone.
				until = (new RRule({ dtstart: until, tzid: tz })).all(function(_, i) {
					return i < 1;
				})[0];
			}

			return until;
		},

		_triggerChange: function() {
			$(this.element).trigger('change');
		}

	};

	$.fn[pluginName] = function(options) {
		this.each(function() {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
		return this;
	};

})(jQuery, window);
