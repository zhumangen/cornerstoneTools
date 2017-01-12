/**
 * Creates a Stack
 *
 * @param imageObjects Stack of composite image objects (pixel data, masks, etc)
 * @param renderer Pluggable renderer
 */
export class Stack {
  constructor (imageObjects) {
    this.imageObjects = imageObjects;
  }
}
