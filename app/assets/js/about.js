/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var $ = require('jquery');
var vars = require('vars');

var HeaderController = require('./controllers/HeaderController');
var AboutController = require('./controllers/AboutController');

vars.module((function() {

/**
 * @constructor
 * Creates a new Main instance.
 */
function Main(init)
{
    vars.Element.call(this, init);
} var parent = vars.inherit(Main, vars.Element);

/**
 * @inheritDoc
 */
Main.prototype.init = function()
{
    this.addVirtualChild(new HeaderController({ activeTarget: 'about' }), 'header');
    this.addVirtualChild(new AboutController($('main.about').get(0)));

    parent.prototype.init.call(this);
};

return Main; }()));
