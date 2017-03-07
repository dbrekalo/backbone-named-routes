var assert = require('chai').assert;
var Backbone = require('backbone');
var NamedRouter = require('../');
var $ = require('jquery');
var currentUrl = window.location.href;

var Router = NamedRouter.extend({

    routes: {
        '': 'home',
        'help': 'help',
        'search/:query': 'search',
        'search/:query/p:page': 'searchOnPage',
        'file/*path': 'downloadFile',
        'docs/:section(/:subsection)': 'docs'
    },

    home: function() {
        this.currentRouteName = 'home';
    },

    help: function() {
        this.currentRouteName = 'help';
    },

    search: function(query) {
        this.currentRouteName = 'search';
        this.currentRouteParams = [query];
    },

    searchOnPage: function(query, page) {
        this.currentRouteName = 'searchOnPage';
        this.currentRouteParams = [query, page];
    },

    downloadFile: function(path) {
        this.currentRouteName = 'downloadFile';
        this.currentRouteParams = [path];
    },

    docs: function(section, subsection) {
        this.currentRouteName = 'docs';
        this.currentRouteParams = [section, subsection];
    }

});

beforeEach(function() {
    // console.log('cleanup');
});

afterEach(function() {
    Backbone.history.stop();
    window.location.hash = '';
});

describe('Backbone named router', function() {

    it('properly renders urls from named routes', function() {

        var router = new Router({baseUrl: currentUrl});

        assert.strictEqual(router.url('home'), currentUrl);
        assert.strictEqual(router.url('help'), currentUrl + '#help');
        assert.strictEqual(router.url('help', undefined, {test: true}), currentUrl + '#help?test=true');
        assert.strictEqual(router.url('search', {query: 'term'}), currentUrl + '#search/term');
        assert.strictEqual(router.url('searchOnPage', {query: 'term', page: 2}), currentUrl + '#search/term/p2');
        assert.strictEqual(router.url('downloadFile', {path: 'test.jpg'}), currentUrl + '#file/test.jpg');
        assert.strictEqual(router.url('docs', {section: 'installation'}), currentUrl + '#docs/installation');
        assert.strictEqual(router.url('docs', {section: 'installation', subsection: 'osx'}), currentUrl + '#docs/installation/osx');

    });

    it('navigates to url', function() {

        var router = new Router({baseUrl: currentUrl});

        Backbone.history.start(router.getHistoryStartParams({test: true}));

        router.navigateToUrl(router.url('home'), true);
        assert.strictEqual(router.currentRouteName, 'home');

        router.navigateToUrl(router.url('help'), true);
        assert.strictEqual(router.currentRouteName, 'help');

        router.navigateToUrl($('<a href="' + router.url('search', {query: 'queryTerm'}) + '"></a>'), true);
        assert.strictEqual(router.currentRouteName, 'search');
        assert.sameMembers(router.currentRouteParams, ['queryTerm']);

    });

    it('navigates to route name', function() {

        var router = new Router({baseUrl: currentUrl});

        Backbone.history.start(router.getHistoryStartParams());

        router.navigateToRoute('docs', {section: 'installation', subsection: 'osx'}, undefined, true);
        assert.strictEqual(router.currentRouteName, 'docs');
        assert.sameMembers(router.currentRouteParams, ['installation', 'osx']);

    });

    it('will throw error for undefined routes', function() {

        var router = new Router({baseUrl: currentUrl});

        assert.throws(function() {
            router.url('unknownRoute');
        });

    });

    it('will throw error for undefined required route params', function() {

        var router = new Router({baseUrl: currentUrl});

        assert.throws(function() {
            router.url('search', {});
        });

    });

    it('works with push state', function() {

        var router = new Router({baseUrl: currentUrl, usesPushState: true, root: 'test/'});

        Backbone.history.start(router.getHistoryStartParams());

        router.navigateToRoute('docs', {section: 'installation', subsection: 'osx'}, undefined, true);
        assert.strictEqual(router.currentRouteName, 'docs');
        assert.sameMembers(router.currentRouteParams, ['installation', 'osx']);

    });

});
