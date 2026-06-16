import { afterWebflowReady, getMultipleHtmlElements } from "@taj-wf/utils";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
type UtmKey = (typeof UTM_KEYS)[number];
type UtmParams = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "kroon_utm_params";
const LOG_PREFIX = "[inject-utm]";

// ── Logging ──────────────────────────────────────────────────────────

const log = (message: string, ...args: unknown[]): void => {
  console.debug(`${LOG_PREFIX} ${message}`, ...args);
};

// ── Extract UTM values from the current URL ──────────────────────────

const extractUtmFromUrl = (): UtmParams => {
  log("Extracting UTM params from URL...");

  const params = new URLSearchParams(window.location.search);
  log("Current URL search params:", params.toString());

  const extracted: UtmParams = {};

  for (const key of UTM_KEYS) {
    if (!params.has(key)) {
      log(`Skipping ${key} (not present in URL)`);
      continue;
    }

    const value = params.get(key)?.trim() ?? "";
    extracted[key] = value;

    if (value) {
      log(`Extracted ${key}: "${value}"`);
    } else {
      log(`Extracted ${key}: (empty — will clear stored value)`);
    }
  }

  return extracted;
};

// ── Persist UTM values to localStorage ───────────────────────────────

const loadStoredUtm = (): UtmParams => {
  log("Loading stored UTM params from localStorage...");

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      log("No stored UTM params found.");
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      log("Stored UTM data is malformed — ignoring.");
      return {};
    }

    // Only keep valid UTM keys with non-empty string values
    const validated: UtmParams = {};
    for (const key of UTM_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) {
        validated[key] = value.trim();
      }
    }

    log("Loaded stored UTM params:", validated);
    return validated;
  } catch {
    log("Failed to parse stored UTM params — ignoring.");
    return {};
  }
};

const saveUtmToStorage = (params: UtmParams): void => {
  log("Saving UTM params to localStorage:", params);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    log("UTM params saved successfully.");
  } catch {
    log("Failed to save UTM params to localStorage.");
  }
};

// ── Merge: URL params win over stored, but never overwrite with empty ─

const hasAnyUtmInUrl = (fromUrl: UtmParams): boolean => {
  return UTM_KEYS.some((key) => fromUrl[key] !== undefined);
};

const mergeUtmParams = (stored: UtmParams, fromUrl: UtmParams): UtmParams => {
  log("Merging stored and URL UTM params...");

  const urlHasUtm = hasAnyUtmInUrl(fromUrl);

  // If ANY UTM param is in the URL, the URL is the authoritative source
  // for ALL 3 keys — empty values intentionally clear stored ones.
  if (urlHasUtm) {
    log("URL contains UTM params — using URL as authoritative source for all keys.");

    const merged: UtmParams = {};

    for (const key of UTM_KEYS) {
      const urlValue = fromUrl[key];

      if (urlValue) {
        merged[key] = urlValue;
        log(`Setting ${key} from URL: "${urlValue}"`);
      } else {
        // Intentionally NOT keeping the stored value
        log(`Clearing ${key} (not present or empty in URL)`);
      }
    }

    log("Merged UTM params (URL-authoritative):", merged);
    return merged;
  }

  // No UTM params in URL at all — fall back to stored values
  log("No UTM params in URL — falling back to stored values.");
  log("Using stored UTM params:", stored);
  return { ...stored };
};

// ── Create a visually hidden input element ──────────────────────────

const createHiddenInput = (name: string, value: string): HTMLInputElement => {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  Object.assign(input.style, {
    position: "absolute",
    width: "0",
    height: "0",
    overflow: "hidden",
    opacity: "0",
    pointerEvents: "none",
  } satisfies Partial<Record<keyof CSSStyleDeclaration, string>>);

  return input;
};

// ── Inject UTM inputs into forms ─────────────────────────────────────

const injectIntoForms = (params: UtmParams): void => {
  const entries = Object.entries(params) as [UtmKey, string][];

  if (entries.length === 0) {
    log("No UTM values to inject — skipping form injection.");
    return;
  }

  const forms = getMultipleHtmlElements<HTMLFormElement>({ selector: "[inject-utm=form]" });

  if (!forms) {
    log("No forms with [inject-utm=form] found.");
    return;
  }

  log(`Found ${forms.length} form(s) to inject into.`);

  for (const form of forms) {
    for (const [key, value] of entries) {
      // Prevent duplicate injection if the script runs more than once
      const existing = form.querySelector<HTMLInputElement>(`input[name="${key}"]`);
      if (existing) {
        existing.value = value;
        log(`Updated existing input [${key}=${value}] in form`, form);
        continue;
      }

      const input = createHiddenInput(key, value);
      form.appendChild(input);
      log(`Injected hidden input [${key}=${value}] into form`, form);
    }
  }
};

// ── Cross-tab sync via storage event ─────────────────────────────────

const listenForCrossTabUpdates = (): void => {
  log("Registering cross-tab storage listener...");

  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;

    log("Detected cross-tab UTM update — re-injecting...");
    const updated = loadStoredUtm();
    injectIntoForms(updated);
  });

  log("Cross-tab listener registered.");
};

// ── Main ─────────────────────────────────────────────────────────────

const initInjectUTM = (): void => {
  log("Initializing UTM injection...");

  const fromUrl = extractUtmFromUrl();
  const stored = loadStoredUtm();
  const merged = mergeUtmParams(stored, fromUrl);

  // Only persist when we actually have values
  if (Object.keys(merged).length > 0) {
    saveUtmToStorage(merged);
  }

  injectIntoForms(merged);
  listenForCrossTabUpdates();

  log("UTM injection complete.");
};

afterWebflowReady(() => {
  initInjectUTM();
});
