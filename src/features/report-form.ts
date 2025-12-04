import { wait } from "@finsweet/ts-utils";
import { getActiveScript } from "@taj-wf/utils";

import { isGTMLoaded } from "@/utils/dataLayer/checkGTM";
import { captureException, initSentry } from "@/utils/sentry";

const formId = "#wf-form-Multi-Step---Report-Damage";

type ApiFormData = {
  name: string;
  email: string;
  phoneNumber: string;
};

type ErrorData = {
  error: Error;
  message: string;
};

export const prepareErrorMessage = (responseId: string, statusCode: number, message: string) => {
  return `[Response ID: ${responseId}] [Status Code: ${statusCode}]: ${message}`;
};

const getFormData = async (
  responseId: string,
  apiURL: string
): Promise<ApiFormData | ErrorData> => {
  try {
    const response = await fetch(`${apiURL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formResponseId: responseId }),
    });
    if (!response.ok) {
      try {
        const data = await response.json();

        if (typeof data.error === "string") {
          const errorMessage = prepareErrorMessage(
            responseId,
            response.status,
            `While fetching: ${data.error}`
          );

          return {
            error: new Error(errorMessage),
            message: errorMessage,
          };
        }
      } catch {
        const errorMessage = prepareErrorMessage(
          responseId,
          response.status,
          `While fetching: API returned status ${response.status}`
        );

        return {
          error: new Error(errorMessage),
          message: errorMessage,
        };
      }

      const errorMessage = prepareErrorMessage(
        responseId,
        response.status,
        `While fetching: Uknown error occurred`
      );

      return {
        error: new Error(errorMessage),
        message: errorMessage,
      };
    }

    const data = (await response.json().then((res) => res.data)) as ApiFormData;

    if (typeof data.email !== "string") {
      const errorMessage = prepareErrorMessage(
        responseId,
        422,
        "While fetching: The API sent invalid data."
      );

      return {
        error: new Error(errorMessage),
        message: errorMessage,
      };
    }

    return data as { name: string; email: string; phoneNumber: string };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const finalErrorMessage = prepareErrorMessage(
      responseId,
      500,
      "While fetching: " + errorMessage
    );

    return { message: finalErrorMessage, error: new Error(finalErrorMessage, { cause: error }) };
  }
};

export const getSetupData = () => {
  const script = getActiveScript(import.meta.url);

  if (!script) {
    console.error("❌ Something went wrong while getting the script tag!");
    return null;
  }

  const apiUrl = script.getAttribute("data-api-url");

  if (!apiUrl) {
    console.error("❌ API URL not found in data-api-url attribute");
    return null;
  }

  const sentryDsn = script.getAttribute("data-sentry-dsn");

  if (!sentryDsn) {
    console.error("❌ Sentry DSN not found in data-sentry-dsn attribute");
    return null;
  }

  return {
    apiUrl,
    sentryDsn,
  };
};

type TargetDataType = {
  email: string;
  phone_number: string | undefined;
  address: {
    first_name: string;
    last_name: string;
  };
};

const init = () => {
  const setupData = getSetupData();

  if (!setupData) return;

  const { sentryDsn, apiUrl } = setupData;

  initSentry(sentryDsn);

  window.addEventListener("message", async (event) => {
    if (event.origin !== "https://form.typeform.com") return;

    if (!event.data) {
      console.error("❌ No data in message event from Typeform");
      return;
    }

    if (event.data.type === "form-submit") {
      if (isGTMLoaded()) {
        console.debug("✅ GTM was found while submitting typeform.");
      } else {
        console.error("❌ GTM was NOT found while submitting typeform.");
        return;
      }

      const responseId = event.data.responseId;

      if (typeof responseId !== "string") {
        const errorMessage = "No responseId found in the form-submit event data!";
        console.error("❌ " + errorMessage);
        captureException(new Error(errorMessage), ["no-response-id " + Date.now().toString()]);
        return;
      }

      // wait for 2 seconds to ensure the data is available in the backend
      await wait(2000);

      const formDataResponse = await getFormData(responseId, apiUrl);

      if ("error" in formDataResponse) {
        console.error("❌ " + formDataResponse.message);
        captureException(formDataResponse.error, ["form-data-error " + responseId]);
        return;
      }

      console.debug(`✅ Typeform Data was successfully fetched!`);

      const formData = formDataResponse as ApiFormData;

      const targetData: TargetDataType = {
        email: formData.email,
        phone_number: formData.phoneNumber,
        address: {
          first_name: formData.name.split(" ")[0] || "",
          last_name: formData.name.split(" ").slice(1).join(" ") || "",
        },
      };

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submit",
        "gtm.elementId": formId,
        user_data: targetData,
      });
    }
  });

  console.debug("✅ Report Form script initialized!");
};

init();
