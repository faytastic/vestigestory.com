 /**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
'use strict';

var $ = require('jquery');
var vars = require('vars');
var Header = require('./controllers/header');
var Collection = require('./controllers/collection');
var angular = require('angular');

vars.module((function(global) {

/**
 * @constructor
 * Creates a new Main instance.
 */
function Main(init)
{
    vars.Element.call(this, init);
} var parent = vars.inherit(Main, vars.Element);

/**
 * @inheritDoc
 */
Main.prototype.init = function()
{
    this.addVirtualChild(new Header({ activeTarget: 'collection' }));

    parent.prototype.init.call(this);
};

return Main; }(window)));

var app = angular.module('collection', []);
app.controller('CollectionController', ['$scope', '$location', Collection]);
app.config(['$locationProvider', function($locationProvider) { $locationProvider.html5Mode({ enabled: true, requireBase: false }); }]);