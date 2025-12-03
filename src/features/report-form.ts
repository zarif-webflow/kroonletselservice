import { wait } from "@finsweet/ts-utils";
import { getHtmlElement } from "@taj-wf/utils";

const formId = "#wf-form-Multi-Step---Report-Damage";

const getFormData = async (responseId: string, apiURL: string) => {
  try {
    const response = await fetch(`${apiURL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formResponseId: responseId }),
    });
    if (!response.ok) {
      const data = await response.json();
      console.error("Error while fetching form data for GTM:", data.error);
      console.error("Response status:", response.status);
      return;
    }
    const data = await response.json().then((res) => res.data);

    return data as { name: string; email: string; phoneNumber: string };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      "Something went wrong while fetching form data for Google Tag Manager! " + errorMessage
    );
  }
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
  const apiUrl = getHtmlElement({ selector: "[data-api-url]" })?.getAttribute("data-api-url");
  if (!apiUrl) {
    console.error("API URL not found in data-api-url attribute");
    return;
  }

  window.addEventListener("message", async (event) => {
    if (event.origin !== "https://form.typeform.com") return;

    if (!event.data) {
      console.error("No data in message event from Typeform");
      return;
    }

    if (event.data.type === "form-submit") {
      const responseId = event.data.responseId;

      // wait for 2 seconds to ensure the data is available in the backend
      await wait(2000);

      const formData = await getFormData(responseId, apiUrl);

      if (!formData) {
        console.error("ERROR: FORM DATA wasn't available when this request was made.");
        return;
      }

      const targetData: TargetDataType = {
        email: formData.email,
        phone_number: formData.phoneNumber,
        address: {
          first_name: formData.name.split(" ")[0] || "",
          last_name: formData.name.split(" ").slice(1).join(" ") || "",
        },
      };

      console.debug(targetData, "targetData");

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submit",
        "gtm.elementId": formId,
        user_data: targetData,
      });
    }
  });
};

init();
