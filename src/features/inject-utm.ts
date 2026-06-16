import { afterWebflowReady, getMultipleHtmlElements } from "@taj-wf/utils";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

const initInjectUTM = () => {
  console.debug("[inject-utm] Initializing UTM injection...");

  const params = new URLSearchParams(window.location.search);
  console.debug("[inject-utm] Current URL search params:", params.toString());

  const utmValues = UTM_KEYS.reduce<Record<string, string>>((acc, key) => {
    const value = params.get(key)?.trim();
    if (value) {
      acc[key] = value;
      console.debug(`[inject-utm] Extracted ${key}:`, value);
    } else {
      console.debug(`[inject-utm] Skipping ${key} (empty or missing)`);
    }
    return acc;
  }, {});

  const utmEntries = Object.entries(utmValues);

  if (utmEntries.length === 0) {
    console.debug("[inject-utm] No UTM values found — nothing to inject.");
    return;
  }

  const forms = getMultipleHtmlElements<HTMLFormElement>({ selector: "[inject-utm=form]" });

  if (!forms) {
    console.debug("[inject-utm] No forms with [inject-utm=form] found.");
    return;
  }

  console.debug(`[inject-utm] Found ${forms.length} form(s) to inject into.`);

  for (const form of forms) {
    for (const [key, value] of utmEntries) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      Object.assign(input.style, {
        position: "absolute",
        width: "0",
        height: "0",
        overflow: "hidden",
        opacity: "0",
        pointerEvents: "none",
      });
      form.appendChild(input);
      console.debug(`[inject-utm] Injected hidden input [${key}=${value}] into form`, form);
    }
  }

  console.debug("[inject-utm] UTM injection complete.");
};

afterWebflowReady(() => {
  initInjectUTM();
});
