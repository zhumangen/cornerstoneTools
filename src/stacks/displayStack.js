const stackData = {};

/**
 * Displays a Stack
 *
 * @param element Enabled Cornerstone element
 * @param stack Instance of the Stack class
 */
export function displayStack (element, stack, renderer) {
  if (!element) {
    throw new Error('displayStack: No element provided');
  }

  if (!stack) {
    throw new Error('displayStack: No stack provided');
  }

  if (!renderer || !renderer.render) {
    throw new Error('displayStack: No renderer provided');
  }

  renderer.render(element, stack);

  stackData[element] = {
    stack,
    renderer
  };
}

/**
 * Displays a Stack
 *
 * @param element Enabled Cornerstone element
 * @param stack Instance of the Stack class
 */
export function getStackData (element) {
  return stackData[element];
}
