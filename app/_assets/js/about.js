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
var About = require('./controllers/about');

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
    this.addVirtualChild(new Header({ activeTarget: 'about' }), 'header');
    this.addVirtualChild(new About($('main.about').get(0)));

    parent.prototype.init.call(this);
};

return Main; }()));
