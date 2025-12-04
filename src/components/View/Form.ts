import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import type { IEvents } from "../base/Events";

export abstract class Form<T> extends Component<T> {
  protected submitButton: HTMLButtonElement;
  protected errorElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.submitButton = ensureElement<HTMLButtonElement>(
      "button[type=submit]",
      container
    );
    this.errorElement = ensureElement<HTMLElement>(".form__errors", container);

    container.addEventListener("input", (event) => {
      if (event.target instanceof HTMLInputElement) {
        this.events.emit("form:change");
      }
    });

    container.addEventListener("submit", (event) => {
      event.preventDefault();
      this.events.emit("form:submit");
    });
  }

  set valid(flag: boolean) {
    this.submitButton.disabled = !flag;
  }

  set errors(list: string[]) {
    this.errorElement.innerHTML = list.join("<br>");
  }

  abstract serialize(): T;
}
