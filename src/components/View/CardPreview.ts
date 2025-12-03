import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import type { ICardActions } from "../../types/view";
import type { IProduct } from "../../types";
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
    this.priceElement.textContent =
      value === null ? "Недоступно" : `${value} синапсов`;
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
