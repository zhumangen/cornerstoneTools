import external from '../externalModules.js';
import toolCoordinates from '../stateManagement/toolCoordinates.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import handleActivator from '../manipulators/handleActivator.js';
import moveHandle from '../manipulators/moveHandle.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (aiToolInterface) {
  let configuration = {};
  let innerAiData;

  // /////// BEGIN ACTIVE TOOL ///////
  function addNewMeasurement (aiData) {
    const cornerstone = external.cornerstone;
    const element = aiData.element;
    innerAiData = aiData;

    const measurementData = aiToolInterface.createNewMeasurement(aiData);

    if (!measurementData) {
      return;
    }

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(aiData.element, aiToolInterface.toolType, measurementData);
    cornerstone.updateImage(element);
  }

  // Not visible, not interactive
  function disable (element) {
    element.removeEventListener('cornerstoneimagerendered', onImageRendered);
    external.cornerstone.updateImage(element);
  }

  // Note: This is to maintain compatibility for developers that have
  // Built on top of mouseButtonTool.js
  // TODO: Remove this after we migrate Cornerstone Tools away from jQuery
  function onImageRendered (e) {
    aiToolInterface.onImageRendered(e, e.detail, innerAiData);
  }

  // Visible but not interactive
  function enable (element) {
    element.addEventListener('cornerstoneimagerendered', onImageRendered);
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
    getConfiguration,
    setConfiguration,
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
