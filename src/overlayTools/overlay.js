(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This module is for creating segmentation overlays

    var configuration = {
        draw: 1,
        radius: 10,
        hoverColor: 'green',
        dragColor: 'yellow',
        overlayColor: 'red'
    };

    var brush = {
        indexes: []
    };

    var currentCanvasCoords;
    var dynamicImageCanvas = document.createElement('canvas');

    function defaultStrategy(eventData) {
        var configuration = cornerstoneTools.overlay.getConfiguration();
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var coords = eventData.currentPoints.canvas;

        context.save();

        context.beginPath();
        context.arc(coords.x, coords.y, configuration.radius * enabledElement.viewport.scale, 0, 2 * Math.PI, true);
        context.strokeStyle = configuration.dragColor;
        context.fillStyle = configuration.dragColor;
        context.stroke();
        context.fill();

        context.restore();

        brush.indexes.push({
            x: Math.round(eventData.currentPoints.image.x),
            y: Math.round(eventData.currentPoints.image.y)
        });

        currentCanvasCoords = eventData.currentPoints.canvas;
    }

    function mouseMoveCallback(e, eventData) {
        currentCanvasCoords = eventData.currentPoints.canvas;
        cornerstone.updateImage(eventData.element);
    }

    function mouseUpCallback(e, eventData) {
        currentCanvasCoords = eventData.currentPoints.canvas;
        cornerstone.updateImage(eventData.element, true);

        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);
        $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
    }

    function dragCallback(e, eventData) {
        cornerstoneTools.overlay.strategy(eventData);
        return false;
    }

    function mouseDownActivateCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
            cornerstoneTools.overlay.strategy(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }

        $(eventData.element).on('CornerstoneToolsMouseDrag', mouseMoveCallback);
    }

    function onImageRendered(e, eventData) {
        var configuration = cornerstoneTools.overlay.getConfiguration();
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var coords = currentCanvasCoords;
        if (!coords) {
            return;
        }

        context.save();

        context.beginPath();
        context.arc(coords.x, coords.y, configuration.radius * enabledElement.viewport.scale, 0, 2 * Math.PI, true);
        context.strokeStyle = configuration.hoverColor;
        context.fillStyle = configuration.hoverColor;
        context.stroke();
        context.fill();

        context.restore();
    }

    function getPixelData() {
        /*jshint validthis:true */
        var configuration = cornerstoneTools.overlay.getConfiguration();

        var overlayColor;
        if (configuration.draw === 1) {
            // Draw
            overlayColor = configuration.overlayColor;
        } else {
            // Erase
            overlayColor = 'rgba(0,0,0,255)';
        }

        var numPoints = brush.indexes.length;

        var context = dynamicImageCanvas.getContext('2d');

        for (var i = 0; i < numPoints; i++) {
            var coords = brush.indexes[i];

            context.save();

            context.beginPath();
            context.arc(coords.x, coords.y, configuration.radius, 0, 2 * Math.PI, true);
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

    function activate(element, mouseButtonMask) {
        $(element).off('CornerstoneImageRendered', onImageRendered);
        $(element).on('CornerstoneImageRendered', onImageRendered);

        cornerstone.updateImage(element);
        
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
        $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

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
        mouseMoveCallback: mouseMoveCallback,
        mouseDownActivateCallback: mouseDownActivateCallback,
        onImageRendered: onImageRendered
    });

    cornerstoneTools.overlay.activate = activate;

    cornerstoneTools.overlay.setConfiguration(configuration);
    cornerstoneTools.overlay.strategies = {
        default: defaultStrategy,
    };
    cornerstoneTools.overlay.strategy = defaultStrategy;

})($, cornerstone, cornerstoneTools);
