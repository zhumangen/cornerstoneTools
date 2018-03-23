import EVENTS from '../events.js';
import external from '../externalModules.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { addToolState, getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

const toolType = 'freehand';
let configuration = {
  mouseLocation: {
    handles: {
      start: {
        highlight: true,
        active: true
      }
    }
  },
  freehand: false,
  modifying: false,
  currentHandle: 0,
  currentTool: -1
};

// /////// BEGIN ACTIVE TOOL ///////
function addPoint (eventData) {
  const toolData = getToolState(eventData.element, toolType);

  if (toolData === undefined) {
    return;
  }

  const config = freehand.getConfiguration();

  // Get the toolData from the last-drawn drawing
  // (this should change when modification is added)
  const data = toolData.data[config.currentTool];

  const handleData = {
    x: eventData.currentPoints.image.x,
    y: eventData.currentPoints.image.y,
    highlight: true,
    active: true,
    lines: []
  };

    // If this is not the first handle
  if (data.handles.length) {
    // Add the line from the current handle to the new handle
    data.handles[config.currentHandle - 1].lines.push(eventData.currentPoints.image);
  }

  // Add the new handle
  data.handles.push(handleData);

  // Increment the current handle value
  config.currentHandle += 1;

  // Reset freehand value
  config.freehand = false;

  // Force onImageRendered to fire
  external.cornerstone.updateImage(eventData.element);
}

function pointNearHandle (eventData, toolIndex) {
  const toolData = getToolState(eventData.element, toolType);

  if (toolData === undefined) {
    return;
  }

  const data = toolData.data[toolIndex];

  if (data.handles === undefined) {
    return;
  }

  const mousePoint = eventData.currentPoints.canvas;

  for (let i = 0; i < data.handles.length; i++) {
    const handleCanvas = external.cornerstone.pixelToCanvas(eventData.element, data.handles[i]);

    if (external.cornerstoneMath.point.distance(handleCanvas, mousePoint) < 5) {
      return i;
    }
  }

  return;
}

function pointNearHandleAllTools (eventData) {
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData) {
    return;
  }

  let handleNearby;

  for (let toolIndex = 0; toolIndex < toolData.data.length; toolIndex++) {
    handleNearby = pointNearHandle(eventData, toolIndex);
    if (handleNearby !== undefined) {
      return {
        handleNearby,
        toolIndex
      };
    }
  }
}

// --- Drawing loop ---
// On first click, add point
// After first click, on mouse move, record location
// If mouse comes close to previous point, snap to it
// On next click, add another point -- continuously
// On each click, if it intersects with a current point, end drawing loop

function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);

  // Check if drawing is finished
  const toolData = getToolState(eventData.element, toolType);

  if (toolData === undefined) {
    return;
  }

  const config = freehand.getConfiguration();

  if (!eventData.event.shiftKey) {
    config.freehand = false;
  }

  external.cornerstone.updateImage(eventData.element);
}

function mouseMoveCallback (e) {
  const eventData = e.detail;
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData) {
    return;
  }

  const config = freehand.getConfiguration();

  const data = toolData.data[config.currentTool];

  // Set the mouseLocation handle
  let x = Math.max(eventData.currentPoints.image.x, 0);

  x = Math.min(x, eventData.image.width);
  config.mouseLocation.handles.start.x = x;

  let y = Math.max(eventData.currentPoints.image.y, 0);

  y = Math.min(y, eventData.image.height);
  config.mouseLocation.handles.start.y = y;

  const currentHandle = config.currentHandle;

  if (config.modifying) {
    // Move the handle
    data.active = true;
    data.highlight = true;
    data.handles[currentHandle].x = config.mouseLocation.handles.start.x;
    data.handles[currentHandle].y = config.mouseLocation.handles.start.y;
    const neighbourIndex = currentHandle === 0 ? data.handles.length - 1 : currentHandle - 1;
    const lastLineIndex = data.handles[neighbourIndex].lines.length - 1;
    const lastLine = data.handles[neighbourIndex].lines[lastLineIndex];

    lastLine.x = config.mouseLocation.handles.start.x;
    lastLine.y = config.mouseLocation.handles.start.y;
  }

  if (config.freehand) {
    data.handles[currentHandle - 1].lines.push(eventData.currentPoints.image);
  } else {
    // No snapping in freehand mode
    const handleNearby = pointNearHandle(eventData, config.currentTool);

    // If there is a handle nearby to snap to
    // (and it's not the actual mouse handle)
    if (handleNearby !== undefined && handleNearby < (data.handles.length - 1)) {
      config.mouseLocation.handles.start.x = data.handles[handleNearby].x;
      config.mouseLocation.handles.start.y = data.handles[handleNearby].y;
    }
  }

  // Force onImageRendered
  external.cornerstone.updateImage(eventData.element);
}

function startDrawing (eventData) {
  const element = eventData.element;

  element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);

  const measurementData = {
    visible: true,
    active: true,
    handles: []
  };

  const config = freehand.getConfiguration();

  config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
  config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;

  addToolState(eventData.element, toolType, measurementData);

  const toolData = getToolState(eventData.element, toolType);

  config.currentTool = toolData.data.length - 1;
}

function endDrawing (eventData, handleNearby) {
  const element = eventData.element;
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData) {
    return;
  }

  const config = freehand.getConfiguration();

  const data = toolData.data[config.currentTool];

  data.active = false;
  data.highlight = false;

  // Connect the end of the drawing to the handle nearest to the click
  if (handleNearby !== undefined) {
    // Only save x,y params from nearby handle to prevent circular reference
    data.handles[config.currentHandle - 1].lines.push({
      x: data.handles[handleNearby].x,
      y: data.handles[handleNearby].y
    });
  }

  if (config.modifying) {
    config.modifying = false;
  }

  // Reset the current handle
  config.currentHandle = 0;
  config.currentTool = -1;

  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

  external.cornerstone.updateImage(eventData.element);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    const toolData = getToolState(eventData.element, toolType);

    let handleNearby, toolIndex;

    const config = freehand.getConfiguration();
    const currentTool = config.currentTool;

    if (config.modifying) {
      endDrawing(eventData);

      return;
    }

    if (currentTool < 0) {
      const nearby = pointNearHandleAllTools(eventData);

      if (nearby) {
        handleNearby = nearby.handleNearby;
        toolIndex = nearby.toolIndex;
        // This means the user is trying to modify a point
        if (handleNearby !== undefined) {
          element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
          element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
          config.modifying = true;
          config.currentHandle = handleNearby;
          config.currentTool = toolIndex;
        }
      } else {
        startDrawing(eventData);
        addPoint(eventData);
      }
    } else if (currentTool >= 0 && toolData.data[currentTool].active) {
      handleNearby = pointNearHandle(eventData, currentTool);
      if (handleNearby !== undefined) {
        endDrawing(eventData, handleNearby);
      } else if (eventData.event.shiftKey) {
        config.freehand = true;
      } else {
        addPoint(eventData);
      }
    }

    e.preventDefault();
    e.stopPropagation();
  }
}

// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////
function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (toolData === undefined) {
    return;
  }

  const cornerstone = external.cornerstone;
  const config = freehand.getConfiguration();

  // We have tool data for this element - iterate over each one and draw it
  const context = eventData.canvasContext.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  let color;
  const lineWidth = toolStyle.getToolWidth();
  let fillColor = toolColors.getFillColor();

  for (let i = 0; i < toolData.data.length; i++) {
    context.save();

    const data = toolData.data[i];

    if (data.active) {
      color = toolColors.getActiveColor();
      fillColor = toolColors.getFillColor();
    } else {
      color = toolColors.getToolColor();
      fillColor = toolColors.getToolColor();
    }

    let handleStart;

    if (data.handles.length) {
      for (let j = 0; j < data.handles.length; j++) {
        // Draw a line between handle j and j+1
        handleStart = data.handles[j];
        const handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, handleStart);

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.moveTo(handleStartCanvas.x, handleStartCanvas.y);

        for (let k = 0; k < data.handles[j].lines.length; k++) {
          const lineCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles[j].lines[k]);

          context.lineTo(lineCanvas.x, lineCanvas.y);
          context.stroke();
        }

        const mouseLocationCanvas = cornerstone.pixelToCanvas(eventData.element, config.mouseLocation.handles.start);

        if (j === (data.handles.length - 1)) {
          if (data.active && !config.freehand && !config.modifying) {
            // If it's still being actively drawn, keep the last line to
            // The mouse location
            context.lineTo(mouseLocationCanvas.x, mouseLocationCanvas.y);
            context.stroke();
          }
        }
      }
    }

    // If the tool is active, draw a handle at the cursor location
    const options = {
      fill: fillColor
    };

    if (data.active) {
      drawHandles(context, eventData, config.mouseLocation.handles, color, options);
    }
    // Draw the handles
    drawHandles(context, eventData, data.handles, color, options);

    context.restore();
  }
}

// /////// END IMAGE RENDERING ///////
function enable (element) {
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  external.cornerstone.updateImage(element);
}

// Disables the reference line tool for the given element
function disable (element) {
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  external.cornerstone.updateImage(element);
}

// Visible and interactive
function activate (element, mouseButtonMask) {
  setToolOptions(toolType, element, { mouseButtonMask });

  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

  external.cornerstone.updateImage(element);
}

// Visible, but not interactive
function deactivate (element) {
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

  external.cornerstone.updateImage(element);
}

function getConfiguration () {
  return configuration;
}

function setConfiguration (config) {
  configuration = config;
}

// Module/private exports
const freehand = {
  enable,
  disable,
  activate,
  deactivate,
  getConfiguration,
  setConfiguration
};

export { freehand };
