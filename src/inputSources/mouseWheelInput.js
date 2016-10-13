(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var scrollTimeout;
    var scrollTimeoutDelay = 1;

    function mouseWheel(e) {
        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(function() {
            var element = e.target.parentNode;

            if (!e.deltaY) {
                return;
            }

            var x;
            var y;
            if (e.pageX !== undefined && e.pageY !== undefined) {
                x = e.pageX;
                y = e.pageY;
            }

            var startingCoords = cornerstone.pageToPixel(element, x, y);

            var wheelDeltaPixels;
            var pixelsPerLine = 40;
            var pixelsPerPage = 800;

            if (e.deltaMode === 2) {
                // DeltaY is in Pages
                wheelDeltaPixels = e.deltaY * pixelsPerPage;
            } else if (e.deltaMode === 1) {
                // DeltaY is in Lines
                wheelDeltaPixels = e.deltaY * pixelsPerLine;
            } else {
                // DeltaY is already in Pixels
                wheelDeltaPixels = e.deltaY;
            }

            var direction = e.deltaY < 0 ? -1 : 1;

            var mouseWheelData = {
                element: element,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                direction: direction,
                wheelDeltaPixels: wheelDeltaPixels,
                pageX: x,
                pageY: y,
                imageX: startingCoords.x,
                imageY: startingCoords.y
            };

            $(element).trigger('CornerstoneToolsMouseWheel', mouseWheelData);
        }, scrollTimeoutDelay);
    }

    function enable(element) {
        // Prevent handlers from being attached multiple times
        disable(element);

        cornerstoneTools.addWheelListener(element, mouseWheel);
    }

    function disable(element) {
        cornerstoneTools.removeWheelListener(element, mouseWheel);
    }

    // module exports
    cornerstoneTools.mouseWheelInput = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneTools);
