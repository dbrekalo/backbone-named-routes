;(function($, Backbone, _){

	"use strict";

	var router,
		routeDefinitions = { routes: {} },
		routerOptions = { pushState: false, root: "" },
		aliases = {},
		baseUrl = window.location.protocol + '//' + window.location.host,

		routeRe = /\((.*?)\)|(\(\?)?:\w+|\*\w+/g,
		routeOptionalRe = /\((.*?)\)/g,
		routeParamRe = /\:\w+/,
		routeParenthesisRe = /\(|\)/g,

		removeTrailingSlash =  _.memoize(function(str){
			return str.replace(/\/$/, "");
		}),

		startsWith = _.memoize(function(fullString, startString){
			return fullString.slice(0, startString.length) === startString;
		}, function(a,b){ return a + ':' + b; }),

		getRouteHasher = function(alias, params){
			return alias + (params ? (_.isArray(params) ? ':' + params.join(":") : ':' + _.toArray(arguments).slice(1).join(":") ) : '');
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

		get: _.memoize(function(alias, params){

			var routeString = aliases[alias];

			!_.isArray(params) && (params = _.toArray(arguments).slice(1));

			params.length && (routeString = routeString.replace(routeRe, function(match){

				var param = params.shift();
				if (!param) { return ''; }
				if (!startsWith(match, '(')){ return param; }
				return match.replace(routeParamRe, param).replace(routeParenthesisRe, '');

			}));

			routeString = routeString.replace(routeOptionalRe, "");

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

		}, getRouteHasher),

		navigate: function(){

			router.navigate.apply(router, arguments);

		},

		navigateToAlias: function(alias, params, trigger){

			api.navigateToLink(api.get(alias, params), trigger);

		},

		navigateToLink: function(link, trigger){

			var location = link instanceof $ ? link.attr('href') : link,
				root = removeTrailingSlash(routerOptions.root);

			if (startsWith(location, baseUrl)) { location = location.replace(baseUrl, ""); }
			if (startsWith(location, root)) { location = location.replace(root, ""); }
			if (startsWith(location, '/')) { location = location.slice(1); }
			if (!routerOptions.pushState && startsWith(location, '#') ) { location = location.slice(1); }

			router.navigate(location, {'trigger': !!trigger });

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

		},

		setBaseUrl: function(url){

			baseUrl = url;
			return api;

		},

		getOriginalRouter: function(){
			return router;
		},

		getQueryParam: function(name){

			var queryString = window.location.search;

			if (!queryString) { return; }

			var params = _.object(_.map(queryString.substring(1).split("&"), function(value){
				return value.split("=");
			}));

			return name ? params[name] : params;

		}

	};

	$.wk = $.wk || {};
	$.wk.router = api;

})(window.jQuery || window.Zepto, window.Backbone, window._);