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

/**
 * @class
 * Controller of the About section.
 */
module.exports = (function(global) {

/**
 * @constructor
 * Creates a new About instance.
 */
function About(element)
{
    vars.Element.call(this, element);
} var parent = vars.inherit(About, vars.Element);

return About; }(window));
