(function (cs) {
  
  "use strict";
  
  var width;
  var height; 
  
  function getPixelData() {
    
    var index = 0;
    var radius = Math.round(brush.radius / brush.scale);
    var PiHalf = 0.5 * Math.PI;
    var brushLength = brush.indexes.length;
    
    var radiusSqr = radius*radius;
    
    var rgb;
    if ( brush.draw === 1) {
      rgb = 0;
    } else {
      rgb = 255;
    }
    
    for (var i=0; i<brush.indexes.length; i++){
    
      for (var circleY=0; circleY<radius; circleY++){
        var maxX = Math.sqrt( radiusSqr - circleY*circleY );
        for (var circleX=0; circleX<maxX; circleX++){

          var indexX = brush.indexes[i][0];
          var indexY = brush.indexes[i][1];

          var arrayindex = Math.round(indexY + circleY)*1024 + Math.round(indexX + circleX)*4;
          overlayData.data[arrayindex+1] = rgb;
          overlayData.data[arrayindex+2] = rgb;

          var arrayindex = Math.round(indexY + circleY)*1024 + Math.round(indexX - circleX)*4;
          overlayData.data[arrayindex+1] = rgb;
          overlayData.data[arrayindex+2] = rgb;

          var arrayindex = Math.round(indexY - circleY)*1024 + Math.round(indexX + circleX)*4;
          overlayData.data[arrayindex+1] = rgb;
          overlayData.data[arrayindex+2] = rgb;

          var arrayindex = Math.round(indexY - circleY)*1024 + Math.round(indexX - circleX)*4;
          overlayData.data[arrayindex+1] = rgb;
          overlayData.data[arrayindex+2] = rgb;

        }
      }
    }
    
    brush.indexes = [];
    return overlayData.data;
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
    return deferred;
  }
  
  // register our imageLoader plugin with cornerstone
  cs.registerImageLoader('overlay', getOverlayImage);

}(cornerstone));