import { Form } from "./Form";
import { ensureElement, ensureAllElements } from "../../utils/utils";
import type { IEvents } from "../base/Events";
import type { TPayment } from "../../types";

export class FormOrder extends Form<{}> {
  protected paymentButtons: HTMLButtonElement[];
  protected addressElement: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.paymentButtons = ensureAllElements<HTMLButtonElement>(
      ".button_alt",
      this.container
    );

    this.addressElement = ensureElement<HTMLInputElement>(
      "input[name=address]",
      this.container
    );

    this.paymentButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.events.emit("form:change", {
          field: "payment",
          value: btn.name as TPayment,
        });
      });
    });
  }

  set payment(value: TPayment) {
    this.paymentButtons.forEach((btn) => {
      const isActive = btn.name === value;
      btn.classList.toggle("button_alt-active", isActive);
    });
  }

  set address(value: string) {
    this.addressElement.value = value;
  }
}
