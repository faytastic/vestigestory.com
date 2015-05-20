/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var $ = require('jquery');
var vars = require('vars');

/**
 * @class
 * Controller of the AboutController section.
 */
module.exports = (function(global) {

/**
 * @constructor
 * Creates a new AboutController instance.
 */
function AboutController(element)
{
    vars.Element.call(this, element);
} var parent = vars.inherit(AboutController, vars.Element);

return AboutController; }(window));
