import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import type { IProduct, ICardActions } from "../../types";
import { categoryMap, CDN_URL } from "../../utils/constants";

export class CardPreview extends Card<IProduct> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected descriptionElement: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);

    this.categoryElement = ensureElement(".card__category", this.container);
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );
    this.descriptionElement = ensureElement(".card__text", this.container);
  }

  set category(value: string) {
    this.categoryElement.textContent = value;

    this.categoryElement.className = "card__category";

    const className = categoryMap[value as keyof typeof categoryMap];
    if (className) {
      this.categoryElement.classList.add(className);
    }
  }

  set image(value: string) {
    this.imageElement.src = `${CDN_URL}/${value}`;
    this.imageElement.alt = this.titleElement.textContent || "";
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  set inBasket(flag: boolean) {
    if (!this.buttonElement) return;

    if (this._price === null) {
      this.buttonDisabled = true;
      this.buttonTitle = "Недоступно";
      this.buttonElement.classList.remove("card__button_remove");
      return;
    }

    if (flag) {
      this.buttonElement.textContent = "Удалить из корзины";
      this.buttonElement.classList.add("card__button_remove");
    } else {
      this.buttonElement.textContent = "Купить";
      this.buttonElement.classList.remove("card__button_remove");
    }
  }

  set price(value: number | null) {
    super.price = value;

    if (value === null) {
      this.priceElement.textContent = "Бесценно";
    } else {
      this.priceElement.textContent = `${value} синапсов`;
      this.buttonDisabled = false;
      this.buttonTitle = this.inBasket ? "Удалить из корзины" : "Купить";
    }
  }

  render(product: IProduct): HTMLElement {
    this.container.dataset.id = product.id;

    this.title = product.title;
    this.category = product.category;
    this.price = product.price;
    this.image = product.image;
    this.description = product.description;

    return this.container;
  }
}
