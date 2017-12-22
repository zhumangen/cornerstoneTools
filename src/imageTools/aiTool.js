import external from '../externalModules.js';
import toolCoordinates from '../stateManagement/toolCoordinates.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import handleActivator from '../manipulators/handleActivator.js';
import moveHandle from '../manipulators/moveHandle.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (aiToolInterface) {
  let configuration = {};

  // /////// BEGIN ACTIVE TOOL ///////
  function addNewMeasurement (aiData) {
    const cornerstone = external.cornerstone;
    const element = aiData.element;

    const measurementData = aiToolInterface.createNewMeasurement(aiData);

    if (!measurementData) {
      return;
    }

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(aiData.element, aiToolInterface.toolType, measurementData);
    cornerstone.updateImage(element);
  }

  // /////// END ACTIVE TOOL ///////

  // /////// BEGIN DEACTIVE TOOL ///////

  function mouseMoveCallback (e, eventData) {
    toolCoordinates.setCoords(eventData);
    // If a mouse button is down, do nothing
    if (eventData.which !== 0) {
      return;
    }

    // If we have no tool data for this element, do nothing
    const toolData = getToolState(eventData.element, aiToolInterface.toolType);

    if (!toolData) {
      return;
    }

    // We have tool data, search through all data
    // And see if we can activate a handle
    let imageNeedsUpdate = false;

    for (let i = 0; i < toolData.data.length; i++) {
      // Get the cursor position in canvas coordinates
      const coords = eventData.currentPoints.canvas;

      const data = toolData.data[i];

      if (handleActivator(eventData.element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      if ((aiToolInterface.pointNearTool(eventData.element, data, coords) && !data.active) || (!aiToolInterface.pointNearTool(eventData.element, data, coords) && data.active)) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }
    }

    // Handle activation status changed, redraw the image
    if (imageNeedsUpdate === true) {
      external.cornerstone.updateImage(eventData.element);
    }
  }

  function mouseDownCallback (e, eventData) {
    let data;
    const element = eventData.element;

    function handleDoneMove () {
      data.invalidated = true;
      if (anyHandlesOutsideImage(eventData, data.handles)) {
        // Delete the measurement
        removeToolState(element, aiToolInterface.toolType, data);
      }

      external.cornerstone.updateImage(element);
      external.$(element).on('CornerstoneToolsMouseMove', eventData, aiToolInterface.mouseMoveCallback || mouseMoveCallback);
    }

    if (!isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
      return;
    }

    const coords = eventData.startPoints.canvas;
    const toolData = getToolState(e.currentTarget, aiToolInterface.toolType);

    if (!toolData) {
      return;
    }

    let i;

    // Now check to see if there is a handle we can move

    let preventHandleOutsideImage;

    if (aiToolInterface.options && aiToolInterface.options.preventHandleOutsideImage !== undefined) {
      preventHandleOutsideImage = aiToolInterface.options.preventHandleOutsideImage;
    } else {
      preventHandleOutsideImage = false;
    }

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      const distance = 6;
      const handle = getHandleNearImagePoint(element, data.handles, coords, distance);

      if (handle) {
        external.$(element).off('CornerstoneToolsMouseMove', aiToolInterface.mouseMoveCallback || mouseMoveCallback);
        data.active = true;
        moveHandle(eventData, aiToolInterface.toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
        e.stopImmediatePropagation();

        return false;
      }
    }

    // Now check to see if there is a line we can move
    // Now check to see if we have a tool that we can move
    if (!aiToolInterface.pointNearTool) {
      return;
    }

    const options = aiToolInterface.options || {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage: false
    };

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      data.active = false;
      if (aiToolInterface.pointNearTool(element, data, coords)) {
        data.active = true;
        external.$(element).off('CornerstoneToolsMouseMove', aiToolInterface.mouseMoveCallback || mouseMoveCallback);
        moveAllHandles(e, data, toolData, aiToolInterface.toolType, options, handleDoneMove);
        e.stopImmediatePropagation();

        return false;
      }
    }
  }
  // /////// END DEACTIVE TOOL ///////


  // Not visible, not interactive
  function disable (element) {
    element.removeEventListener('cornerstoneimagerendered', onImageRendered);
    external.$(element).off('CornerstoneToolsMouseMove', aiToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', aiToolInterface.mouseDownCallback || mouseDownCallback);

    if (aiToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', aiToolInterface.mouseDoubleClickCallback);
    }

    external.cornerstone.updateImage(element);
  }

  // Note: This is to maintain compatibility for developers that have
  // Built on top of mouseButtonTool.js
  // TODO: Remove this after we migrate Cornerstone Tools away from jQuery
  function onImageRendered (e) {
    aiToolInterface.onImageRendered(e, e.detail);
  }

  // Visible but not interactive
  function enable (element) {
    element.removeEventListener('cornerstoneimagerendered', onImageRendered);
    external.$(element).off('CornerstoneToolsMouseMove', aiToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', aiToolInterface.mouseDownCallback || mouseDownCallback);

    if (aiToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', aiToolInterface.mouseDoubleClickCallback);
    }

    element.addEventListener('cornerstoneimagerendered', onImageRendered);
    external.cornerstone.updateImage(element);
  }

  // Visible, interactive
  function deactivate (element, mouseButtonMask) {
    const eventData = {
      mouseButtonMask
    };

    const eventType = 'CornerstoneToolsToolDeactivated';
    const statusChangeEventData = {
      mouseButtonMask,
      toolType: aiToolInterface.toolType,
      type: eventType
    };

    triggerEvent(element, eventType, statusChangeEventData);

    element.removeEventListener('cornerstoneimagerendered', onImageRendered);
    external.$(element).off('CornerstoneToolsMouseMove', aiToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', aiToolInterface.mouseDownCallback || mouseDownCallback);

    element.addEventListener('cornerstoneimagerendered', onImageRendered);
    external.$(element).on('CornerstoneToolsMouseMove', eventData, aiToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).on('CornerstoneToolsMouseDown', eventData, aiToolInterface.mouseDownCallback || mouseDownCallback);

    if (aiToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', aiToolInterface.mouseDoubleClickCallback);
      external.$(element).on('CornerstoneToolsMouseDoubleClick', eventData, aiToolInterface.mouseDoubleClickCallback);
    }

    if (aiToolInterface.deactivate) {
      aiToolInterface.deactivate(element, mouseButtonMask);
    }

    external.cornerstone.updateImage(element);
  }

  function getConfiguration () {
    return configuration;
  }

  function setConfiguration (config) {
    configuration = config;
  }

  const toolInterface = {
    addNewMeasurement,
    enable,
    disable,
    deactivate,
    getConfiguration,
    setConfiguration
  };

    // Expose pointNearTool if available
  if (aiToolInterface.pointNearTool) {
    toolInterface.pointNearTool = aiToolInterface.pointNearTool;
  }

  if (aiToolInterface.mouseDoubleClickCallback) {
    toolInterface.mouseDoubleClickCallback = aiToolInterface.mouseDoubleClickCallback;
  }

  if (aiToolInterface.addNewMeasurement) {
    toolInterface.addNewMeasurement = aiToolInterface.addNewMeasurement;
  }

  return toolInterface;
}
