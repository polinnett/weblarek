import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import type { ICardActions } from "../../types/view";
import type { IProduct } from "../../types";

export class CardBasket extends Card<IProduct> {
  protected deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);

    this.deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container
    );

    this.deleteButton.addEventListener("click", () => {
      const id = this.container.dataset.id!;
      this.actions?.onRemove?.(id);
    });
  }
}
