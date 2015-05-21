---
---

/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var $ = require('jquery');
var vars = require('vars');

/**
 * @class
 * View model of the Story Book section.
 */
module.exports = (function(global) {

var DialogController = require('./common/DialogController');
var utils = require('../utils/utils');

var DIALOGS = {{ site.data.storybook.ss2015.dialogs | jsonify }};
var DIRECTORY = {{ site.data.storybook.ss2015.directory | jsonify }};

/**
 * @constant
 * URL to promo video on Vimeo.
 * @type {String}
 */
var VIMEO_URL = 'player.vimeo.com/video/118499561?title=0byline=0portrait=0&autoplay=1';

/**
 * @constructor
 * Creates a new StoryBookController instance.
 */
function StoryBookController(init)
{
    vars.Element.call(this, init);
} var parent = vars.inherit(StoryBookController, vars.Element);

/**
 * @property
 * Child elements.
 * @type {Object}
 */
Object.defineProperty(StoryBookController.prototype, 'children', { value: {}, writable: false });

/**
 * @property
 * Dynamic background instance.
 * @type {Object}
 */
Object.defineProperty(StoryBookController.prototype, 'dynamicBackground', { value: null, writable: true });

/**
 * @property
 * Indicates whether this StoryBookController instance is in lightbox mode.
 * @type {Boolean}
 */
Object.defineProperty(StoryBookController.prototype, 'lightboxEnabled',
{
    get: function()
    {
        return this._lightboxEnabled || false;
    },
    set: function(value)
    {
        var dialog = $('dialog[data-target="lightbox"]');
        var layer = $(dialog).closest('.overlay-layer');
        var section = $(dialog).closest('section');
        var video = $('video.preview');

        if (value)
        {
            if (this.dynamicBackground)
            {
                this.dynamicBackground.pause();
                this.dynamicBackground.lightboxEnabled = true;
            }

            var vimeo = $('<iframe id="vimeo" src="//'+VIMEO_URL+'" frameborder="0" portrait="0" title="0" webkitallowfullscreen mozallowfullscreen allowfullscreen/>');
            dialog.append(vimeo);

            utils.changeChildState(layer, 'state-visible');
            utils.changeChildState(dialog, 'state-visible');

            $('html, body').animate({ scrollTop: section.offset().top });
        }
        else
        {
            if (this.dynamicBackground)
            {
                this.dynamicBackground.play();
                this.dynamicBackground.lightboxEnabled = false;
            }

            utils.changeChildState(layer, 'state-hidden');
            utils.changeChildState(dialog, 'state-hidden');

            $('iframe#vimeo').remove();
        }

        Object.defineProperty(this, '_lightboxEnabled', { value: value, writable: true });
    }
});

/**
 * @inheritDoc
 */
StoryBookController.prototype.init = function()
{
    this.updateDelegate.receptive = vars.DirtyType.POSITION|vars.DirtyType.SIZE;

    // Set up selectors.
    this.children.sections = $(this.element).find('> section');
    this.children.scrollButton = $(this.element).find('button.scroll-down');
    this.children.videoToggles = $(this.element).find('button.toggle-video');
    this.children.backgroundToggles = $(this.element).find('button.toggle-background');
    this.children.garmentToggles = $(this.element).find('button.toggle-garment');
    this.children.dialogToggles = $(this.element).find('button.toggle-dialog');

    // Set up document events.
    if (utils.isMobileVersion())
    {
        this.initMobile();
    }
    else
    {
        this.initNav();
        this.initDesktop();
    }

    parent.prototype.init.call(this);
};

StoryBookController.prototype.initNav = function()
{
    if (utils.isMobileVersion()) return;

    var nav = document.createElement('nav');

    var arrlen = vars.sizeOf(DIRECTORY);

    for (var i = 0; i < arrlen; i++)
    {
        var node = document.createElement('a');
        node.setAttribute('href', '#'+DIRECTORY[i]);
        nav.appendChild(node);
        $(node).on(utils.isTouchDevice() ? 'touchend' : 'click', this._onNavNodeClick);
    }

    $(this.element).prepend(nav);
};

/**
 * @public
 * Initializes the mobile version of this StoryBookController instance.
 */
StoryBookController.prototype.initMobile = function()
{
    var self = this;

    // Selectors.
    var sNotice = document.createElement('p');
    sNotice.textContent = 'For full experience please visit the desktop version.';

    // Set up the scroll button.
    $(this.children.scrollButton).on(utils.isTouchDevice() ? 'touchend' : 'click', self._onScrollButtonClick.bind(self));

    // Set up video toggles.
    $(this.children.videoToggles).each(function() { $(this).on(utils.isTouchDevice() ? 'touchend' : 'click', self._onVideoToggleClick.bind(self)); });

    // Set up notice.
    $(this.children.sections[DIRECTORY.indexOf('Video')]).find('.content-layer summary aside').append(sNotice);
};

/**
 * @public
 * Initializes the desktop version of this StoryBookController instance.
 */
StoryBookController.prototype.initDesktop = function()
{
    var self = this;

    // Set up lightbox.
    var lightbox = document.createElement('dialog');
    lightbox.setAttribute('data-target', 'lightbox');

    var layer = document.createElement('div');
    layer.className = 'overlay-layer';
    layer.appendChild(lightbox);

    $(this.children.sections[0]).append(layer);

    // Set up dialogs.
    var arrlen = DIRECTORY.length;

    for (var i = 0; i < arrlen; i++)
    {
        var target = DIRECTORY[i];
        var data = DIALOGS[target];

        if (data)
        {
            var dialog = new DialogController();
            dialog.data = data;
            dialog.element.setAttribute('data-target', target);
            dialog.ondismiss = this._onDialogDismissButtonClick.bind(this);

            var overlay = document.createElement('div');
            overlay.className = 'overlay-layer';
            overlay.appendChild(dialog.element);

            $(this.children.sections[i]).append(overlay);
        }
    }

    // Selectors.
    var sDialogDismissButtons = $(self.element).find('dialog button.dismiss');

    // Set up the scroll button.
    $(this.children.scrollButton).on(utils.isTouchDevice() ? 'touchend' : 'click', self._onScrollButtonClick.bind(self));

    // Set up background toggles.
    $(this.children.backgroundToggles).each(function() { $(this).mouseover(self._onBackgroundToggleMouseOver.bind(self)); });
    $(this.children.backgroundToggles).each(function() { $(this).mouseout(self._onBackgroundToggleMouseOut.bind(self)); });

    // Set up garment toggles.
    $(this.children.garmentToggles).each(function() { $(this).mouseover(self._onGarmentToggleMouseOver.bind(self)); });
    $(this.children.garmentToggles).each(function() { $(this).mouseout(self._onGarmentToggleMouseOut.bind(self)); });

    // Set up video toggles.
    $(this.children.videoToggles).each(function() { $(this).on(utils.isTouchDevice() ? 'touchend' : 'click', self._onVideoToggleClick.bind(self)); });

    // Set up dialog toggles.
    $(this.children.dialogToggles).each(function() { $(this).on(utils.isTouchDevice() ? 'touchend' : 'click', self._onDialogToggleClick.bind(self)); });

    // Set up dialog dismiss buttons.
    sDialogDismissButtons.each(function() { $(this).on(utils.isTouchDevice() ? 'touchend' : 'click', self._onDialogDismissButtonClick.bind(self)); });

    $(document).on(utils.isTouchDevice() ? 'touchend' : 'click', self._onDocumentClick.bind(self));
};

/**
 * @inheritDoc
 */
StoryBookController.prototype.update = function(dirtyTypes)
{
    if (this.updateDelegate.isDirty(vars.DirtyType.POSITION|vars.DirtyType.SIZE))
    {
        this._updateNav();
        this._updatePages();
    }

    if (this.updateDelegate.isDirty(vars.DirtyType.SIZE))
    {
        this._updateBackgroundSizes();
    }

    parent.prototype.update.call(this);
};

/**
 * @private
 * Updates the nav nodes, specifically managing the active state of each node.
 */
StoryBookController.prototype._updateNav = function()
{
    if (utils.isMobileVersion()) return;

    var nodes = $(this.element).find('nav a');

    if (!nodes) return;

    var n = nodes.length;

    for (var i = n - 1; i >= 0; i--)
    {
        var node = nodes[i];
        var section = $('section'+$(node).attr('href'));

        if ($(window).scrollTop() >= section.offset().top)
        {
            if (this._activeNode) utils.changeChildState(this._activeNode, 'state-inactive');

            this._activeNode = node;

            if (this._activeNode) utils.changeChildState(this._activeNode, 'state-active');

            break;
        }
    }
};

/**
 * @private
 * Updates page transitions. This method manages which page shows up at different scroll positions.
 */
StoryBookController.prototype._updatePages = function()
{
    if (utils.isMobileVersion()) return;
    if (!this.children.sections) return;

    var viewportRect = vars.getViewportRect();
    var arrlen = vars.sizeOf(DIRECTORY);

    for (var i = 0; i < arrlen; i++)
    {
        var section = $(this.children.sections[i]);
        var elements = section.find('[data-type="basic-transition"]');
        var nElements = elements.length;
        var sectionIsVisible = (vars.getIntersectRect(section).height > viewportRect.height*0.5);

        if (sectionIsVisible)
        {
            if (this.dynamicBackground) this.dynamicBackground.index = i;
        }

        for (var j = 0; j < nElements; j++)
        {
            var element = elements[j];

            if (sectionIsVisible)
            {
                utils.changeChildState(element, 'state-visible');
            }
            else
            {
                utils.changeChildState(element, 'state-hidden');
            }
        }

        if (i === 0)
        {
            if (vars.getIntersectRect(section).height > viewportRect.height*0.5 && !this.lightboxEnabled)
            {
                if (this.dynamicBackground) this.dynamicBackground.play();
            }
            else
            {
                if (this.dynamicBackground) this.dynamicBackground.pause();
            }
        }
    }

    if ($(window).scrollTop() === 0)
    {
        utils.changeChildState(this.children.scrollButton, 'state-visible');
    }
    else
    {
        utils.changeChildState(this.children.scrollButton, 'state-hidden');
    }
};

/**
 * @private
 * Updates all background sizes that are not automatically resized via background-size: cover,
 * particularly image sprites.
 */
StoryBookController.prototype._updateBackgroundSizes = function()
{
    if (utils.isMobileVersion()) return;

    var viewportRect = vars.getViewportRect();
    var vimeo = $('dialog[data-target="lightbox"]');

    vars.transform(vimeo, { width: viewportRect.width, height: viewportRect.height, aspectRatio: 1280/720, type: 'cover' }, { width: viewportRect.width*0.8, height: viewportRect.height*0.8 });
};

/**
 * @private
 * Handler invoked when the nav node is clicked.
 * @param  {Object} event
 */
StoryBookController.prototype._onNavNodeClick = function(event)
{
    event.preventDefault();

    var sectionID = $(event.currentTarget).attr('href');
    var section = $('section' + sectionID);

    $('html, body').animate({ scrollTop: section.offset().top });
};

/**
 * @private
 * Handler invoked when a background toggle is moused over.
 * @param  {Object} event
 */
StoryBookController.prototype._onBackgroundToggleMouseOver = function(event)
{
    if (!this.dynamicBackground) return;

    this.dynamicBackground.showToggleBackground();
};

/**
 * @private
 * Handler invoked when a background toggle is moused out.
 * @param  {Object} event
 */
StoryBookController.prototype._onBackgroundToggleMouseOut = function(event)
{
    if (!this.dynamicBackground) return;

    this.dynamicBackground.hideToggleBackground();
};

/**
 * @private
 * Handler invoked when a garment toggle is moused over.
 * @param  {Object} event
 */
StoryBookController.prototype._onGarmentToggleMouseOver = function(event)
{
    if (!this.dynamicBackground) return;

    var target = $(event.currentTarget).attr('data-target');
    this.dynamicBackground.showGarmentBackground(target);
};

/**
 * @private
 * Handler invoked when a garment toggle is moused out.
 * @param  {Object} event
 */
StoryBookController.prototype._onGarmentToggleMouseOut = function(event)
{
    if (!this.dynamicBackground) return;

    var target = $(event.currentTarget).attr('data-target');
    this.dynamicBackground.hideGarmentBackground(target);
};

/**
 * @private
 * Handler invoked when the scroll button is clicked.
 * @param  {Object} event
 */
StoryBookController.prototype._onScrollButtonClick = function(event)
{
    var section = $('section#origin');

    $('html, body').animate({ scrollTop: section.offset().top });
};

/**
 * @private
 * Handler invoked when a video toggle is clicked.
 * @param  {Object} event
 */
StoryBookController.prototype._onVideoToggleClick = function(event)
{
    if (!utils.isMobileVersion())
    {
        this.lightboxEnabled = !this.lightboxEnabled;
    }
    else
    {
        window.open('http://'+VIMEO_URL);
    }
};

/**
 * @private
 * Handler invoked when a dialog toggle is clicked.
 * @param  {Objct} event
 */
StoryBookController.prototype._onDialogToggleClick = function(event)
{
    var target = $(event.currentTarget).attr('data-target');
    var dialog = $('dialog[data-target="'+target+'"]');
    var layer = $(dialog).closest('.overlay-layer');

    utils.changeChildState(layer, 'state-visible');
    utils.changeChildState(dialog, 'state-visible');
};

/**
 * @private
 * Handler invoked when a dialog dismiss button is clicked.
 * @param  {Object} event
 */
StoryBookController.prototype._onDialogDismissButtonClick = function(event)
{
    var dialog = $(event.currentTarget).closest('dialog');
    var layer = $(dialog).closest('.overlay-layer');

    utils.changeChildState(layer, 'state-hidden');
    utils.changeChildState(dialog, 'state-hidden');

    if (this.lightboxEnabled)
    {
        this.lightboxEnabled = !this.lightboxEnabled;
    }
};

/**
 * @private
 * Handler invoked when the window is clicked.
 * @param  {Object} event
 */
StoryBookController.prototype._onDocumentClick = function(event)
{
    if ($(event.target).closest('dialog').length > 0 || $(event.target).closest('button').length > 0)
    {
        return;
    }
    else
    {
        $(this.element).find('dialog').each(function() { utils.changeChildState(this, 'state-hidden'); });
        $(this.element).find('.overlay-layer').each(function() { utils.changeChildState(this, 'state-hidden'); });

        if (this.lightboxEnabled)
        {
            this.lightboxEnabled = !this.lightboxEnabled;
        }
    }
};

return StoryBookController; }(window));
