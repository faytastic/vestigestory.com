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
 * @property (read-only)
 * Child elements.
 * @type {Object}
 */
Object.defineProperty(HeaderController.prototype, 'activeTarget', { value: null, writable: true });

/**
 * @inheritDoc
 */
HeaderController.prototype.init = function()
{
    this.responsive = true;

    // Set up child elements.
    this.children.menu = $('header#menu').get(0);
    this.children.compactMenu = $('header#menu-compact').get(0);

    if (this.activeTarget)
    {
        $(this.children.menu).find('> nav li').addClass('inactive');
        $(this.children.menu).find('> nav li[data-type="'+this.activeTarget+'"] a').addClass('active');
    }

    $(this.children.compactMenu).find('button.menu').click(this._onCompactMenuItemClick.bind(this));

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
            var isStoryBook = this.activeTarget === 'story-book';
            var viewportRect = vars.getViewportRect();

            if (isStoryBook)
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
