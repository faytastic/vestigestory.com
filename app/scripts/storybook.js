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
var Header = require('./controllers/header');
var StoryBook = require('./controllers/storybook');
var utils = require('./utils/utils');

/**
 * @class
 * View model of the Main module.
 */
(function(global) {

/**
 * Ready DOM.
 */
$(document).ready(function()
{
    // Add class to indicate whether device is a touch device.
    if (utils.forceTouch)
    {
        $('html').removeClass('no-touch');
        $('html').addClass('touch');
    }

    var desktopImages =
    [
        'assets/storybook/amanda-swallow.png',
        'assets/storybook/amanda-tree.png',
        'assets/storybook/background-amanda.jpg',
        'assets/storybook/background-basket.jpg',
        'assets/storybook/background-bridge.png',
        'assets/storybook/background-credits.jpg',
        'assets/storybook/background-destiny.jpg',
        'assets/storybook/background-fruits.jpg',
        'assets/storybook/background-maddie.jpg',
        'assets/storybook/background-mountain.jpg',
        'assets/storybook/background-pants.jpg',
        'assets/storybook/background-princess.jpg',
        'assets/storybook/background-video.jpg',
        'assets/storybook/bridge-water.png',
        'assets/storybook/destiny-crane.png',
        'assets/storybook/destiny-island.png',
        'assets/storybook/fruits-skirts.png',
        'assets/storybook/maddie-flower.png',
        'assets/storybook/mountain-mountains.png',
        'assets/storybook/origin-background-bottle.jpg',
        'assets/storybook/origin-background-shirt.jpg',
        'assets/storybook/origin-bottle.png',
        'assets/storybook/pants-cloud.png',
        'assets/storybook/pants-wheat.png',
        'assets/storybook/pass-bottle.jpg',
        'assets/storybook/pass-tee.jpg',
        'assets/storybook/princess-petal.png',
        'assets/storybook/video-title-black.png',
        'assets/storybook/video-title-white.png'
    ];

    var mobileImages =
    [
        'assets/storybook/amanda-swallow.png',
        'assets/storybook/background-amanda-m.jpg',
        'assets/storybook/background-basket-m.jpg',
        'assets/storybook/background-credits.jpg',
        'assets/storybook/background-destiny-m.jpg',
        'assets/storybook/background-maddie-m.jpg',
        'assets/storybook/background-mountain-m.jpg',
        'assets/storybook/background-pass-m.jpg',
        'assets/storybook/background-princess-m.jpg',
        'assets/storybook/background-video.jpg',
        'assets/storybook/destiny-crane.png',
        'assets/storybook/mountain-mountains.png',
        'assets/storybook/pants-wheat.png',
        'assets/storybook/princess-petal.png',
        'assets/storybook/video-title-black.png',
        'assets/storybook/video-title-white.png'
    ];

    var preloader = new vars.AssetLoader();
    var sMain = $('main.story-book');
    var sPreloader = $('#preloader');
    var sProgressBar = sPreloader.find('.progress-bar');

    if (utils.isMobileVersion())
    {
        preloader.enqueue.apply(preloader, mobileImages);
    }
    else
    {
        preloader.enqueue.apply(preloader, desktopImages);
    }

    preloader.addEventListener(vars.EventType.OBJECT.LOAD,
        function(event)
        {
            if (event.detail.pending === 0)
            {
                utils.changeChildState(sMain, 'state-loaded');
                utils.changeChildState(sPreloader, 'state-hidden');

                var header = new Header(null, 'story-book');
                var storyBook = new StoryBook($('main.story-book'));

                setTimeout(
                    function()
                    {
                        sPreloader.remove();
                        preloader.destroy();
                        preloader = null;
                    }, 500);

            }
        });

    preloader.addEventListener(vars.EventType.OBJECT.PROGRESS,
        function(event)
        {
            vars.transform(sProgressBar, { width: vars.getViewportRect().width * preloader.progress });
            sProgressBar.css('opacity', preloader.progress);
        });

    preloader.init();
});

}(window));
