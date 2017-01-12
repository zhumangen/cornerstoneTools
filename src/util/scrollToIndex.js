import * as cornerstone from 'cornerstone-core';
import requestPoolManager from '../requestPool/requestPoolManager';
import loadHandlerManager from '../stateManagement/loadHandlerManager';
import { stackScroll } from '../stackTools/stackScroll';
import { getStackData } from '../stacks/displayStack.js';

export default function (element, newImageIdIndex) {
  const stackData = getStackData(element);

  if (!stackData) {
    return;
  }

  const renderer = stackData.renderer;

  // Allow for negative indexing
  const baseImageObject = stackData.stack.imageObjects[0];
  const numImages = baseImageObject.images.length;

  if (newImageIdIndex < 0) {
    newImageIdIndex += numImages;
  }

  if (newImageIdIndex === renderer.currentImageIdIndex) {
    return;
  }

  const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
  const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

  function doneCallback (image) {
    if (stackData.currentImageIdIndex !== newImageIdIndex) {
      return;
    }

    // Check if the element is still enabled in Cornerstone,
    // If an error is thrown, stop here.
    try {
      // TODO: Add 'isElementEnabled' to Cornerstone?
      cornerstone.getEnabledElement(element);
    } catch(error) {
      return;
    }

    renderer.currentImageIdIndex = newImageIdIndex;
    renderer.render(element, stackData.stack);

    if (endLoadingHandler) {
      endLoadingHandler(element, image);
    }
  }

  function failCallback (error) {
    const imageId = stackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(element, imageId, error);
    }
  }

  if (newImageIdIndex === stackData.currentImageIdIndex) {
    return;
  }

  if (startLoadingHandler) {
    startLoadingHandler(element);
  }

  const eventData = {
    newImageIdIndex,
    direction: newImageIdIndex - stackData.currentImageIdIndex
  };

  stackData.currentImageIdIndex = newImageIdIndex;
  const newImageId = stackData.imageIds[newImageIdIndex];

    // Retry image loading in cases where previous image promise
    // Was rejected, if the option is set
  const config = stackScroll.getConfiguration();

  if (config && config.retryLoadOnScroll === true) {
    const newImagePromise = cornerstone.imageCache.getImagePromise(newImageId);

    if (newImagePromise && newImagePromise.state() === 'rejected') {
      cornerstone.imageCache.removeImagePromise(newImageId);
    }
  }

    // Convert the preventCache value in stack data to a boolean
  const preventCache = Boolean(stackData.preventCache);

  let imagePromise;

  if (preventCache) {
    imagePromise = cornerstone.loadImage(newImageId);
  } else {
    imagePromise = cornerstone.loadAndCacheImage(newImageId);
  }

  imagePromise.then(doneCallback, failCallback);

  // Make sure we kick off any changed download request pools
  requestPoolManager.startGrabbing();

  $(element).trigger('CornerstoneStackScroll', eventData);
}
