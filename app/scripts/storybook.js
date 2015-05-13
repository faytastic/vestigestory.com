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

vars.module((function() {

var Header = require('./controllers/header');
var DynamicBackground = require('./controllers/dynamicbackground');
var StoryBook = require('./controllers/storybook');
var utils = require('./utils/utils');
var backgrounds = require('./data/storybook/backgrounds');

/**
 * @constructor
 * Creates a new Main instance.
 */
function Main(init)
{
    vars.Element.call(this, init);
} var parent = vars.inherit(Main, vars.Element);

/**
 * @property
 * Child elements.
 * @type {Object}
 */
Object.defineProperty(Main.prototype, 'children', { value: {}, writable: false });

/**
 * @inheritDoc
 */
Main.prototype.init = function()
{
    this.updateDelegate.responsive = true;
    this.updateDelegate.refreshRate = 20.0;
    this.updateDelegate.transmissive = vars.DirtyType.POSITION|vars.DirtyType.SIZE;

    this.children.storyBook = $('main.story-book').get(0);
    this.children.dynamicBackground = $('main.background').get(0);
    this.children.preloader = $('#preloader').get(0);
    this.children.progressBar = $(this.children.preloader).find('.progress-bar').get(0);

    this._preloader = new vars.AssetLoader();
    this._preloader.enqueue.apply(this._preloader, (utils.isMobileVersion() ? backgrounds.mobile : backgrounds.desktop));
    this._preloader.addEventListener(vars.EventType.OBJECT.PROGRESS, this._onPreloadProgress.bind(this));
    this._preloader.addEventListener(vars.EventType.OBJECT.LOAD, this._onPreloadComplete.bind(this));
    this._preloader.init();

    parent.prototype.init.call(this);
};

/**
 * @private
 * Handler invoked when the preloader is in progress.
 * @param  {Object} event
 */
Main.prototype._onPreloadProgress = function(event)
{
    vars.transform(this.children.progressBar, { width: vars.getViewportRect().width * this._preloader.progress });
    $(this.children.progressBar).css('opacity', this._preloader.progress);
};

/**
 * @private
 * Handler invoked when the preloader is complete.
 * @param  {Object} event
 */
Main.prototype._onPreloadComplete = function(event)
{
    var self = this;

    if (event.detail.pending === 0)
    {
        utils.changeChildState(self.children.storyBook, 'state-loaded');
        utils.changeChildState(self.children.preloader, 'state-hidden');

        var header = new Header({ activeTarget: 'story-book' });
        var dynamicBackground;

        if (utils.isMobileVersion())
        {
            self.children.dynamicBackground.remove();
        }
        else
        {
            dynamicBackground = new DynamicBackground(self.children.dynamicBackground);
        }

        var storyBook = new StoryBook({ element: self.children.storyBook, dynamicBackground: dynamicBackground });

        self.addVirtualChild(header, 'header');
        self.addVirtualChild(dynamicBackground, 'dynamicBackground');
        self.addVirtualChild(storyBook, 'storyBook');

        setTimeout(
            function()
            {
                self.children.preloader.remove();
                self._preloader.destroy();
                self._preloader = null;
            }, 500);
    }
};

return Main; }()));
