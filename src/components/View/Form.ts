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
      this.container
    );

    this.errorElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container
    );

    this.container.addEventListener(
      "input",
      (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (event.target instanceof HTMLInputElement) {
          const field = event.target.name;
          const value = event.target.value;
          this.events.emit("form:change", { field, value });
        }
      },
      true
    );

    this.container.addEventListener("submit", (event) => {
      event.preventDefault();

      const formName = this.container.getAttribute("name");

      if (formName) {
        this.events.emit(`${formName}:submit`);
      }
    });
  }

  set valid(flag: boolean) {
    this.submitButton.disabled = !flag;
  }

  set errors(list: string[]) {
    this.errorElement.innerHTML = list.join("<br>");
  }
}
