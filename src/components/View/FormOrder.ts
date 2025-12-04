import { Form } from "./Form";
import { ensureElement, ensureAllElements } from "../../utils/utils";
import type { IEvents } from "../base/Events";
import type { TPayment, IFormOrder } from "../../types";

export class FormOrder extends Form<IFormOrder> {
  protected paymentButtons: HTMLButtonElement[];
  protected addressElement: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.paymentButtons = ensureAllElements<HTMLButtonElement>(
      ".button_alt",
      container
    );

    this.paymentButtons.forEach((btn) => {
      if (btn.name === "card") btn.dataset.payment = "online";
      if (btn.name === "cash") btn.dataset.payment = "cash";
    });

    this.addressElement = ensureElement<HTMLInputElement>(
      "input[name=address]",
      container
    );

    this.paymentButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.payment = btn.dataset.payment as TPayment;
      });
    });

    container.addEventListener("submit", (event) => {
      event.preventDefault();
      this.events.emit("order:next");
    });
  }

  set payment(value: TPayment) {
    this.paymentButtons.forEach((btn) => {
      const isActive = btn.dataset.payment === value;
      btn.classList.toggle("button_alt-active", isActive);
    });
  }

  set address(value: string) {
    this.addressElement.value = value;
  }

  serialize(): IFormOrder {
    const payment = this.paymentButtons.find((btn) =>
      btn.classList.contains("button_alt-active")
    )?.dataset.payment as TPayment;

    return {
      payment,
      address: this.addressElement.value.trim(),
    };
  }
}
