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
var angular = require('angular');

var HeaderController = require('./controllers/HeaderController');
var CollectionController = require('./controllers/CollectionController');

vars.module((function() {

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
    this.addVirtualChild(new HeaderController({ activeTarget: 'collection' }));

    parent.prototype.init.call(this);
};

return Main; }()));

var app = angular.module('collection', []);
app.config(['$locationProvider', function($locationProvider) { $locationProvider.html5Mode({ enabled: true, requireBase: false }); }]);
app.config(['$interpolateProvider', function($interpolateProvider) { $interpolateProvider.startSymbol('[['); $interpolateProvider.endSymbol(']]'); }]);
app.controller('CollectionController', ['$scope', '$location', CollectionController]);
