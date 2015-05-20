/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var vars = require('vars');

/**
 * @class
 * Popup dialog windows in the Story Book.
 */
module.exports = (function(global) {

/**
 * @constructor
 * Creates a new DialogController instance.
 */
function DialogController(element)
{
    vars.Element.call(this, element);
} var parent = vars.inherit(DialogController, vars.Element);

/**
 * @property
 * Event listener when the dismiss button is clicked.
 * @type {Function}
 */
Object.defineProperty(DialogController.prototype, 'ondismiss', { value: null, writable: true });

/**
 * @inheritDoc
 */
DialogController.prototype.init = function()
{
    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
DialogController.prototype.update = function(dirtyTypes)
{
    if (this.isDirty(vars.DirtyType.DATA))
    {
        this._refresh();
    }

    parent.prototype.update.call(this, dirtyTypes);
};

/**
 * @inheritDoc
 */
DialogController.prototype.factory = function()
{
    return document.createElement('dialog');
};

/**
 * @private
 * Refreshes the internal element
 */
DialogController.prototype._refresh = function()
{
    if (!this.data) return;

    // Clear element.
    while (this.element.hasChildNodes())
    {
        this.element.removeChild(this.element.lastChild);
    }

    var dismissButton = document.createElement('button');
    dismissButton.className = 'dismiss';
    dismissButton.addEventListener(vars.EventType.MOUSE.CLICK, this._onDismiss.bind(this));

    var header = document.createElement('header');

    var headline = (this.data.headline) ? document.createElement('h4') : null;
    if (headline) headline.innerHTML = this.data.headline;

    var subHeadline = (this.data.subHeadline) ? document.createElement('h5') : null;
    if (subHeadline) subHeadline.innerHTML = this.data.subHeadline;

    if (headline) header.appendChild(headline);
    if (subHeadline) header.appendChild(subHeadline);

    var aside = document.createElement('aside');
    var n = this.data.description.length;

    for (var i = 0; i < n; i++)
    {
        var p = document.createElement('p');
        p.innerHTML = this.data.description[i];
        aside.appendChild(p);
    }

    this.element.appendChild(dismissButton);
    this.element.appendChild(header);
    this.element.appendChild(aside);
};

/**
 * @private
 * Handler invoked when the dimiss button is clicked.
 * @param  {Object} event
 */
DialogController.prototype._onDismiss = function(event)
{
    if (this.ondismiss)
    {
        this.ondismiss.call(null, event);
    }
};

return DialogController; }(window));
