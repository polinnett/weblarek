import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import type { IEvents } from "../base/Events";

export class Basket extends Component<{}> {
  protected listElement: HTMLElement;
  protected totalElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.listElement = ensureElement(".basket__list", this.container);
    this.totalElement = ensureElement(".basket__price", this.container);
    this.buttonElement = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container
    );

    this.buttonElement.addEventListener("click", () => {
      this.events.emit("basket:checkout");
    });
  }

  set items(value: HTMLElement[]) {
    this.listElement.replaceChildren(...value);
  }

  set total(value: number) {
    this.totalElement.textContent = `${value} синапсов`;
  }

  set empty(flag: boolean) {
    this.buttonElement.disabled = flag;
  }
}
