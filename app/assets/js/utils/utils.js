/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var $ = require('jquery');
var vars = require('vars');

/**
 * @class
 * Controller of the About section.
 */
module.exports = (function(global) {

var utils = {};

/**
 * Checks if animation is enabled.
 * @return {Boolean}
 */
utils.isMobileVersion = function()
{
    return global.forceTouch || (($(window).innerWidth() <= 1024) && ($('html').hasClass('touch')));
};

/**
 * Checks if current device is a touch device.
 * @return {Boolean}
 */
utils.isTouchDevice = function()
{
    return global.forceTouch || ($('html').hasClass('touch'));
};

/**
 * Changes the state of a child element.
 * @param  {Object} element
 * @param  {String} state
 */
utils.changeChildState = function(element, state)
{
    if (!element) return;
    if ($(element).hasClass(state)) return;

    // Replace all classes that matches with 'state-*'
    $(element).attr('class', function(i, c) { return (c ? c.replace(/(^|\s)state-\S+/g, '') : ''); });

    // Apply state to element.
    $(element).attr('class', $(element).attr('class') + ' ' + state);
};

return utils; }(window));
