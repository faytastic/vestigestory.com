/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var vars = require('vars');
var angular = require('angular');

vars.module(require('./controllers/HeaderController'), document.getElementById('menu'));

var app = angular.module('collection', []);
app.config(['$locationProvider', function($locationProvider) { $locationProvider.html5Mode({ enabled: true, requireBase: false }); }]);
app.config(['$interpolateProvider', function($interpolateProvider) { $interpolateProvider.startSymbol('[['); $interpolateProvider.endSymbol(']]'); }]);
app.controller('CollectionController', ['$scope', '$location', require('./controllers/CollectionController')]);
