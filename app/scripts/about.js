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
var About = require('./controllers/about');

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
    var header = new Header(null, 'about');
    var about = new About($('main.about'));
});

}(window));
