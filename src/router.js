(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone', 'underscore'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'), require('backbone'), require('underscore'));
    } else {
        root.BaseView = factory(root.jQuery, root.Backbone, root._);
    }

}(this, function($, Backbone, _) {

    var root = this,
        router,
        routeDefinitions = {
            routes: {}
        },
        routerOptions = {
            pushState: false,
            root: ''
        },
        aliases = {},
        baseUrl = root.location.protocol + '//' + root.location.host,

        routeRe = /\((.*?)\)|(\(\?)?:\w+|\*\w+/g,
        routeOptionalRe = /\((.*?)\)/g,
        routeParamRe = /\:\w+/,
        routeParenthesisRe = /\(|\)/g,

        removeTrailingSlash =  _.memoize(function(str) {
            return str.replace(/\/$/, '');
        }),

        startsWith = _.memoize(function(fullString, startString) {
            return fullString.slice(0, startString.length) === startString;
        }, function(a, b) { return a + ':' + b; }),

        getRouteHasher = function(alias, params) {
            return alias + (params ? (_.isArray(params) ? ':' + params.join(':') : ':' + _.toArray(arguments).slice(1).join(':')) : '');
        };

    var api = {

        register: function(route, alias, action) {

            if (typeof route === 'string') { // full register api call

                routeDefinitions.routes[route] = alias;
                routeDefinitions[alias] = action;
                aliases[alias] = route;

            } else { // shorthand - classic backbone route definition object

                routeDefinitions = route;
                _.each(routeDefinitions.routes, function(alias, routeString) {
                    aliases[alias] = routeString;
                });

            }

            return api;

        },

        get: _.memoize(function(alias, params) {

            var routeString = aliases[alias];

            !_.isArray(params) && (params = _.toArray(arguments).slice(1));

            params.length && (routeString = routeString.replace(routeRe, function(match) {

                var param = params.shift();
                if (!param) { return ''; }
                if (!startsWith(match, '(')) { return param; }
                return match.replace(routeParamRe, param).replace(routeParenthesisRe, '');

            }));

            routeString = routeString.replace(routeOptionalRe, '');

            // root url
            if (!routeString.length) {
                return baseUrl + removeTrailingSlash(routerOptions.root);
            }

            // hashed urls
            if (!routerOptions.pushState) {
                return baseUrl + removeTrailingSlash(routerOptions.root) + '#' + routeString;
            }

            // push state urls
            return baseUrl + routerOptions.root + routeString;

        }, getRouteHasher),

        getWithQueryString: function(alias, params, queryParams) {

            if (arguments.length === 2) {
                queryParams = params;
                params = [];
            }

            return api.get(alias, params) + '?' + $.param(queryParams);

        },

        navigate: function() {

            router.navigate.apply(router, arguments);

        },

        navigateToAlias: function(alias, params, trigger) {

            api.navigateToLink(api.get(alias, params), trigger);

        },

        navigateToLink: function(link, trigger) {

            var location = link instanceof $ ? link.attr('href') : link,
                root = removeTrailingSlash(routerOptions.root);

            if (startsWith(location, baseUrl)) { location = location.replace(baseUrl, ''); }
            if (startsWith(location, root)) { location = location.replace(root, ''); }
            if (startsWith(location, '/')) { location = location.slice(1); }
            if (!routerOptions.pushState && startsWith(location, '#')) { location = location.slice(1); }

            router.navigate(location, {'trigger': !!trigger });

        },

        start: function(params) {

            var RouterBlueprint = Backbone.Router.extend(routeDefinitions);
            router = new RouterBlueprint();

            if (params) { api.setOptions(params); }
            Backbone.history.start(routerOptions);

            return api;

        },

        setOptions: function(params) {

            routerOptions = $.extend(routerOptions, params);
            return api;

        },

        setBaseUrl: function(url) {

            baseUrl = url;
            return api;

        },

        getOriginalRouter: function() {
            return router;
        },

        getQueryParam: function(name) {

            var queryString = root.location.search;

            if (!queryString) { return; }

            var params = _.object(_.map(queryString.substring(1).split('&'), function(value) {
                return value.split('=');
            }));

            return name ? params[name] : params;

        }

    };

    return api;

}));