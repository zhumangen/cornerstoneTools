import external from '../externalModules.js';
import mouseButtonTool from '../imageTools/mouseButtonTool.js';
import drawHandles from '../manipulators/drawHandles.js';
import { getToolState } from '../stateManagement/toolState.js';
import MeasurementManager from '../measurementManager/measurementManager.js';
import LineSampleMeasurement from '../measurementManager/lineSampleMeasurement.js';
import textStyle from '../stateManagement/textStyle.js';
import drawTextBox from '../util/drawTextBox.js';

const toolType = 'probe4D';

function updateLineSample (measurementData) {
  const cornerstone = external.cornerstone;
  const samples = [];

  measurementData.timeSeries.stacks.forEach(function (stack) {
    let loader;

    if (stack.preventCache === true) {
      loader = cornerstone.loadImage(stack.imageIds[measurementData.imageIdIndex]);
    } else {
      loader = cornerstone.loadAndCacheImage(stack.imageIds[measurementData.imageIdIndex]);
    }

    loader.then(function (image) {
      const offset = Math.round(measurementData.handles.end.x) + Math.round(measurementData.handles.end.y) * image.width;
      const sample = image.getPixelData()[offset];

      samples.push(sample);
    });
  });
  measurementData.lineSample.set(samples);
}

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
  const timeSeriestoolData = getToolState(mouseEventData.element, 'timeSeries');

  if (timeSeriestoolData === undefined || timeSeriestoolData.data === undefined || timeSeriestoolData.data.length === 0) {
    return;
  }

  const timeSeries = timeSeriestoolData.data[0];

  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    timeSeries,
    lineSample: new LineSampleMeasurement(),
    imageIdIndex: timeSeries.stacks[timeSeries.currentStackIndex].currentImageIdIndex,
    visible: true,
    handles: {
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true
      }
    }
  };

  updateLineSample(measurementData);
  MeasurementManager.add(measurementData);

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////

function onImageRendered (e) {
  const cornerstone = external.cornerstone;
  const eventData = e.detail;
  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  // We have tool data for this element - iterate over each one and draw it
  const context = eventData.canvasContext;

  context.setTransform(1, 0, 0, 1, 0, 0);

  const color = 'white';
  const font = textStyle.getFont();

  for (let i = 0; i < toolData.data.length; i++) {
    context.save();
    const data = toolData.data[i];

    // Draw the handles
    context.beginPath();
    drawHandles(context, eventData, data.handles, color);
    context.stroke();

    context.font = font;

    const coords = {
      // Translate the x/y away from the cursor
      x: data.handles.end.x + 3,
      y: data.handles.end.y - 3
    };

    const textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

    context.fillStyle = color;

    drawTextBox(context, `${data.handles.end.x}, ${data.handles.end.y}`, textCoords.x, textCoords.y, color);

    context.restore();
  }
}
// /////// END IMAGE RENDERING ///////

// Module exports
const probeTool4D = mouseButtonTool({
  createNewMeasurement,
  onImageRendered,
  toolType
});

export default probeTool4D;
