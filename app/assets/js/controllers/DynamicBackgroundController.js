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
 * Controller of the interactive background.
 */
module.exports = (function(global) {

/**
 * @constructor
 * Creates a new DynamicBackgroundController instance.
 */
function DynamicBackgroundController(element)
{
    vars.Element.call(this, element);
} var parent = vars.inherit(DynamicBackgroundController, vars.Element);

/**
 * @property (read-only)
 * Child elements.
 * @type {Object}
 */
Object.defineProperty(DynamicBackgroundController.prototype, 'children', { value: {}, writable: false });

/**
 * @property (read-only)
 * Current active section index.
 * @type {Number}
 */
Object.defineProperty(DynamicBackgroundController.prototype, 'index',
{
    get: function()
    {
        return this._index || 0;
    },
    set: function(value)
    {
        if (this._index === value) return;

        this._deactivateBackgroundForSectionAt(this._index);
        this._activateBackgroundForSectionAt(value);

        Object.defineProperty(this, '_index', { value: value, writable: true });
    }
});

Object.defineProperty(DynamicBackgroundController.prototype, 'lightboxEnabled',
{
    get: function()
    {
        return this._lightboxEnabled || false;
    },
    set: function(value)
    {
        if (this._lightboxEnabled === value) return;

        var filter = $(this.element).find('> div.filter');

        if (value)
        {
            utils.changeChildState(filter, 'state-visible');
        }
        else
        {
            utils.changeChildState(filter, 'state-hidden');
        }

        Object.defineProperty(this, '_lightboxEnabled', { value: value, writable: true });
    }
});

/**
 * @inheritDoc
 */
DynamicBackgroundController.prototype.init = function()
{
    this.updateDelegate.receptive = vars.DirtyType.SIZE;

    // Set up video background.
    var eVideoBackground = new vars.Video();
    eVideoBackground.class = 'preview';
    eVideoBackground.source = [{ src: 'assets/videos/preview.mp4' }, { src: 'assets/videos/preview.ogv', type: 'video/ogg' }];
    eVideoBackground.autoplay = true;
    eVideoBackground.loop = true;
    $(this.element).find('section.video').prepend(eVideoBackground.element);

    // Set up child elements.
    this.children.video = eVideoBackground.element;
    this.children.sections = $(this.element).find('> section');

    // Set up mouse move handler (for hover transitions).
    $(document).mousemove(vars.debounce(this._onDocumentMouseMove.bind(this), 100));

    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
DynamicBackgroundController.prototype.update = function(dirtyTypes)
{
    if (this.updateDelegate.isDirty(vars.DirtyType.SIZE))
    {
        var viewportRect = vars.getViewportRect();
        var figures = $(this.element).find('> section figure');

        $(figures).each
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
    }

    parent.prototype.update.call(this);
};

/**
 * Plays all the videos.
 */
DynamicBackgroundController.prototype.play = function()
{
    $(this.children.video).trigger('play');
};

/**
 * Pauses all the videos.
 */
DynamicBackgroundController.prototype.pause = function()
{
    $(this.children.video).trigger('pause');
};

/**
 * Shows the toggle background of the section in the current index.
 */
DynamicBackgroundController.prototype.showToggleBackground = function()
{
    var section = this.children.sections[this.index];
    var background = $(section).find('[data-type="toggle-transition"]');

    utils.changeChildState(background, 'state-visible');
};

/**
 * Hides the toggle background of the section in the current index.
 */
DynamicBackgroundController.prototype.hideToggleBackground = function()
{
    var section = this.children.sections[this.index];
    var background = $(section).find('[data-type="toggle-transition"]');

    utils.changeChildState(background, 'state-hidden');
};

/**
 * Shows the garment background at the specified target.
 */
DynamicBackgroundController.prototype.showGarmentBackground = function(target)
{
    var section = this.children.sections[this.index];
    var background = $(section).find('[data-type="garment-transition"][data-target="'+target+'"]');

    utils.changeChildState(background, 'state-visible');
};

/**
 * Hides the garment background at the specified target.
 */
DynamicBackgroundController.prototype.hideGarmentBackground = function(target)
{
    var section = this.children.sections[this.index];
    var background = $(section).find('[data-type="garment-transition"][data-target="'+target+'"]');

    utils.changeChildState(background, 'state-hidden');
};

/**
 * @private
 * Activates the background at the section with the specified index.
 * @param  {Number} index
 */
DynamicBackgroundController.prototype._activateBackgroundForSectionAt = function(index)
{
    var section = this.children.sections[index];

    if (!section) return;

    utils.changeChildState(section, 'state-visible');

    var figures = $(section).find('[data-type="basic-transition"]');
    var nFigures = figures.length;

    for (var i = 0; i < nFigures; i++)
    {
        utils.changeChildState(figures, 'state-visible');
    }
};

/**
 * @private
 * Deactivates the background at the section with the specified index.
 * @param  {Number} index
 */
DynamicBackgroundController.prototype._deactivateBackgroundForSectionAt = function(index)
{
    var nSections = this.children.sections.length;

    for (var i = 0; i < nSections; i++)
    {
        var section = this.children.sections[i];
        var figures = $(section).find('figure');
        var nFigures = figures.length;

        utils.changeChildState(section, 'state-hidden');

        for (var j = 0; j < nFigures; j++)
        {
            utils.changeChildState(figures[j], 'state-hidden');
        }
    }
};

/**
 * @private
 * Handler invoked when mouse moves.
 * @param  {Object} event
 */
DynamicBackgroundController.prototype._onDocumentMouseMove = function(event)
{
    var section = this.children.sections[this.index];

    if ($(section).attr('data-type') !== 'hover-transition') return;

    var viewportRect = vars.getViewportRect();
    var figures = $(section).find('figure');

    if (figures.length !== 2) return;

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
};

return DynamicBackgroundController; }(window));
