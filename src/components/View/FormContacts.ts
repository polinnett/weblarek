import { Form } from "./Form";
import { ensureElement } from "../../utils/utils";
import type { IEvents } from "../base/Events";

export class FormContacts extends Form<{}> {
  protected emailElement: HTMLInputElement;
  protected phoneElement: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.emailElement = ensureElement<HTMLInputElement>(
      "input[name=email]",
      this.container
    );
    this.phoneElement = ensureElement<HTMLInputElement>(
      "input[name=phone]",
      this.container
    );
  }

  set email(value: string) {
    this.emailElement.value = value;
  }

  set phone(value: string) {
    this.phoneElement.value = value;
  }
}
