/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
'use strict';

var $ = require('jquery');
var Header = require('./controllers/header');
var Collection = require('./controllers/collection');
var angular = require('angular');

/**
 * @class
 * View model of the Main module.
 */
(function(global) {

/**
 * Ready DOM.
 */
$(document).ready(function()
{
    var header = new Header(null, 'collection');
    var app = angular.module('collection', []);
    app.controller('CollectionController', ['$scope', '$location', Collection]);
    app.config(['$locationProvider', function($locationProvider) { $locationProvider.html5Mode({ enabled: true, requireBase: false }); }]);
});

}(window));
