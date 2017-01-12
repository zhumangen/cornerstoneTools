import * as cornerstone from 'cornerstone-core';

import isInteger from '../util/isInteger';
import getDistanceBetweenImagePositions from './getDistanceBetweenImagePositions';

function findClosestImage (imageIds, targetImageId) {
  let closestImageId;
  let minDistance = Infinity;

  // Find the closest image based on the distance between the
  imageIds.forEach((imageId) => {
    const distance = getDistanceBetweenImagePositions(imageId, targetImageId);

    if (distance < minDistance) {
      minDistance = distance;
      closestImageId = imageId;
    }
  });

  return closestImageId;
}

/**
* Creates a FusionRenderer
*
* @param stackOptions
*/
export default class FusionRenderer {

  // TODO: Create a base Renderer class and extend from it for the FusionRenderer
  constructor (stackOptions) {
    this.stackOptions = stackOptions;
    this.currentImageIdIndex = 0;
    this.preventCache = false;
    this.layerIds = [];
  }

  render (element, stack) {
    const imageObjects = stack.imageObjects;

    // Move this to base Renderer class
    if (!isInteger(this.currentImageIdIndex)) {
      throw new Error('FusionRenderer: render - Image ID Index is not an integer');
    }

    // TODO: Figure out what to do with LoadHandlers in this scenario...

    // For the base layer, go to the currentImageIdIndex
    const baseImageObject = imageObjects[0];
    const currentImage = baseImageObject.images[this.currentImageIdIndex];
    const currentImageId = currentImage.imageId;

    cornerstone.loadAndCacheImage(currentImageId).then((image) => {
      // TODO: Maybe make an Update Or Add layer function?
      if (this.layerIds && this.layerIds[0]) {
        const currentLayerId = this.layerIds[0];
        const layer = cornerstone.getLayers(element, currentLayerId);

        layer.image = image;
      } else {
        const layerId = cornerstone.addLayer(element, image);

        this.layerIds.push(layerId);
      }

      cornerstone.updateImage(element);
    });

    // Splice out the first image
    const overlayImageObjects = imageObjects.slice(1, imageObjects.length);

    // Loop through the remaining 'overlay' image objects
    overlayImageObjects.forEach(function (imgObj, overlayLayerIndex) {
      const imageIds = imgObj.images.map(function (image) {
        return image.imageId;
      });

      const imageId = findClosestImage(imageIds, currentImageId);

      if (!imageId) {
        throw new Error('FusionRenderer: findClosestImage did not return an imageId');
      }

      cornerstone.loadAndCacheImage(imageId).then((image) => {
        const layerIndex = overlayLayerIndex + 1;

        if (this.layerIds && this.layerIds[layerIndex]) {
          const currentLayerId = this.layerIds[layerIndex];
          const layer = cornerstone.getLayers(element, currentLayerId);

          layer.image = image;
        } else {
          const layerId = cornerstone.addLayer(element, image);

          this.layerIds.push(layerId);
        }

        cornerstone.updateImage(element);
      });
    });
  }
}
