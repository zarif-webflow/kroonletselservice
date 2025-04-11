import { getAssertedHtmlElement } from '@/utils/util';
import {
  string as vString,
  object as vObject,
  pipe as vPipe,
  trim as VTrim,
  email as VEmail,
  minLength as VMinLength,
  safeParse as VSafeParse,
  transform as VTransform,
  optional as vOptional,
  InferOutput,
} from 'valibot';

const formId = '#wf-form-Multi-Step---Report-Damage';

const isRecaptchaAttached = (form: HTMLFormElement): boolean => {
  return !!form.querySelector('[name="g-recaptcha-response"]');
};

const getFormSchema = (isRecaptchaPresent: boolean) => {
  return vPipe(
    vObject({
      Voornaam: vPipe(vString(), VTrim()),
      Achternaam: vPipe(vString(), VTrim()),
      Gegevens: vOptional(vPipe(vString(), VTrim())),
      Telefoonnummer: vOptional(vPipe(vString(), VTrim())),
      'E-mail-adres': vPipe(vString(), VTrim(), VEmail()),
      'g-recaptcha-response': isRecaptchaPresent
        ? vPipe(vString(), VTrim(), VMinLength(10))
        : vOptional(vString()),
    }),
    VTransform((input) => ({
      email: input['E-mail-adres'],
      phone_number: input['Telefoonnummer'],
      address: { first_name: input['Voornaam'], last_name: input['Achternaam'] },
    }))
  );
};

type FormDataType = InferOutput<ReturnType<typeof getFormSchema>>;

let isGtmAlreadyRan = false;

const pushFormDataIntoGtm = (data: FormDataType) => {
  if (isGtmAlreadyRan) return;

  isGtmAlreadyRan = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'form_submit',
    'gtm.elementId': formId,
    user_data: data,
  });
};

const initReportFormGtm = () => {
  const targetForm = getAssertedHtmlElement<HTMLFormElement>(formId);
  const allInputElemets = Array.from(
    targetForm.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input, select, textarea'
    )
  );

  const submitButton = getAssertedHtmlElement<HTMLButtonElement>('[type=submit]', targetForm);

  submitButton.type = 'button';

  const isRecaptchaPresent = isRecaptchaAttached(targetForm);

  const schema = getFormSchema(isRecaptchaPresent);

  let successClickedOnce = false;

  let validatedData: FormDataType | undefined = undefined;

  submitButton.addEventListener('click', () => {
    if (successClickedOnce) return;

    for (const inputEl of allInputElemets) {
      if (inputEl.checkValidity()) continue;
      inputEl.reportValidity();
      return;
    }

    const formDataObj = new FormData(targetForm);
    const formData = Object.fromEntries(formDataObj.entries());

    const validatedDataObj = VSafeParse(schema, formData);

    if (!validatedDataObj.success) {
      const issues = validatedDataObj.issues;

      const recaptchIssue =
        isRecaptchaPresent &&
        !!issues.find((issue) => issue.path?.some((p) => p.key === 'g-recaptcha-response'));

      if (recaptchIssue) {
        alert('Please confirm you’re not a robot.');
        return;
      }

      console.error(JSON.stringify(issues));

      return;
    }

    validatedData = validatedDataObj.output;

    submitButton.type = 'submit';

    successClickedOnce = true;

    submitButton.click();
  });

  targetForm.addEventListener('submit', () => {
    if (!validatedData) {
      throw new Error('Somthing went wrong with GTM Target Data!');
    }
    pushFormDataIntoGtm(validatedData);
  });
};

initReportFormGtm();
