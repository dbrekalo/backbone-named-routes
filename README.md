# Backbone named routes
[![Build Status](https://travis-ci.org/dbrekalo/backbone-named-routes.svg?branch=master)](https://travis-ci.org/dbrekalo/backbone-named-routes)
[![Coverage Status](https://coveralls.io/repos/github/dbrekalo/backbone-named-routes/badge.svg?branch=master)](https://coveralls.io/github/dbrekalo/backbone-named-routes?branch=master)
[![NPM Status](https://img.shields.io/npm/v/backbone-named-routes.svg)](https://www.npmjs.com/package/backbone-named-routes)

Backbone router extension with named routes for easy client side links generation.
Keep your url logic in one place and never type urls by hand again. Weighs less than 2KB.

[Visit documentation site](http://dbrekalo.github.io/backbone-named-routes/).

Tired of hand coding those pesky href attributes on anchors and having to go through all templates when urls are changed?
This named router extension allows you to generate urls from named routes or route aliases.
Your url structure is already written and defined in your standard Backbone router - it is a good place to generate urls from.

## Examples and api
Extend named router and define your routes as you usually do:
```js
var Router = BackboneNamedRouter.extend({

    routes: {
        '': 'home',
        'help': 'help',
        'search/:query': 'search',
        'search/:query/p:page': 'searchOnPage',
        'file/*path': 'downloadFile',
        'docs/:section(/:subsection)': 'docs'
    },

    ...
```
Create router instance:
```js
var router = new Router({
    baseUrl: 'http://mysite.loc',
    usesPushState: true,
    root: ''
});
```
Get urls where and when you need them.

```js
// outputs: 'http://mysite.loc'
router.url('home');

// outputs: 'http://mysite.loc/help'
router.url('help');

// outputs: 'http://mysite.loc/search/my-query'
router.url('search', {query: 'my-query'});

// outputs: 'http://mysite.loc/search/my-query/p2'
router.url('searchOnPage', {query: 'my-query', page: 2});

// outputs: 'http://mysite.loc/file/myFile.pdf?campaign=email'
router.url('downloadFile', {path: 'myFile.pdf'}, {campaign: 'email'});

// outputs: 'http://mysite.loc/docs/backbone/router'
router.url('docs', {section: 'backbone', subsection: 'router'});
```

Start Backbone history

```js
Backbone.history.start(router.getHistoryStartParams());
```
---
### Convenient helpers
Navigating to named routes is easy as:
```js
// http://mysite.loc/help
router.navigateToRoute('help')

// http://mysite.loc/search/backbone
router.navigateToRoute('search', {query: backbone});
```
Navigating to urls:
```js
// help route handler is dispatched
router.navigateToUrl('http://mysite.loc/help');

// you can pass jquery anchor objects
$('a.appLink').on('click', function(e) {
    e.preventDefault();
    router.navigateToUrl($(e.currentTarget));
});
```
## Installation
Backbone named routes is packaged as UMD library so you can use it in CommonJS and AMD environment or with browser globals.

```bash
npm install backbone-named-routes --save
```

```js
// with bundlers
var BackboneNamedRouter = require('backbone-named-routes');

// with browser globals
var BackboneNamedRouter = window.BackboneNamedRouter;
```