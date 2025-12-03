import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { ICardActions } from "../../types/view";
import type { IProduct } from "../../types";

export abstract class Card<T extends IProduct> extends Component<T> {
  protected _price: number | null = null;
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected buttonElement?: HTMLButtonElement;

  constructor(container: HTMLElement, protected actions?: ICardActions) {
    super(container);

    this.titleElement = ensureElement(".card__title", this.container);
    this.priceElement = ensureElement(".card__price", this.container);

    this.buttonElement =
      this.container.querySelector(".card__button") || undefined;

    if (this.buttonElement) {
      this.buttonElement.addEventListener("click", () => {
        this.handleButton();
      });
    }

    this.container.addEventListener("click", (event) => {
      if (event.target === this.buttonElement) return;
      this.actions?.onSelect?.(this.container.dataset.id!);
    });
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    this._price = value;
  }

  set buttonTitle(value: string) {
    if (this.buttonElement) {
      this.buttonElement.textContent = value;
    }
  }

  set buttonDisabled(flag: boolean) {
    if (this.buttonElement) {
      this.buttonElement.disabled = flag;
    }
  }

  protected handleButton() {
    const id = this.container.dataset.id!;

    if (this.buttonElement?.classList.contains("card__button_remove")) {
      this.actions?.onRemove?.(id);
    } else {
      this.actions?.onBuy?.(id);
    }
  }
}
