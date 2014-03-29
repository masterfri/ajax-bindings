(function($) {
	
	function replaceElement(oldelement, newelement) {
		var overlay = oldelement.data('overlay');
		oldelement.replaceWith(newelement);
		if (overlay) {
			oldelement.data('overlay', null);
			if (overlay.attr('role') == 'cover') {
				coverElement(newelement, overlay);
				hideCover(overlay);
			} else {
				hideIndicator(overlay);
			}
		}
	}
	
	function updateSelf(context, response, options) {
		var id, data, content = $('<div></div>').append(response);
		if (options.destination) {
			context = $(options.destination);
		}
		if (options.source) {
			data = content.find(options.source);
			replaceElement(context, data);
			return;
		}
		if (id = context.attr('id')) {
			data = content.find('#' + id);
			if (data.length) {
				replaceElement(context, data);
				return;
			}
		}
		data = content.find('[data-marker=ajax-body]');
		replaceElement(context, data.length ? data : content.children());
	}
	
	function handleRequest(context, response, options) {
		var modal = false, popover = false;
		if ((modal = context.closest('.modal')).length == 0) {
			modal = false;
			if ((popover = context.closest('.popover')).length == 0) {
				popover = false;
			}
		}
		if (typeof response == 'string' && response.indexOf('{') !== 0) {
			if (modal) {
				if (options.destination) {
					updateSelf(context, response, options);
					modal.modal('hide');
				} else {
					updateModal(modal, response, options);
				}
			} else if (popover) {
				if (options.destination) {
					var context = popover.data('bs.popover').$element;
					context.popover('destroy');
				} else {
					updatePopover(popover, response, options);
				}
			} else {
				updateSelf(context, response, options);
			}
		} else {
			if (typeof response == 'string') {
				response = $.parseJSON(response);
			}
			if (response.trigger) {
				$(document.body).trigger(response.trigger, [response]);
				$('[data-update-after~="' + response.trigger + '"]').ajaxUpdate();
			}
			if (response.redirect) {
				location.href = response.redirect;
			}
			if (modal) {
				modal.modal('hide');
			} else if (popover) {
				var context = popover.data('bs.popover').$element;
				context.popover('destroy');
			}
		}
	}
	
	function createModal(title) {
		var modal = $(
			'<div class="modal fade">' +
				'<div class="modal-dialog">' +
					'<div class="modal-content">' +
						'<div class="modal-header panel-gray">' + 
							'<button type="button" class="close btn btn-success" data-dismiss="modal" aria-hidden="true"><span class="glyphicon glyphicon-remove"></span></button>' +
							'<h3 class="modal-title"></h3>' +
						'</div>' +
						'<div class="modal-body" data-submitting="ajax-modal">' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>');
		$(document.body).append(modal);
		if (title) {
			modal.find('.modal-title').text(title);
		}
		modal.modal({show: true});
		modal.on('hidden.bs.modal', function() {
			modal.remove();
		});
		return modal;
	}
	
	function updateModal(modal, response, options) {
		var body = modal.find('.modal-body');
		var title = modal.find('.modal-title');
		updateBodyTitle(body, title, response, options);
	}
	
	function updatePopover(tip, response, options) {
		var body = tip.find('.popover-content');
		var title = tip.find('.popover-title');
		updateBodyTitle(body, title, response, options);
		setTimeout(function() {
			adjustPopover(tip);
		}, 0);
	}
	
	function updateBodyTitle(body, title, response, options) {
		var content = $('<div></div>').append(response);
		var data;
		body.html('');
		if (options.source) {
			data = content.find(options.source);
			body.append(data);
		} else {
			data = content.find('[data-marker=ajax-body]');
			body.append(data.length ? data : content.children());
		}
		if (options.titleSource) {
			data = content.find(options.titleSource);
			if (data.length) {
				title.text(data.text());
			}
		} else {
			data = content.find('[data-marker=ajax-title]');
			if (data.length) {
				title.text(data.text());
			}
		}
	}
	
	function adjustPopover(tip) {
		var popover = tip.data('bs.popover');
		var pos = popover.getPosition();
		var actualWidth  = tip[0].offsetWidth;
		var actualHeight = tip[0].offsetHeight;
		var calculatedOffset = popover.getCalculatedOffset(popover.options.placement, pos, actualWidth, actualHeight);
		popover.applyPlacement(calculatedOffset, popover.options.placement);
	}
	
	function addBlockUIClass(element, base, suffix) {
		element.addClass(base);
		element.addClass(base + '-' + suffix);
	}
	
	function removeBlockUIClass(element, base, suffix) {
		element.removeClass(base);
		element.removeClass(base + '-' + suffix);
	}
	
	function coverBody(overlay) {
		overlay.css({
			'position': 'fixed',
			'top': 0,
			'right': 0,
			'bottom': 0,
			'left': 0,
			'z-index': 99999
		});
	}
	
	function coverElement(element, overlay) {
		var el = element.get(0);
		var pos = $.extend({}, typeof el.getBoundingClientRect == 'function' ? el.getBoundingClientRect() : {
			'width': el.offsetWidth, 
			'height': el.offsetHeight
		}, element.offset());
		var zp, z = 10;
		element.parents().each(function() {
			zp = $(this).css('z-index');
			if (!isNaN(zp) && zp >= z) {
				z = zp + 10;
			}
		});
		overlay.css({
			'position': 'absolute',
			'width': pos.width,
			'height': pos.height,
			'z-index': z
		}).offset(pos)
	}
	
	function showCover(overlay) {
		var options = overlay.data('overlay-options');
		if (options && options.animateCover) {
			overlay.fadeIn(options.animateCover);
		} else {
			overlay.show();
		}
	}
	
	function hideCover(overlay) {
		var options = overlay.data('overlay-options');
		if (options && options.animateCover) {
			overlay.fadeOut(options.animateCover, function() {
				overlay.remove();
			});
		} else {
			overlay.remove();
		}
	}
	
	function showIndicator(overlay) {
		var options = overlay.data('overlay-options');
		if (options && options.animateIndicator) {
			overlay.fadeIn(options.animateIndicator);
		} else {
			overlay.show();
		}
	}
	
	function hideIndicator(overlay) {
		var options = overlay.data('overlay-options');
		if (options && options.animateIndicator) {
			overlay.fadeOut(options.animateIndicator, function() {
				overlay.remove();
			});
		} else {
			overlay.remove();
		}
	}
	
	function configureAjax(context, params) {
		var settings = {};
		if (context.is('form')) {
			settings.type = (context.attr('method') || 'GET').toUpperCase();
			settings.data = context.serialize();
			settings.url = context.get(0).action;
		} else if (context.is('a')) {
			settings.url = context.get(0).href;
		} else {
			settings.url = location.href;
		}
		return $.extend(settings, params || {});
	}

	$.fn.ajaxUpdate = function(options) {
		this.each(function() {
			var thiz = $(this);
			var opts = $.extend({}, $.ajaxBindings.defaults.ajaxUpdate, thiz.data());
			if (typeof options == 'object') {
				opts = $.extend(opts, options);
			} else if (typeof options == 'string') {
				opts.url = options;
			} else if (typeof options == 'function') {
				opts.ondone = options;
			}
			if (typeof opts.blockui == 'object' || (opts.blockui != 'none' && opts.blockui !== false)) {
				thiz.blockUI(typeof opts.blockui == 'object' ? opts.blockui : {'mode': opts.blockui});
			}
			$.ajax(opts.url, {'dataType' : 'html'})
				.done(function(response) {
					updateSelf(thiz, response, opts);
					opts.ondone(thiz, response, opts);
				})
				.error(function() {
					opts.onerror(thiz, opts);
				})
				.complete(function() {
					thiz.unblockUI();
				});
		});
	}
	
	$.fn.ajaxRequest = function(options) {
		this.each(function() {
			var thiz = $(this);
			var opts = $.extend({}, $.ajaxBindings.defaults.ajaxRequest, thiz.data());
			if (typeof options == 'object') {
				opts = $.extend(opts, options);
			} else if (typeof options == 'string') {
				opts.url = options;
			} else if (typeof options == 'function') {
				opts.ondone = options;
			}
			if (!opts.confirmation || confirm(opts.confirmation)) {
				var settings = configureAjax(thiz, opts.url ? {'url': opts.url} : {});
				if (typeof opts.blockui == 'object' || (opts.blockui != 'none' && opts.blockui !== false)) {
					thiz.blockUI(typeof opts.blockui == 'object' ? opts.blockui : {'mode': opts.blockui});
				}
				$.ajax(settings)
					.done(function(response) {
						handleRequest(thiz, response, opts);
						opts.ondone(thiz, response, opts);
					})
					.error(function() {
						opts.onerror(thiz, opts);
					})
					.complete(function() {
						thiz.unblockUI();
					});
			}
		});
	}
	
	$.fn.ajaxModal = function(options) {
		this.each(function() {
			var thiz = $(this);
			var opts = $.extend({}, $.ajaxBindings.defaults.ajaxModal, thiz.data());
			if (typeof options == 'object') {
				opts = $.extend(opts, options);
			} else if (typeof options == 'string') {
				opts.url = options;
			} else if (typeof options == 'function') {
				opts.ondone = options;
			}
			var modal = createModal(opts.title);
			if (typeof opts.blockui == 'object' || (opts.blockui != 'none' && opts.blockui !== false)) {
				modal.find('.modal-body').blockUI(typeof opts.blockui == 'object' ? opts.blockui : {'mode': opts.blockui});
			}
			var settings = configureAjax(thiz, opts.url ? {'url': opts.url} : {}, {'dataType' : 'html'});
			modal.addClass(opts.loadingCssClass);
			$.ajax(settings)
				.done(function(response) {
					updateModal(modal, response, opts);
					opts.ondone(thiz, modal, response, opts);
				})
				.error(function() {
					opts.onerror(thiz, modal, opts);
				})
				.complete(function() {
					modal.removeClass(opts.loadingCssClass);
					modal.addClass(opts.loadedCssClass);
					modal.find('.modal-body').unblockUI();
				});
		});
	}
	
	$.fn.ajaxPopover = function(options) {
		this.each(function() {
			var thiz = $(this);
			if (thiz.data('bs.popover')) {
				thiz.popover('destroy');
			} else {
				var opts = $.extend({}, $.ajaxBindings.defaults.ajaxPopover, thiz.data());
				if (typeof options == 'object') {
					opts = $.extend(opts, options);
				} else if (typeof options == 'string') {
					opts.url = options;
				} else if (typeof options == 'function') {
					opts.ondone = options;
				}
				thiz.popover($.extend({
					'trigger': 'manual',
					'title': opts.title
				}, opts.popoverOptions));
				thiz.popover('show');
				var popover = thiz.data('bs.popover');
				var tip = popover.tip();
				tip.data('bs.popover', popover);
				if (typeof opts.blockui == 'object' || (opts.blockui != 'none' && opts.blockui !== false)) {
					tip.find('.popover-content').blockUI(typeof opts.blockui == 'object' ? opts.blockui : {'mode': opts.blockui});
					adjustPopover(tip);
				}
				var settings = configureAjax(thiz, opts.url ? {'url': opts.url} : {}, {'dataType' : 'html'});
				tip.addClass(opts.loadingCssClass);
				$.ajax(settings)
					.done(function(response) {
						updatePopover(tip, response, opts);
						opts.ondone(thiz, tip, response, opts);
					})
					.error(function() {
						opts.onerror(thiz, tip, opts);
					})
					.complete(function() {
						tip.removeClass(opts.loadingCssClass);
						tip.addClass(opts.loadedCssClass);
						tip.find('.popover-content').unblockUI();
					});
			}
		});
	}
	
	$.fn.blockUI = function(options) {
		options = $.extend({}, $.ajaxBindings.defaults.blockUI, options || {});
		this.each(function() {
			var thiz = $(this);
			if (options.mode == 'auto') {
				if (thiz.is('body')) {
					options.mode = 'cover';
				} else if (thiz.is('form,button,input,select,textarea,a')) {
					options.mode = 'disable';
				} else {
					options.mode = 'css';
				}
			}
			thiz.data('blockui-options', options);
			if ('css' == options.mode) {
				addBlockUIClass(thiz, options.cssClass, 'css');
			} else if ('disable' == options.mode) {
				var disable;
				if (thiz.is('button,input,select,textarea,a')) {
					disable = thiz;
				} else {
					disable = thiz.find('button,input,select,textarea,a').filter(':not(:disabled)');
				}
				addBlockUIClass(thiz, options.cssClass, 'disable');
				disable.attr('disabled', 'disabled');
				thiz.data('disabled-elements', disable);
			} else if ('cover' == options.mode) {
				var overlay = $('<div role="cover"></div>').addClass(options.coverCssClass);
				overlay.hide();
				if (thiz.is('body')) {
					coverBody(overlay);
					overlay.attr('fullscreen', 'on').appendTo(document.body);
				} else {
					coverElement(thiz, overlay);
					overlay.appendTo(document.body);
				}
				overlay.html(options.spinner);
				overlay.data('overlay-options', options);
				showCover(overlay);
				addBlockUIClass(thiz, options.cssClass, 'overlay');
				thiz.data('overlay', overlay);
			} else if ('indicator' == options.mode) {
				var overlay = $('<div role="indicator"></div>').addClass(options.indicatorCssClass);
				overlay.hide().appendTo(document.body);
				overlay.html(options.spinner);
				overlay.data('overlay-options', options);
				showIndicator(overlay);
				addBlockUIClass(thiz, options.cssClass, 'indicator');
				thiz.data('overlay', overlay);
			}
		});
	}
	
	$.fn.unblockUI = function() {
		this.each(function() {
			var thiz = $(this);
			var options = thiz.data('blockui-options');
			if (options) {
				if ('css' == options.mode) {
					removeBlockUIClass(thiz, options.cssClass, 'css');
				} else if ('disable' == options.mode) {
					var disable = thiz.data('disabled-elements');
					removeBlockUIClass(thiz, options.cssClass, 'disable');
					disable.removeAttr('disabled');
					thiz.data('disabled-elements', null);
				} else if ('cover' == options.mode) {
					var overlay = thiz.data('overlay');
					removeBlockUIClass(thiz, options.cssClass, 'overlay');
					hideCover(overlay);
					thiz.data('overlay', null);
				} else if ('indicator' == options.mode) {
					var overlay = thiz.data('overlay');
					removeBlockUIClass(thiz, options.cssClass, 'indicator');
					hideIndicator(overlay);
					thiz.data('overlay', null);
				}
				thiz.data('blockui-options', null);
			}
		});
	}
	
	$.ajaxBindings = {
		'on': function(trigger, callback) {
			$(document.body).bind(trigger, callback);
		},
		'off': function(trigger) {
			$(document.body).unbind(trigger);
		},
		'defaults': {
			'ajaxUpdate': {
				'ondone': function() {},
				'onerror': function() {},
				'blockui': 'auto',
				'url': location.href
			},
			'ajaxRequest': {
				'ondone': function() {},
				'onerror': function() {},
				'blockui': 'auto',
				'confirmation': false
			},
			'ajaxModal': {
				'ondone': function() {},
				'onerror': function() {},
				'blockui': 'auto',
				'title': '...',
				'loadingCssClass': 'modal-loading',
				'loadedCssClass': 'modal-loaded'
			},
			'ajaxPopover': {
				'ondone': function() {},
				'onerror': function() {},
				'blockui': 'auto',
				'title': '...',
				'loadingCssClass': 'popover-loading',
				'loadedCssClass': 'popover-loaded',
				'popoverOptions': {
					'html': true
				}
			},
			'blockUI': {
				'cssClass': 'loading',
				'coverCssClass': 'block-ui-cover',
				'indicatorCssClass': 'block-ui-indicator',
				'spinner': 'Loading...',
				'mode': 'auto',
				'animateCover': 300,
				'animateIndicator': 300
			}
		}
	};
	
	$(document).ready(function() {
	
		$(document.body).on('click', '[data-raise=ajax-modal]:not(form)', function() {
			$(this).ajaxModal();
			return false;
		});
		
		$(document.body).on('submit', 'form[data-raise=ajax-modal]', function() {
			$(this).ajaxModal();
			return false;
		});
		
		$(document.body).on('click', '[data-raise=ajax-popover]:not(form)', function() {
			$(this).ajaxPopover();
			return false;
		});
		
		$(document.body).on('submit', 'form[data-raise=ajax-popover]', function() {
			$(this).ajaxPopover();
			return false;
		});
		
		$(document.body).on('click', '[data-raise=ajax-request]:not(form)', function() {
			$(this).ajaxRequest();
			return false;
		});
		
		$(document.body).on('submit', 'form[data-raise=ajax-request]', function() {
			$(this).ajaxRequest();
			return false;
		});
		
		$(document.body).on('click', '[data-ajax-links] a', function() {
			var thiz = $(this);
			var target = thiz.closest('[data-ajax-link-group]').attr('data-ajax-link-group');
			$(target).ajaxRequest(thiz.attr('href'));
			return false;
		});
		
		$(document.body).on('click', '[data-ajax-update]', function() {
			var thiz = $(this);
			var target = thiz.attr('data-ajax-update');
			if (thiz.is('a')) {
				$(target).ajaxUpdate(thiz.attr('href'));
			} else {
				$(target).ajaxUpdate();
			}
			return false;
		});
	});

})(jQuery);
