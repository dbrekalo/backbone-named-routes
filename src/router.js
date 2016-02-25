(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone', 'underscore'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'), require('backbone'), require('underscore'));
    } else {
        root.BackboneNamedRouter = factory(root.jQuery, root.Backbone, root._);
    }

}(this, function($, Backbone, _) {

    var win = this,

        routeRe = /\((.*?)\)|(\(\?)?:\w+|\*\w+/g,
        routeOptionalRe = /\((.*?)\)/g,
        routeParamRe = /\:\w+/,
        routeParenthesisRe = /\(|\)/g,
        paramKeyRe = /\:\w+|\*\w+/,

        trailingSlashRE = /\/$/,

        removeTrailingSlash = function(str) {
            return str.replace(trailingSlashRE, '');
        },

        startsWith = function(str, search) {
            return str.substr(0, search.length) === search;
        };

    var Router = Backbone.Router.extend({

        constructor: function(options) {

            this.options = _.extend({
                baseUrl: win.location.protocol + '//' + win.location.host
            }, options);

            Backbone.Router.apply(this, arguments);

        },

        route: function(route, name, callback) {

            this.namedRoutes = this.namedRoutes || {};
            this.namedRoutes[name] = route;

            Backbone.Router.prototype.route.apply(this, arguments);

        },

        get: function(routeName, routeParams, queryParams) {

            var routeString = this.namedRoutes[routeName],
                baseUrl = this.options.baseUrl,
                pushState = Backbone.history._usePushState,
                root = Backbone.history.root,
                url = '';

            if (typeof routeString === 'undefined') {
                throw new Error('Route "' + routeName + '" is not defined');
            }

            if (!routeString.length) {

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
                pushState = Backbone.history._usePushState,
                root = removeTrailingSlash(Backbone.history.root);

            if (startsWith(fragment, baseUrl)) { fragment = fragment.replace(baseUrl, ''); }
            if (startsWith(fragment, root)) { fragment = fragment.replace(root, ''); }
            if (startsWith(fragment, '/')) { fragment = fragment.slice(1); }
            if (!pushState && startsWith(fragment, '#')) { fragment = fragment.slice(1); }

            this.navigate(fragment, {trigger: !!trigger });

        },

        navigateToRoute: function(routeName, routeParams, queryParams, trigger) {

            this.navigateToUrl(this.get(routeName, routeParams, queryParams), trigger);

        }

    });

    return Router;

}));
