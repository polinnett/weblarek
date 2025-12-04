import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import type { IProduct, ICardActions } from "../../types";
import { categoryMap, CDN_URL } from "../../utils/constants";

export class CardPreview extends Card<IProduct> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected descriptionElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;

  constructor(container: HTMLElement, private actions?: ICardActions) {
    super(container);

    this.categoryElement = ensureElement(".card__category", container);
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      container
    );
    this.descriptionElement = ensureElement(".card__text", container);

    this.buttonElement = ensureElement<HTMLButtonElement>(
      ".card__button",
      container
    );

    this.buttonElement.addEventListener("click", () => {
      this.actions?.onBuy?.();
    });
  }

  set category(value: string) {
    this.categoryElement.textContent = value;
    this.categoryElement.className = "card__category";

    const className = categoryMap[value as keyof typeof categoryMap];
    if (className) this.categoryElement.classList.add(className);
  }

  set image(value: string) {
    this.imageElement.src = `${CDN_URL}/${value}`;
    this.imageElement.alt = this.titleElement.textContent || "";
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  set buttonTitle(value: string) {
    this.buttonElement.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this.buttonElement.disabled = value;
  }
}
