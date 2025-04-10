import { getAssertedHtmlElement } from '@/utils/util';

/**
 * {"Voornaam":"","Achternaam":"","Gegevens-2":"","Telefoonnummer":"","E-mail-adres":"","g-recaptcha-response":""}
 */

const initReportFormGtm = () => {
  const targetForm = getAssertedHtmlElement<HTMLFormElement>('#wf-form-Multi-Step---Report-Damage');

  setInterval(() => {
    const formDataObj = new FormData(targetForm);
    const formData = Object.fromEntries(formDataObj.entries());

    console.log(JSON.stringify(formData));
  }, 3000);
};

initReportFormGtm();
