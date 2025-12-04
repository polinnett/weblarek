import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import type { IProduct } from "../../types";

export abstract class Card<T extends IProduct> extends Component<T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected _price: number | null = null;

  constructor(container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement(".card__title", container);
    this.priceElement = ensureElement(".card__price", container);
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    this._price = value;
  }
}
