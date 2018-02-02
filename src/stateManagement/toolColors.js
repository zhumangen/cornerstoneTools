
let defaultColor = 'greenyellow',
  activeColor = 'yellow',
  fillColor = 'transparent',
  aiColor = 'red';

function setFillColor (color) {
  fillColor = color;
}

function getFillColor () {
  return fillColor;
}

function setToolColor (color) {
  defaultColor = color;
}

function getToolColor () {
  return defaultColor;
}

function setActiveColor (color) {
  activeColor = color;
}

function getActiveColor () {
  return activeColor;
}

function getColorIfActive (active) {
  return active ? activeColor : defaultColor;
}

function setActiveAiColor (color) {
  aiColor = color;
}

function getActiveAiColor () {
  return aiColor;
}

function getAiColorIfActive (active) {
  return active ? aiColor : defaultColor;
}

const toolColors = {
  setFillColor,
  getFillColor,
  setToolColor,
  getToolColor,
  setActiveColor,
  getActiveColor,
  getColorIfActive,
  setActiveAiColor,
  getActiveAiColor,
  getAiColorIfActive
};

export default toolColors;
