import "@typeform/embed/build/css/widget.css";

import { getHtmlElement } from "@taj-wf/utils";
import { createWidget } from "@typeform/embed";

const init = () => {
  const containerEl = getHtmlElement({ selector: "[data-multistep=container]" });

  if (!containerEl) return;

  createWidget("jMnpzdy6", { container: containerEl });
};

init();
