(function($, cornerstone, cornerstoneTools) {

  'use strict';

  // This module is for creating segmentation overlays

  var width;
  var height;
  var radius;
  var mousedown = 0; // RECONSIDER IF THIS IS SENSELESS!!!
  var overlayId = 'overlay://1';
  
  function setRadius(newRadius) {
    radius = newRadius;
  }

  function getImageSize(enabledElement) {
    if (enabledElement.viewport.rotation === 0 || enabledElement.viewport.rotation === 180) {
      return {
        width: enabledElement.image.width,
        height: enabledElement.image.height
      };
    } else {
      return {
        width: enabledElement.image.height,
        height: enabledElement.image.width
      };
    }
  }
  
  function showPointer(event, overlayCtx, elementOverlay, enabledOverlay){
    var viewportOverlay = cornerstone.getViewport(elementOverlay);           
    var pixelCoords = cornerstone.pageToPixel(elementOverlay, event.pageX, event.pageY);
    var viewportScale = viewportOverlay.scale;
    cornerstone.setToPixelCoordinateSystem(enabledOverlay, overlayCtx);
    overlayCtx.setLineDash([ 0.1 / viewportScale, 0.5 / viewportScale ]);
    overlayCtx.beginPath();
    overlayCtx.lineWidth = 1 / viewportScale;
    overlayCtx.arc(pixelCoords.x, pixelCoords.y, radius / viewportScale, 0, 2 * Math.PI, true);
    overlayCtx.strokeStyle = 'green';
    overlayCtx.fillStyle = 'green';
    overlayCtx.stroke();
    overlayCtx.fill();
  }

  function drawPointer(event, overlayCtx, elementOverlay, enabledOverlay, brush){
    var viewportOverlay = cornerstone.getViewport(elementOverlay);          
    var pixelCoords = cornerstone.pageToPixel(elementOverlay, event.pageX, event.pageY);
    var viewportScale = viewportOverlay.scale;
    cornerstone.setToPixelCoordinateSystem(enabledOverlay, overlayCtx);
    overlayCtx.setLineDash([ 0.1 / viewportScale, 0.5 / viewportScale ]);
    overlayCtx.beginPath();
    overlayCtx.lineWidth = 1 / viewportScale;
    overlayCtx.arc(pixelCoords.x, pixelCoords.y, radius / viewportScale, 0, 2 * Math.PI, true);
    overlayCtx.strokeStyle = 'rgba(255,255,0,255)';
    overlayCtx.fillStyle = 'rgba(255,255,0,255)';
    overlayCtx.stroke();
    overlayCtx.fill();

    var ppoint = [ pixelCoords.x, pixelCoords.y ];
    brush.indexes.push(ppoint);
    brush.radius = radius;
    brush.scale = viewportScale;
  }
  
  function updateTheImage(elementOverlay) {
    return cornerstone.loadImage(overlayId).then(function(image) {
      var viewport = cornerstone.getViewport(elementOverlay);
      cornerstone.displayImage(elementOverlay, image, viewport);
    });
  }

  function enable(element, elementOverlay, overlayObject, brush) {
    var enabledElement = cornerstone.getEnabledElement(element);
    if (element === undefined || elementOverlay === undefined) {
      throw 'getEnabledElement: parameter element must not be undefined';
    }
    
    var synchronizer = new cornerstoneTools.Synchronizer('CornerstoneImageRendered', cornerstoneTools.panZoomSynchronizer);

    var size = getImageSize(enabledElement);
    width = size.width;
    height = size.height;
    
    overlayObject.data = new Uint8ClampedArray(width * height * 4);

    // Note: as all channels including the alpha channel are 255, this image is completly transparent
    var indexes = width * height * 4; // RGBA
    for (var i = 0; i< indexes; i++){
      overlayObject.data[i] = 255;
    }

    overlayObject.width = width;
    overlayObject.height = height;
        
    cornerstone.enable(elementOverlay);
    var enabledOverlay = cornerstone.getEnabledElement(elementOverlay);
    var overlayCtx = enabledOverlay.canvas.getContext('2d');
    overlayCtx.globalAlpha = 0.5;
    overlayCtx.globalCompositeOperation = 'xor';
    
    cornerstone.loadImage(overlayId).then(function(image) {
      cornerstone.displayImage(elementOverlay, image);

      cornerstoneTools.mouseInput.enable(elementOverlay);
      cornerstoneTools.pan.activate(elementOverlay, 2);
      cornerstoneTools.zoom.activate(elementOverlay, 4);

      synchronizer.add(element);
      synchronizer.add(elementOverlay);
      
      $(elementOverlay).mousemove(function(event) {
        if (mousedown === 0) { // TODO: GET RID OF THIS IF !!!!
          updateTheImage(elementOverlay);
          showPointer(event, overlayCtx, elementOverlay, enabledOverlay);
        }
      });
      
      $(elementOverlay).mousedown(function(event) {
        if (mousedown === 0) {
          updateTheImage(elementOverlay);
        }

        mousedown = 1;
        var mouseButton = event.which;
        if (mouseButton === 1) {
          drawPointer(event, overlayCtx, elementOverlay, enabledOverlay, brush);
          $(document).mousemove(function(event) {
            drawPointer(event, overlayCtx, elementOverlay, enabledOverlay, brush);
          });
        }
        
        $(document).mouseup(function() {
          $(document).unbind('mousemove');
          $(document).unbind('mouseup');
          
          mousedown = 0;
          updateTheImage(elementOverlay);
        });
      });

    });
    
  }

  // Module exports
  cornerstoneTools.overlay = {
    enable: enable,
    setRadius: setRadius,
  };

})($, cornerstone, cornerstoneTools);
