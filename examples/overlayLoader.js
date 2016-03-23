(function (cs) {
  
  "use strict";
  
  var width;
  var height;
  
  function getPixelData() {
    //var start = new Date().getTime();

    // TODO: Get rid of the object! This is slow.
    // TODO: Use BW instead to save time
    
    // If something was drawn, save it
    if (brush.indexes.length != 0){  // TODO: Is this really important or maybe could it work without this???
      var index = 0;
      var radius = Math.round(brush.radius / brush.scale);
      var PiHalf = 0.5 * Math.PI;
      for (var i=0; i<brush.indexes.length; i++){ // TODO: Using the object.length call here is extrem slow
        
        // Draw the center
        var arrayindex = Math.round(brush.indexes[i][1])*width*4 + Math.round(brush.indexes[i][0])*4;
        overlayData.data[arrayindex+1] = 0;
        overlayData.data[arrayindex+2] = 0;
        
        // Draw the circle
        // Only calculate 1/4 of the circle and mirror it in both directions
        for (var fill=0; fill<radius; fill++){ // TODO: Test if decreasing would be faster
          var steps = 90*fill; // TODO: Test this with bigger images 
          for (var j = 0; j < steps; j++) { // TODO: Test if decreasing would be faster
            var phase = PiHalf * j / steps;
            
            var circleX = fill * Math.cos(phase);
            var circleY = fill * Math.sin(phase);

            var arrayindex = Math.round(brush.indexes[i][1] + circleY)*1024 + Math.round(brush.indexes[i][0] + circleX)*4;
            overlayData.data[arrayindex+1] = 0;
            overlayData.data[arrayindex+2] = 0;

            var arrayindex = Math.round(brush.indexes[i][1] + circleY)*1024 + Math.round(brush.indexes[i][0] - circleX)*4;
            overlayData.data[arrayindex+1] = 0;
            overlayData.data[arrayindex+2] = 0;

            var arrayindex = Math.round(brush.indexes[i][1] - circleY)*1024 + Math.round(brush.indexes[i][0] + circleX)*4;
            overlayData.data[arrayindex+1] = 0;
            overlayData.data[arrayindex+2] = 0;

            var arrayindex = Math.round(brush.indexes[i][1] - circleY)*1024 + Math.round(brush.indexes[i][0] - circleX)*4;
            overlayData.data[arrayindex+1] = 0;
            overlayData.data[arrayindex+2] = 0;
          }
        }
      }
    }
    
    brush.indexes = [];
    
    //var end = new Date().getTime();
    //var run = end - start;
    //console.log('Rendering time: ' + run);
    
    var temp2 = overlayData.data; // TODO
    return temp2;
  }

  function getOverlayImage(imageId) {
    var image = {
      imageId: imageId,
      minPixelValue : 0,
      maxPixelValue : 255,
      slope: 1.0,
      intercept: 0,
      windowCenter : 127,
      windowWidth : 256,
      render: cs.renderOverlayImage,
      getPixelData: getPixelData,
      rows: overlayData.height,
      columns: overlayData.width,
      height: overlayData.height,
      width: overlayData.width,
      color: true,
      columnPixelSpacing: 1.0,
      rowPixelSpacing: 1.0,
      sizeInBytes: overlayData.width * overlayData.height * 4,
    };
    var deferred = $.Deferred();
    deferred.resolve(image);
    var temp = getPixelData();
    return deferred;
  }
  
  

  // register our imageLoader plugin with cornerstone
  cs.registerImageLoader('overlay', getOverlayImage);

}(cornerstone));