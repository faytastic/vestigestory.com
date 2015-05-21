/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var $ = require('jquery');
var vars = require('vars');

/**
 * @class
 * Controller of the main HeaderController.
 */
module.exports = (function() {

var utils = require('../utils/utils');

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
 * @inheritDoc
 */
HeaderController.prototype.init = function()
{
    this.updateDelegate.responsive = true;
    this.updateDelegate.refreshRate = 10.0;

    // Set up child elements.
    $(this.element).find('button.menu').on(utils.isTouchDevice() ? 'touchend' : 'click', this._onCompactMenuItemClick.bind(this));

    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
HeaderController.prototype.update = function(dirtyTypes)
{
    if (this.updateDelegate.isDirty(vars.DirtyType.POSITION))
    {
        if (!utils.isMobileVersion())
        {
            var autoHide = $(this.element).hasClass('auto-hide');
            var viewportRect = vars.getViewportRect();

            if ($(this.updateDelegate.conductor).scrollTop() > viewportRect.height*0.5)
            {
                if (autoHide)
                {
                    utils.changeChildState(this.element, 'state-visible');
                }
                else
                {
                    $(this.element).addClass('emphasized');
                }
            }
            else
            {
                if (autoHide)
                {
                    utils.changeChildState(this.element, 'state-hidden');
                }
                else
                {
                    $(this.element).removeClass('emphasized');
                }
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

    var sNav = $(this.element).find('nav');

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

return HeaderController; }());
