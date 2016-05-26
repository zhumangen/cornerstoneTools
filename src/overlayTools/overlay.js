(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This module is for creating segmentation overlays

    var brush = {
        draw: 1,
        indexes: [],
        radius: 10,
        hoverColor: 'green',
        dragColor: 'yellow',
        overlayColor: 'red'
    };

    var currentCanvasCoords;
    var dynamicImageCanvas = document.createElement('canvas');

    /*function getBytesForBinaryFrame(numPixels) {
      // check whether the 1-bit pixels exactly fit into bytes
      var remainder = numPixels % 8;
      // number of bytes that work on an exact fit
      var bytesRequired =  Math.floor(numPixels / 8);
      
      // add one byte if we have a remainder
      if (remainder > 0) {
        bytesRequired++;
      }

      return bytesRequired;
    }

    function packBitArray(pixelData, rows, columns) {
        var length = getBytesForBinaryFrame(numPixels);
        var pixelData = new Uint8Array(length);

        var bytePos = 0;
        for (var count = 0; count < numPixels; count++) {
            // Compute byte position
            bytePos = Math.floor(count / 8);

            var pixValue = (pixelData[count] !== 0);
            pixelData[bytePos] = pixelData[bytePos] | pixValue << (count % 8);
        }

        return pixelData;
      }
    }*/

    /*function getBitArray(element) {
      return pixelData;
    }*/

    function setRadius(newRadius) {
        brush.radius = newRadius;
    }

    function mouseMoveCallback(e, eventData) {
        currentCanvasCoords = eventData.currentPoints.canvas;
        cornerstone.updateImage(eventData.element);
    }

    function defaultStrategy(eventData) {
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var coords = eventData.currentPoints.canvas;

        context.save();

        context.beginPath();
        context.arc(coords.x, coords.y, brush.radius * enabledElement.viewport.scale, 0, 2 * Math.PI, true);
        context.strokeStyle = brush.dragColor;
        context.fillStyle = brush.dragColor;
        context.stroke();
        context.fill();

        context.restore();

        brush.indexes.push({
            x: Math.round(eventData.currentPoints.image.x),
            y: Math.round(eventData.currentPoints.image.y)
        });

        currentCanvasCoords = eventData.currentPoints.canvas;
    }

    function mouseUpCallback(e, eventData) {
        currentCanvasCoords = eventData.currentPoints.canvas;
        cornerstone.updateImage(eventData.element, true);
    }

    function dragCallback(e, eventData) {
        cornerstoneTools.overlay.strategy(eventData);
        return false;
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
            cornerstoneTools.overlay.strategy(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function onImageRendered(e, eventData) {
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var coords = currentCanvasCoords;
        if (!coords) {
            return;
        }

        context.save();

        context.beginPath();
        context.arc(coords.x, coords.y, brush.radius * enabledElement.viewport.scale, 0, 2 * Math.PI, true);
        context.strokeStyle = brush.hoverColor;
        context.fillStyle = brush.hoverColor;
        context.stroke();
        context.fill();

        context.restore();
    }

    function getPixelData() {
        /*jshint validthis:true */

        var overlayColor;
        if (brush.draw === 1) {
            // Draw
            overlayColor = brush.overlayColor;
        } else {
            // Erase
            overlayColor = 'rgba(0,0,0,0)';
        }

        var numPoints = brush.indexes.length;

        var context = dynamicImageCanvas.getContext('2d');

        for (var i = 0; i < numPoints; i++) {
            var coords = brush.indexes[i];

            context.save();

            context.beginPath();
            context.arc(coords.x, coords.y, brush.radius, 0, 2 * Math.PI, true);
            context.strokeStyle = overlayColor;
            context.fillStyle = overlayColor;
            context.stroke();
            context.fill();

            context.restore();
        }

        brush.indexes = [];

        var width = this.width;
        var height = this.height;

        var imageData = context.getImageData(0, 0, width, height);
        return imageData.data;
    }

    function activate(element, mouseButtonMask, options) {
        $(element).off('CornerstoneImageRendered', onImageRendered);
        $(element).on('CornerstoneImageRendered', onImageRendered);

        cornerstone.updateImage(element);

        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
        var eventData = {
            mouseButtonMask: mouseButtonMask,
            options: options
        };

        $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownCallback);

        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseMove', mouseMoveCallback);

        var enabledElement = cornerstone.getEnabledElement(element);

        var dynamicImage = {
            minPixelValue: 0,
            maxPixelValue: 255,
            slope: 1.0,
            intercept: 0,
            windowCenter: 127,
            windowWidth: 256,
            getPixelData: getPixelData,
            rows: enabledElement.image.height,
            columns: enabledElement.image.width,
            height: enabledElement.image.height,
            width: enabledElement.image.width,
            color: true,
            invert: false,
            columnPixelSpacing: 1.0,
            rowPixelSpacing: 1.0,
            sizeInBytes: enabledElement.image.width * enabledElement.image.height * 4,
        };

        dynamicImageCanvas.width = dynamicImage.width;
        dynamicImageCanvas.height = dynamicImage.height;

        var context = dynamicImageCanvas.getContext('2d');
        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, dynamicImage.width, dynamicImage.height);

        cornerstone.addLayer(element, dynamicImage, {
          opacity: 0.5
        });
    }

    // Module exports
    cornerstoneTools.overlay = cornerstoneTools.mouseButtonTool({
        mouseDownCallback: mouseDownCallback,
        mouseMoveCallback: mouseMoveCallback,
        mouseDownActivateCallback: mouseDownCallback,
        onImageRendered: onImageRendered
    });

    cornerstoneTools.overlay.activate = activate;

    // TODO: Change to use setConfiguration
    cornerstoneTools.overlay.setRadius = setRadius;
    cornerstoneTools.overlay.getBitArray = getBitArray;

    cornerstoneTools.overlay.strategies = {
        default: defaultStrategy,
    };
    cornerstoneTools.overlay.strategy = defaultStrategy;

})($, cornerstone, cornerstoneTools);