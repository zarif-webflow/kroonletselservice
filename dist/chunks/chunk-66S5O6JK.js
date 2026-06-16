// node_modules/.pnpm/@taj-wf+utils@1.3.0/node_modules/@taj-wf/utils/dist/index.js
var afterWebflowReady = (callback) => {
  window.Webflow ||= [];
  window.Webflow.push(callback);
};
var getHtmlElement = ({
  selector,
  parent,
  log = "debug"
}) => {
  const targetElement = (parent || document).querySelector(selector);
  if (targetElement === null) {
    if (log === false) return null;
    const consoleMethod = log === "debug" ? console.debug : console.error;
    consoleMethod(
      `${log.toUpperCase()}: Element with selector "${selector}" not found in ${parent !== void 0 ? "the specified parent element:" : "the document."}`,
      parent
    );
    return null;
  }
  return targetElement;
};
var getMultipleHtmlElements = ({
  selector,
  parent,
  log = "debug"
}) => {
  const targetElements = Array.from((parent || document).querySelectorAll(selector));
  if (targetElements.length === 0) {
    if (log === false) return null;
    const consoleMethod = log === "debug" ? console.debug : console.error;
    consoleMethod(
      `${log.toUpperCase()}: No elements found with selector "${selector}" in ${parent !== void 0 ? "the specified parent element:" : "the document."}`,
      parent
    );
    return null;
  }
  return targetElements;
};
var getActiveScript = (importMetaUrl) => {
  const currentModuleUrl = importMetaUrl;
  return getHtmlElement({
    selector: `script[src="${currentModuleUrl}"]`
  });
};
window.wfCustomPageLoadFeatures ||= {};

export {
  afterWebflowReady,
  getMultipleHtmlElements,
  getActiveScript
};
//# sourceMappingURL=chunk-66S5O6JK.js.map
