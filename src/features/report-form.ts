import { getHtmlElement } from "@taj-wf/utils";

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
      return;
    }
    const data = await response.json().then((res) => res.data);

    return data as { name: string; email: string; phoneNumber: string };
  } catch {
    throw new Error("Something went wrong while fetching form data for Google Tag Manager!");
  }
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

      const formData = await getFormData(responseId, apiUrl);

      if (!formData) return;
    }
  });
};

init();
