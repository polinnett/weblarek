import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import type { IProduct, ICardActions } from "../../types";

export class CardBasket extends Card<IProduct> {
  protected deleteButton: HTMLButtonElement;
  protected indexElement: HTMLElement;

  constructor(container: HTMLElement, private actions?: ICardActions) {
    super(container);

    this.indexElement = ensureElement(".basket__item-index", container);
    this.deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      container
    );

    this.deleteButton.addEventListener("click", () => {
      this.actions?.onRemove?.();
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}
