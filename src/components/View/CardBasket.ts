import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import type { IProduct, ICardActions } from "../../types";

export class CardBasket extends Card<IProduct> {
  protected deleteButton: HTMLButtonElement;
  protected indexElement: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);

    this.indexElement = ensureElement(".basket__item-index", this.container);
    this.deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container
    );

    this.deleteButton.addEventListener("click", () => {
      const id = this.container.dataset.id!;
      this.actions?.onRemove?.(id);
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }

  set price(value: number | null) {
    super.price = value;
    this.priceElement.textContent =
      value === null ? "Бесценно" : `${value} синапсов`;
  }

  render(product: IProduct): HTMLElement {
    this.container.dataset.id = product.id;

    this.title = product.title;
    this.price = product.price;

    return this.container;
  }
}
