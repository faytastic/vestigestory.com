---
---

/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */

'use strict';

var $ = require('jquery');
var angular = require('angular');
var vars = require('vars');
var utils = require('../utils/utils');
var PRODUCTS = {{ site.data.collections.ss2015.products | jsonify }};

/**
 * @class
 * Angular controller of the CollectionController section.
 */
module.exports = (function() {

/**
 * @constant
 * Custom dirty type for scroll position of product page.
 * @type {Enum}
 */
var DIRTY_PAGE_SCROLL_POSITION = vars.DirtyType.CUSTOM;

/**
 * @constant
 * Custom dirty type for position of product page.
 * @type {Enum}
 */
var DIRTY_PAGE_POSITION = vars.DirtyType.CUSTOM << 1;

/**
 * @constructor
 * Creates a new CollectionController instance.
 */
function CollectionController($scope, $location)
{
    var self = this;

    // Confiture location provider.
    $scope.$watch
    (
        function()
        {
            return $location.hash();
        },
        function(id)
        {
            $scope.id = id;
        }
    );

    $scope.$watch('id', function(id)
    {
        if (id)
        {
            if ($scope.getIndexByID(id) < 0)
            {
                window.open('/collection', '_self');
            }
            else
            {
                $scope.activeIndex = $scope.getIndexByID(id);
            }
            return;
        }

        $scope.activeIndex = 0;
    });

    /**
     * @property
     * CollectionController of products.
     * @type {Array}
     */
    Object.defineProperty($scope, 'products', { value: PRODUCTS, writable: false });

    /**
     * @property
     * Current selected product index.
     * @type {Number}
     */
    Object.defineProperty($scope, 'activeIndex',
    {
        get: function()
        {
            return $scope._activeIndex || 0;
        },
        set: function(value)
        {
            if ($scope._activeIndex === value) return;

            $scope._activeIndex = value;
            $scope.activePageIndex = 0;
            $scope.pageShift = 'neutral';

            if ($scope.touchEnabled)
            {
                $(self.children.slides).animate({ scrollLeft: 0 });
            }

            self.updateDelegate.setDirty(vars.DirtyType.SIZE);
        }
    });

    /**
     * @property
     * Current selected product.
     * @type {Object}
     */
    Object.defineProperty($scope, 'activeProduct', { get: function() { return $scope.getProductByIndex($scope.activeIndex); }});

    /**
     * @property
     * Current selected product page index.
     * @type {Number}
     */
    Object.defineProperty($scope, 'activePageIndex',
    {
        get: function()
        {
            if (!this._activePageIndex) return 0;
            return this._activePageIndex;
        },
        set: function(value)
        {
            var nPages = this.activeProduct.assets.length;

            this._activePageIndex = vars.clamp(value, 0, nPages-1);

            if (this._activePageIndex === 0 || this._activePageIndex === nPages-1)
            {
                this.pageShift = 'neutral';
            }

            self.updateDelegate.setDirty(DIRTY_PAGE_POSITION);
        }
    });

    Object.defineProperty($scope, 'pageOffset',
    {
        get: function()
        {
            var rect = vars.getRect(self.element);
            var offset;

            switch ($scope.pageShift)
            {
                case 'left':    offset = 100; break;
                case 'right':   offset = -100; break;
                case 'neutral': offset = 0; break;
                default:        offset = 0; break;
            }

            offset += ($scope.activePageIndex * -rect.width);

            return offset;
        }
    });

    /**
     * @property
     * Specifies the direction the page should shift.
     * @type {String}
     */
    Object.defineProperty($scope, 'pageShift',
    {
        get: function()
        {
            if (!this._pageShift) return 'neutral';
            return this._pageShift;
        },
        set: function(value)
        {
            if (this._pageShift == value) return;
            this._pageShift = value;

            self.updateDelegate.setDirty(DIRTY_PAGE_POSITION);
        }
    });

    /**
     * @property
     * Specifies whether controller is touch enabled.
     * @type {Boolean}
     */
    Object.defineProperty($scope, 'touchEnabled', { value: $('html').hasClass('touch'), writable: false });

    /**
     * @public
     * Gets the product by its index.
     * @param  {Number} index
     * @return {Object}
     */
    $scope.getProductByIndex = function(index)
    {
        if (index >= $scope.products.length) return null;

        return $scope.products[index];
    };

    /**
     * @public
     * Gets the product by its ID.
     * @param  {String} id
     * @return {Object}
     */
    $scope.getProductByID = function(id)
    {
        var n = $scope.products.length;

        for (var i = 0; i < n; i++)
        {
            var product = $scope.products[i];

            if (product.id === id) return product;
        }

        return null;
    };

    /**
     * @public
     * Gets the product index by its ID.
     * @param  {String} id
     * @return {Number}
     */
    $scope.getIndexByID = function(id)
    {
        var n = $scope.products.length;

        for (var i = 0; i < n; i++)
        {
            var product = $scope.products[i];

            if (product.id === id) return i;
        }

        return -1;
    };

    /**
     * @private
     * Handler invoked when next page button is selected.
     * @param  {Object} $event
     */
    $scope._onNextPageSelect = function($event)
    {
        $scope.activePageIndex++;
    };

    /**
     * @private
     * Handler invoked when next page button is moused over.
     * @param  {Object} $event
     */
    $scope._onNextPageMouseOver = function($event)
    {
        $scope.pageShift = 'right';
    };

    /**
     * @private
     * Handler invoked when next page button is moused out.
     * @param  {Object} $event
     */
    $scope._onNextPageMouseOut = function($event)
    {
        $scope.pageShift = 'neutral';
    };

    /**
     * @private
     * Handler invoked when prev page button is selected.
     * @param  {Object} $event
     */
    $scope._onPrevPageSelect = function($event)
    {
        $scope.activePageIndex--;
    };

    /**
     * @private
     * Handler invoked when prev page button is moused over.
     * @param  {Object} $event
     */
    $scope._onPrevPageMouseOver = function($event)
    {
        $scope.pageShift = 'left';
    };

    /**
     * @private
     * Handler invoked when prev page button is moused out.
     * @param  {Object} $event
     */
    $scope._onPrevPageMouseOut = function($event)
    {
        $scope.pageShift = 'neutral';
    };

    /**
     * @private
     * Handler invoked when a product page is selected.
     * @param  {Number} $index
     */
    $scope._onPageSelect = function($index)
    {
        if ($scope.touchEnabled)
        {
            var viewportRect = vars.getViewportRect();

            $(self.children.slides).animate({ scrollLeft: $index*viewportRect.width });
        }

        $scope.activePageIndex = $index;
    };

    vars.Element.call(self, $('main.collection').get(0));
} var parent = vars.inherit(CollectionController, vars.Element);

/**
 * Child elements.
 * @type {Object}
 */
Object.defineProperty(CollectionController.prototype, 'children', { value: {}, writable: false });

/**
 * @inheritDoc
 */
CollectionController.prototype.init = function()
{
    var self = this;

    self.updateDelegate.responsive = true;
    self.updateDelegate.refreshRate = 20.0;

    self._navAcceleration = 0.0;
    self._productNavOffsetX = 0.0;

    self.children.display        = $(self.element).find('summary');
    self.children.nav            = $(this.element).find('nav#product-nav');
    self.children.infoButton     = $(self.element).find('button.info');
    self.children.pageNav        = $(self.element).find('summary article nav');
    self.children.productDetails = $(self.children.display).find('aside');
    self.children.slides         = $(self.children.display).find('article figure');

    if (utils.isTouchDevice())
    {
        $(self.children.slides).scroll(function() { self.updateDelegate.setDirty(DIRTY_PAGE_SCROLL_POSITION); });
    }
    else
    {
        self.children.nav.get(0).addEventListener(vars.EventType.MOUSE.MOUSE_ENTER, self._onNavMouseEnter.bind(self));
        self.children.nav.get(0).addEventListener(vars.EventType.MOUSE.MOUSE_LEAVE, self._onNavMouseLeave.bind(self));
        self.children.nav.get(0).addEventListener(vars.EventType.MOUSE.MOUSE_MOVE, self._onNavMouseMove.bind(self));
    }

    $(self.children.infoButton).click(self._onInfoButtonClick.bind(self));

    parent.prototype.init.call(self);
};

/**
 * @inheritDoc
 */
CollectionController.prototype.update = function(dirtyTypes)
{
    if (this.isDirty(vars.DirtyType.SIZE))
    {
        var displayRect = vars.getRect(this.children.display);
        var slides = $(this.children.slides.find('img'));
        vars.transform(this.children.slides, { width: displayRect.width * slides.length });
        vars.transform(slides, { width: displayRect.width, height: displayRect.height, aspectRatio: 1920/1080, type: 'cover' }, { type: 'cover' });

        var thumbRect = vars.getRect(this.children.nav.find('a').get(0));
        vars.transform(this.children.nav, { width: thumbRect.width*PRODUCTS.length });
    }

    if (this.isDirty(DIRTY_PAGE_POSITION|vars.DirtyType.SIZE))
    {
        var scope = angular.element(this.element).scope();
        vars.translate3d(this.children.slides, { x: scope.pageOffset });
    }

    if (this.isDirty(DIRTY_PAGE_SCROLL_POSITION))
    {
        var scrollX = $(this.children.slides).scrollLeft();
        var nPages = $(this.children.slides).find('img').length;
        var viewportRect = vars.getViewportRect();
        var navNodes = $(this.children.pageNav).find('.nav-node');
        var index = -1;

        for (var i = 0; i < nPages; i++)
        {
            if (scrollX >= (nPages-1-i)*viewportRect.width)
            {
                index = nPages-1-i;
                break;
            }
        }

        if (index > -1)
        {
            var scope = angular.element(this.element).scope();

            scope.$apply(function() { scope.activePageIndex = index; });
        }
    }

    parent.prototype.update.call(this, dirtyTypes);
};

/**
 * @private
 * Handler invoked when the info button is clicked.
 * @param  {Object} event
 */
CollectionController.prototype._onInfoButtonClick = function(event)
{
    if ($(event.currentTarget).hasClass('state-active'))
    {
        utils.changeChildState(event.currentTarget, 'state-inactive');
        utils.changeChildState(this.children.display, 'state-inactive');
    }
    else
    {
        utils.changeChildState(event.currentTarget, 'state-active');
        utils.changeChildState(this.children.display, 'state-active');
    }
};

/**
 * Handler invoked when the mouse moves.
 * @param  {Object} event
 */
CollectionController.prototype._onNavMouseMove = function(event)
{
    var viewportRect = vars.getViewportRect();
    var nullArea = viewportRect.width*0.3;
    var leftBound = (viewportRect.width - nullArea)/2;
    var rightBound = leftBound + nullArea;
    var mouseX = (event) ? event.pageX : 0;

    if (mouseX > leftBound && mouseX < rightBound) return;

    if (mouseX > rightBound)
    {
        this._navAcceleration = -(mouseX - nullArea - leftBound) / leftBound;
    }
    else
    {
        this._navAcceleration = (leftBound - mouseX) / leftBound;
    }
};

/**
 * @private
 * Handler invoked when the mouse enters the nav section.
 * @param  {Object} event
 */
CollectionController.prototype._onNavMouseEnter = function(event)
{
    if (!this._navScrollInterval)
    {
        this._navScrollInterval = setInterval(this._onNavScroll.bind(this), 1000/60);
    }
};

/**
 * @private
 * Handler invoked when the mouse leaves the nav section.
 * @param  {Object} event
 */
CollectionController.prototype._onNavMouseLeave = function(event)
{
    if (this._navScrollInterval)
    {
        clearInterval(this._navScrollInterval);
        this._navScrollInterval = null;
    }

    this._navAcceleration = 0.0;
};

/**
 * @private
 * Handler invoked when nav scroll interval is active.
 */
CollectionController.prototype._onNavScroll = function()
{
    var speed = 15.0;
    var newX = this._productNavOffsetX + speed*this._navAcceleration;
    var thumbnailRect = vars.getRect($(this.children.nav).find('a.thumbnail'));
    var maxX = 0.0;
    var minX = vars.getViewportRect().width - $(this.children.nav).find('a.thumbnail').length*thumbnailRect.width;

    newX = Math.max(minX, newX);
    newX = Math.min(maxX, newX);

    this._productNavOffsetX = newX;

    vars.translate3d(this.children.nav, { x: newX });
};

return CollectionController; }());
