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
var Dialog = require('./common/dialog');
var Dialogs = require('../data/dialogs');
var utils = require('../utils/utils');

/**
 * @class
 * View model of the Story Book section.
 */
module.exports = (function(global) {

/**
 * @constant
 * Directory of ordered sections in the Story Book.
 * @type {Enum}
 */
var DIRECTORY =
{
    VIDEO:    0,
    ORIGIN:   1,
    DESTINY:  2,
    AMANDA:   3,
    BASKET:   4,
    PANTS:    5,
    PRINCESS: 6,
    FRUITS:   7,
    MOUNTAIN: 8,
    PASS:     9,
    BRIDGE:   10,
    MADDIE:   11,
    CREDITS:  12
};

/**
 * @constant
 * Directory of ordered sections in the Story Book.
 * @type {Array}
 */
var DIRECTORY_ARRAY =
[
    'video',
    'origin',
    'destiny',
    'amanda',
    'basket',
    'pants',
    'princess',
    'fruits',
    'mountain',
    'pass',
    'bridge',
    'maddie',
    'credits'
];

/**
 * @constant
 * URL to promo video on Vimeo.
 * @type {String}
 */
var VIMEO_URL = 'player.vimeo.com/video/118499561?title=0byline=0portrait=0&autoplay=1';

/**
 * @constructor
 * Creates a new StoryBook instance.
 */
function StoryBook(element)
{
    vars.Element.call(this, element);
} var parent = vars.inherit(StoryBook, vars.Element);

/**
 * @property
 * Child elements.
 * @type {Object}
 */
Object.defineProperty(StoryBook.prototype, 'children', { value: {}, writable: false });

/**
 * @property
 * Indicates whether this StoryBook instance is in lightbox mode.
 * @type {Boolean}
 */
Object.defineProperty(StoryBook.prototype, 'lightboxEnabled',
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
            video.trigger('pause');

            var vimeo = $('<iframe id="vimeo" src="//'+VIMEO_URL+'" frameborder="0" portrait="0" title="0" webkitallowfullscreen mozallowfullscreen allowfullscreen/>');
            dialog.append(vimeo);

            utils.changeChildState(layer, 'state-visible');
            utils.changeChildState(dialog, 'state-visible');

            $('html, body').animate({ scrollTop: section.offset().top });
        }
        else
        {
            video.trigger('play');

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
StoryBook.prototype.init = function()
{
    this.responsive = !utils.isMobileVersion();

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

StoryBook.prototype.initNav = function()
{
    if (utils.isMobileVersion()) return;

    var nav = document.createElement('nav');

    var arrlen = vars.sizeOf(DIRECTORY_ARRAY);

    for (var i = 0; i < arrlen; i++)
    {
        var node = document.createElement('a');
        node.setAttribute('href', '#'+DIRECTORY_ARRAY[i]);
        nav.appendChild(node);
        $(node).click(this._onNavNodeClick);
    }

    $(this.element).prepend(nav);
};

/**
 * @public
 * Initializes the mobile version of this StoryBook instance.
 */
StoryBook.prototype.initMobile = function()
{
    var self = this;

    // Selectors.
    var sNotice = document.createElement('p');
    sNotice.textContent = 'For full experience please visit the desktop version.';

    // Set up the video section depending on the current device.
    $(this.children.sections[DIRECTORY.VIDEO]).find('.background-layer').append(document.createElement('figure'));

    // Set up the scroll button.
    $(this.children.scrollButton).click(self._onScrollButtonClick.bind(self));

    // Set up video toggles.
    $(this.children.videoToggles).each(function() { $(this).click(self._onVideoToggleClick.bind(self)); });

    // Set up notice.
    $(this.children.sections[DIRECTORY.VIDEO]).find('.content-layer summary aside').append(sNotice);
};

/**
 * @public
 * Initializes the desktop version of this StoryBook instance.
 */
StoryBook.prototype.initDesktop = function()
{
    var self = this;

    // Set up lightbox.
    var lightbox = document.createElement('dialog');
    lightbox.setAttribute('data-target', 'lightbox');

    var layer = document.createElement('div');
    layer.className = 'overlay-layer';
    layer.appendChild(lightbox);

    $(this.children.sections[DIRECTORY.VIDEO]).append(layer);

    // Set up dialogs.
    var arrlen = DIRECTORY_ARRAY.length;

    for (var i = 0; i < arrlen; i++)
    {
        var target = DIRECTORY_ARRAY[i];
        var data = Dialogs[target];

        if (data)
        {
            var dialog = new Dialog();
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

    // Set up the video section depending on the current device.
    var eVideoBackground = new vars.Video();
    eVideoBackground.class = 'preview';
    eVideoBackground.source = [{ src: 'assets/videos/preview.mp4' }, { src: 'assets/videos/preview.ogv', type: 'video/ogg' }];
    eVideoBackground.autoplay = true;
    eVideoBackground.loop = true;

    $(this.children.sections[DIRECTORY.VIDEO]).find('.background-layer').append(eVideoBackground.element);

    // Set up the scroll button.
    $(this.children.scrollButton).click(self._onScrollButtonClick.bind(self));

    // Set up background toggles.
    $(this.children.backgroundToggles).each(function() { $(this).mouseover(self._onBackgroundToggleMouseOver.bind(self)); });
    $(this.children.backgroundToggles).each(function() { $(this).mouseout(self._onBackgroundToggleMouseOut.bind(self)); });

    // Set up garment toggles.
    $(this.children.garmentToggles).each(function() { $(this).mouseover(self._onGarmentToggleMouseOver.bind(self)); });
    $(this.children.garmentToggles).each(function() { $(this).mouseout(self._onGarmentToggleMouseOut.bind(self)); });

    // Set up video toggles.
    $(this.children.videoToggles).each(function() { $(this).click(self._onVideoToggleClick.bind(self)); });

    // Set up dialog toggles.
    $(this.children.dialogToggles).each(function() { $(this).click(self._onDialogToggleClick.bind(self)); });

    // Set up dialog dismiss buttons.
    sDialogDismissButtons.each(function() { $(this).click(self._onDialogDismissButtonClick.bind(self)); });

    $(document).mousemove(self._onDocumentMouseMove.bind(self));
    $(document).click(self._onDocumentClick.bind(self));
};

/**
 * @inheritDoc
 */
StoryBook.prototype.update = function(dirtyTypes)
{
    if (this.isDirty(vars.DirtyType.POSITION|vars.DirtyType.SIZE))
    {
        this._updateNav();
        this._updatePages();
    }

    if (this.isDirty(vars.DirtyType.SIZE))
    {
        this._updateBackgroundSizes();
    }

    parent.prototype.update.call(this);
};

/**
 * @private
 * Updates the nav nodes, specifically managing the active state of each node.
 */
StoryBook.prototype._updateNav = function()
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
StoryBook.prototype._updatePages = function()
{
    if (utils.isMobileVersion()) return;
    if (!this.children.sections) return;

    var viewportRect = vars.getViewportRect();
    var sVideo = $('video.preview');

    for (var key in DIRECTORY)
    {
        var section = $(this.children.sections[DIRECTORY[key]]);
        var elements = section.find('[data-type="basic-transition"], [data-type="hover-transition"]');
        var nElements = elements.length;

        for (var i = 0; i < nElements; i++)
        {
            var element = elements[i];
            var figures = $(element).find('figure');
            var isHoverTransition = ($(element).attr('data-type') === 'hover-transition');

            if (vars.getIntersectRect(section).height > viewportRect.height*0.5)
            {
                utils.changeChildState(element, 'state-visible');

                if (isHoverTransition)
                {
                    if (figures.length === 2 && !$(figures[1]).hasClass('state-visible'))
                    {
                        utils.changeChildState(figures[0], 'state-visible');
                        utils.changeChildState(figures[1], 'state-hidden');
                    }
                }
            }
            else
            {
                utils.changeChildState(element, 'state-hidden');

                if (isHoverTransition)
                {
                    if (figures.length === 2)
                    {
                        utils.changeChildState(figures[0], 'state-hidden');
                        utils.changeChildState(figures[1], 'state-hidden');
                    }
                }
            }
        }

        if (DIRECTORY[key] === DIRECTORY.VIDEO)
        {
            if (vars.getIntersectRect(section).height > viewportRect.height*0.5 && !this.lightboxEnabled)
            {
                sVideo.trigger('play');
            }
            else
            {
                sVideo.trigger('pause');
            }
        }
    }

    if ($(window).scrollTop() > viewportRect.height*0.5)
        {
            utils.changeChildState(this.children.scrollButton, 'state-hidden');
        }
        else
        {
            utils.changeChildState(this.children.scrollButton, 'state-visible');
        }
};

/**
 * @private
 * Updates all background sizes that are not automatically resized via background-size: cover,
 * particularly image sprites.
 */
StoryBook.prototype._updateBackgroundSizes = function()
{
    if (utils.isMobileVersion()) return;

    var viewportRect = vars.getViewportRect();
    var backgrounds = $(this.element).find('.background-layer figure');
    var vimeo = $('dialog[data-target="lightbox"]');

    $(backgrounds).each
    (
        function()
        {
            var type = $(this).css('background-size');

            if (type !== 'cover' && type !== 'contain')
            {
                var size = vars.transform(this, { width: viewportRect.width, height: viewportRect.height, aspectRatio: 1920/1080, type: 'cover' }, { type: 'cover' });
                var position = { left: (viewportRect.width - size.width)/2, top: (viewportRect.height - size.height)/2 };

                vars.translate(this, { left: position.left, top: position.top });
            }
        }
    );

    vars.transform(vimeo, { width: viewportRect.width, height: viewportRect.height, aspectRatio: 1280/720, type: 'cover' }, { width: viewportRect.width*0.8, height: viewportRect.height*0.8 });
};

/**
 * @private
 * Handler invoked when the nav node is clicked.
 * @param  {Object} event
 */
StoryBook.prototype._onNavNodeClick = function(event)
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
StoryBook.prototype._onBackgroundToggleMouseOver = function(event)
{
    var section = $(event.currentTarget).closest('section');
    var background = $(section).find('[data-type="toggle-transition"]');

    utils.changeChildState(background, 'state-visible');
};

/**
 * @private
 * Handler invoked when a background toggle is moused out.
 * @param  {Object} event
 */
StoryBook.prototype._onBackgroundToggleMouseOut = function(event)
{
    var section = $(event.currentTarget).closest('section');
    var background = $(section).find('[data-type="toggle-transition"]');

    utils.changeChildState(background, 'state-hidden');
};

/**
 * @private
 * Handler invoked when a garment toggle is moused over.
 * @param  {Object} event
 */
StoryBook.prototype._onGarmentToggleMouseOver = function(event)
{
    var section = $(event.currentTarget).closest('section');
    var target = $(event.currentTarget).attr('data-target');
    var background = $(section).find('[data-type="garment-transition"][data-target="'+target+'"]');

    utils.changeChildState(background, 'state-visible');
};

/**
 * @private
 * Handler invoked when a garment toggle is moused out.
 * @param  {Object} event
 */
StoryBook.prototype._onGarmentToggleMouseOut = function(event)
{
    var section = $(event.currentTarget).closest('section');
    var target = $(event.currentTarget).attr('data-target');
    var background = $(section).find('[data-type="garment-transition"][data-target="'+target+'"]');

    utils.changeChildState(background, 'state-hidden');
};

/**
 * @private
 * Handler invoked when the scroll button is clicked.
 * @param  {Object} event
 */
StoryBook.prototype._onScrollButtonClick = function(event)
{
    var section = $('section#origin');

    $('html, body').animate({ scrollTop: section.offset().top });
};

/**
 * @private
 * Handler invoked when a video toggle is clicked.
 * @param  {Object} event
 */
StoryBook.prototype._onVideoToggleClick = function(event)
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
StoryBook.prototype._onDialogToggleClick = function(event)
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
StoryBook.prototype._onDialogDismissButtonClick = function(event)
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
 * Handler invoked when mouse moves.
 * @param  {Object} event
 */
StoryBook.prototype._onDocumentMouseMove = function(event)
{
    var viewportRect = vars.getViewportRect();

    // Set up background transitions that rely on mouse position.
    for (var key in DIRECTORY)
    {
        var section = $(this.children.sections[DIRECTORY[key]]);
        var elements = section.find('[data-type="hover-transition"]');
        var nElements = elements.length;

        if (vars.getIntersectRect(section).height > viewportRect.height*0.5)
        {
            for (var i = 0; i < nElements; i++)
            {
                var element = elements[i];
                var figures = $(element).find('figure');

                if (figures.length === 2)
                {
                    var mouseX = (event) ? event.pageX : 0;

                    if (mouseX > viewportRect.width*0.5)
                    {
                        utils.changeChildState(figures[0], 'state-hidden');
                        utils.changeChildState(figures[1], 'state-visible');
                    }
                    else
                    {
                        utils.changeChildState(figures[0], 'state-visible');
                        utils.changeChildState(figures[1], 'state-hidden');
                    }
                }
            }
        }
    }
};

/**
 * @private
 * Handler invoked when the window is clicked.
 * @param  {Object} event
 */
StoryBook.prototype._onDocumentClick = function(event)
{
    if ($(event.target).closest('dialog').length > 0 || $(event.target).closest('button').length > 0)
    {
        return;
    }
    else
    {
        this.element.find('dialog').each(function() { utils.changeChildState(this, 'state-hidden'); });
        this.element.find('.overlay-layer').each(function() { utils.changeChildState(this, 'state-hidden'); });

        if (this.lightboxEnabled)
        {
            this.lightboxEnabled = !this.lightboxEnabled;
        }
    }
};

return StoryBook; }(window));
