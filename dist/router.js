(function(root, factory) {

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone', 'underscore'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'), require('backbone'), require('underscore'));
    } else {
        root.BackboneNamedRouter = factory(root.jQuery, root.Backbone, root._);
    }

}(this, function($, Backbone, _) {

    var routeRe = /\((.*?)\)|(\(\?)?:\w+|\*\w+/g,
        routeOptionalRe = /\((.*?)\)/g,
        routeParamRe = /\:\w+/,
        routeParenthesisRe = /\(|\)/g,
        paramKeyRe = /\:\w+|\*\w+/,

        trailingSlashRE = /\/$/,

        removeTrailingSlash = function(str) {
            return str ? str.replace(trailingSlashRE, '') : '';
        },

        startsWith = function(str, search) {
            return str.substr(0, search.length) === search;
        };

    var Router = Backbone.Router.extend({

        constructor: function(options) {

            this.options = _.extend({
                baseUrl: typeof window !== 'undefined' ? (window.location.protocol + '//' + window.location.host) : '',
                usesPushState: false,
                root: ''
            }, options);

            Backbone.Router.apply(this, arguments);

        },

        getHistoryStartParams: function(additionalParams) {

            return _.extend({
                pushState: this.options.usesPushState,
                root: this.options.root
            }, additionalParams);

        },

        route: function(route, name, callback) {

            this.namedRoutes = this.namedRoutes || {};
            this.namedRoutes[name] = route;

            Backbone.Router.prototype.route.apply(this, arguments);

        },

        url: function(routeName, routeParams, queryParams) {

            var routeString = this.namedRoutes[routeName],
                baseUrl = this.options.baseUrl,
                pushState = this.options.usesPushState,
                root = this.options.root,
                url = '';

            if (typeof routeString === 'undefined') {
                throw new Error('Route "' + routeName + '" is not defined');
            }

            if (routeString.length === 0) {

                url = baseUrl + removeTrailingSlash(root);

            } else {

                routeString = routeString.replace(routeRe, function(foundMatch) {

                    var paramKey = foundMatch.match(paramKeyRe)[0].slice(1),
                        routeParam = routeParams[paramKey],
                        routeParamDefined = typeof routeParam !== 'undefined';

                    if (foundMatch.match(routeOptionalRe)) {

                        if (routeParamDefined) {
                            return foundMatch.replace(routeParenthesisRe, '').replace(routeParamRe, routeParam);
                        } else {
                            return '';
                        }

                    } else {

                        if (!routeParamDefined) {
                            throw new Error('Required route parameter "' + paramKey + '" for route "' + routeName + '" is missing');
                        } else {
                            return routeParam;
                        }

                    }

                });

                if (pushState) {
                    url = baseUrl + root + routeString;
                } else {
                    url = baseUrl + removeTrailingSlash(root) + '#' + routeString;
                }

            }

            if (queryParams) {
                url += '?' + $.param(queryParams);
            }

            return url;

        },

        navigateToUrl: function(url, trigger) {

            var fragment = url instanceof $ ? url.attr('href') : url,
                baseUrl = this.options.baseUrl,
                pushState = this.options.usesPushState,
                root = removeTrailingSlash(this.options.root);

            if (startsWith(fragment, baseUrl)) { fragment = fragment.replace(baseUrl, ''); }
            if (startsWith(fragment, root)) { fragment = fragment.replace(root, ''); }
            if (startsWith(fragment, '/')) { fragment = fragment.slice(1); }
            if (!pushState && startsWith(fragment, '#')) { fragment = fragment.slice(1); }

            if (trigger && fragment === Backbone.history.fragment) {
                Backbone.history.loadUrl(fragment);
            } else {
                this.navigate(fragment, {trigger: Boolean(trigger)});
            }

        },

        navigateToRoute: function(routeName, routeParams, queryParams, trigger) {

            this.navigateToUrl(this.url(routeName, routeParams, queryParams), trigger);

        }

    });

    return Router;

}));
