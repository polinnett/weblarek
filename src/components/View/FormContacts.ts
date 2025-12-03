import { Form } from "./Form";
import { ensureElement } from "../../utils/utils";
import type { IEvents } from "../base/Events";
import type { IFormContacts } from "../../types/view";

export class FormContacts extends Form<IFormContacts> {
  protected emailElement: HTMLInputElement;
  protected phoneElement: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.emailElement = ensureElement<HTMLInputElement>(
      "input[name=email]",
      container
    );
    this.phoneElement = ensureElement<HTMLInputElement>(
      "input[name=phone]",
      container
    );

    container.addEventListener("submit", (event) => {
      event.preventDefault();
      this.events.emit("order:submit");
    });
  }

  set email(value: string) {
    this.emailElement.value = value;
  }

  set phone(value: string) {
    this.phoneElement.value = value;
  }

  serialize(): IFormContacts {
    return {
      email: this.emailElement.value.trim(),
      phone: this.phoneElement.value.trim(),
    };
  }
}
