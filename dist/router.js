;(function($, Backbone, _){

	"use strict";

	var router,
		routeDefinitions = { routes: {} },
		routerOptions = { pushState: false, root: "" },
		aliases = {},
		routeRe = /\((.*?)\)|(\(\?)?:\w+|\*\w+/,
		slice = Array.prototype.slice;

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

		get: function(alias){

			var params = slice.call(arguments, 1),
				routeString = aliases[alias];

			if (params.length) {

				_.each(params, function(param){
					if(!_.isObject(param)){
						routeString = routeString.replace(routeRe, param);
					}
				});

			}

			return routerOptions.root + routeString;

		},

		navigate: function(){

			router.navigate.apply(router, arguments);

		},

		navigateToAlias: function(){

			var routeUrl = api.get.apply(api, arguments).substring(routerOptions.root.length),
				navigateOptionsCandidate = slice.call(arguments,0).pop();

			_.isObject(navigateOptionsCandidate) ? api.navigate(routeUrl, navigateOptionsCandidate) : api.navigate(routeUrl);

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