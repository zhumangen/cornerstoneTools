import scrollToIndex from './scrollToIndex.js';
import { getStackData } from '../stacks/displayStack.js';

export default function (element, images) {
  const stackData = getStackData(element);

  if (!stackData) {
    return;
  }

  const baseImageObject = stackData.stack.imageObjects[0];
  const numImages = baseImageObject.images.length;
  let newImageIdIndex = stackData.renderer.currentImageIdIndex + images;

  newImageIdIndex = Math.min(numImages - 1, newImageIdIndex);
  newImageIdIndex = Math.max(0, newImageIdIndex);

  scrollToIndex(element, newImageIdIndex);
}
