;(function($, Backbone, _){

	"use strict";

	var router,
		routeDefinitions = { routes: {} },
		routerOptions = { pushState: false, root: "" },
		aliases = {},
		baseUrl = window.location.protocol + '//' + window.location.host,
		routeRe = /\((.*?)\)|(\(\?)?:\w+|\*\w+/,
		removeTrailingSlash = function(str){

			removeTrailingSlash.cache = removeTrailingSlash.cache || {};

			var cachedStr = removeTrailingSlash.cache[str];
			if (typeof cachedStr !== 'undefined') { return cachedStr; }

			if(str.length && str.substring(str.length-1) === '/'){
				cachedStr = str.substring(0,str.length-1);
			} else {
				cachedStr = str;
			}
			return cachedStr;
		},
		startsWith = function(fullString, startString){
			return fullString.slice(0, startString.length) === startString;
		};

	var api = {

		register: function(route, alias, action){

			if (typeof route === "string"){ // full register api call

				routeDefinitions.routes[route] = alias;
				routeDefinitions[alias] = action;
				aliases[alias] = route;

			} else { // shorthand - classic backbone route definition object

				routeDefinitions = route;
				_.each(routeDefinitions.routes, function(alias, routeString){
					aliases[alias] = routeString;
				});

			}

			return api;

		},

		get: function(alias, params){

			var routeString = aliases[alias];

			// apply params if there are any
			if (params && params.length) {

				_.each(params, function(param){
					if(!_.isObject(param)){
						routeString = routeString.replace(routeRe, param);
					}
				});

			}

			// root url
			if (!routeString.length ) {
				return baseUrl + removeTrailingSlash(routerOptions.root);
			}

			// hashed urls
			if (!routerOptions.pushState) {
				return baseUrl + removeTrailingSlash(routerOptions.root) + '#' + routeString;
			}

			// push state urls
			return baseUrl + routerOptions.root + routeString;

		},

		navigate: function(){

			router.navigate.apply(router, arguments);

		},

		navigateToAlias: function(alias, params, noTrigger){

			api.navigateToLink(api.get(alias, params), noTrigger );

		},

		navigateToLink: function(link, noTrigger){

			var location = link instanceof $ ? link.attr('href') : link;

			if (startsWith(location, baseUrl)) { location = location.replace(baseUrl, ""); }
			if (startsWith(location, routerOptions.root)) { location = location.replace(routerOptions.root, ""); }

			router.navigate(location, {trigger:!noTrigger});

		},

		start: function(params){

			var RouterBlueprint = Backbone.Router.extend(routeDefinitions);
			router = new RouterBlueprint();

			if (params) { api.setOptions(params); }
			Backbone.history.start(routerOptions);

			return api;

		},

		setOptions: function(params){

			routerOptions = $.extend(routerOptions, params);
			return api;

		}

	};

	$.wk = $.wk || {};
	$.wk.router = api;

})(window.jQuery || window.Zepto, window.Backbone, window._);