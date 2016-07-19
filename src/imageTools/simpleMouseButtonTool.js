export default function (mouseDownCallback) {
  let configuration = {};

  const toolInterface = {
    activate: function(element, mouseButtonMask, options) {
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
        var eventData = {
            mouseButtonMask: mouseButtonMask,
            options: options
        };
        $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownCallback);

        if (mouseMoveCallback) {
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        }
    },
    disable: function(element) {
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
        if (mouseMoveCallback) {
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        }
    },
    enable: function(element) {
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
        if (mouseMoveCallback) {
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        }
    },
    deactivate: function(element) {
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
        if (mouseMoveCallback) {
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        }
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };

  return toolInterface;
}
