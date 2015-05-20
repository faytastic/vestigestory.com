/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var $ = require('jquery');
var vars = require('vars');
var utils = require('../utils/utils');

/**
 * @class
 * Controller of the main HeaderController.
 */
module.exports = (function(global) {

/**
 * @constructor
 * Creates a new About instance.
 * @param {String} activeTarget
 */
function HeaderController(init)
{
    vars.Element.call(this, init);
} var parent = vars.inherit(HeaderController, vars.Element);

/**
 * @property (read-only)
 * Child elements.
 * @type {Object}
 */
Object.defineProperty(HeaderController.prototype, 'children', { value: {}, writable: false });

/**
 * @inheritDoc
 */
HeaderController.prototype.init = function()
{
    this.updateDelegate.receptive = vars.DirtyType.POSITION|vars.DirtyType.SIZE;

    // Set up child elements.
    this.children.menu = $('header#menu').get(0);
    this.children.compactMenu = $('header#menu-compact').get(0);

    $(this.children.compactMenu).find('button.menu').on(utils.isTouchDevice() ? 'touchend' : 'click', this._onCompactMenuItemClick.bind(this));

    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
HeaderController.prototype.update = function(dirtyTypes)
{
    if (this.isDirty(vars.DirtyType.POSITION))
    {
        if (!utils.isMobileVersion())
        {
            var autoHide = $(this.children.menu).hasClass('auto-hide');
            var viewportRect = vars.getViewportRect();

            if (autoHide)
            {
                if ($(window).scrollTop() > viewportRect.height*0.5)
                {
                    utils.changeChildState(this.children.menu, 'state-visible');
                }
                else
                {
                    utils.changeChildState(this.children.menu, 'state-hidden');
                }
            }
            else
            {
                utils.changeChildState(this.children.menu, 'state-visible');
            }
        }
    }

    parent.prototype.update.call(this);
};

/**
 * Handler invoked when an item in the compact menu is clicked.
 * @param  {Object} event
 */
HeaderController.prototype._onCompactMenuItemClick = function(event)
{
    event.preventDefault();

    var sNav = $(this.children.compactMenu).find('nav');

    if ($(sNav).hasClass('state-visible'))
    {
        utils.changeChildState(sNav, 'state-hidden');
        utils.changeChildState(event.currentTarget, 'state-inactive');
    }
    else
    {
        utils.changeChildState(sNav, 'state-visible');
        utils.changeChildState(event.currentTarget, 'state-active');
    }
};

return HeaderController; }(window));
