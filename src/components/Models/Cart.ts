import { IProduct } from "../../types";
import type { IEvents } from "../base/Events";

export class Cart {
  private items: IProduct[] = [];

  constructor(private events: IEvents) {}

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(product: IProduct): void {
    this.items.push(product);

    this.events.emit("cart:changed", {
      items: this.items,
      total: this.getTotal(),
      count: this.getCount(),
    });
  }

  removeItem(product: IProduct): void {
    const index = this.items.findIndex((item) => item.id === product.id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }

    this.events.emit("cart:changed", {
      items: this.items,
      total: this.getTotal(),
      count: this.getCount(),
    });
  }

  clear(): void {
    this.items = [];

    this.events.emit("cart:changed", {
      items: this.items,
      total: this.getTotal(),
      count: this.getCount(),
    });
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.price || 0), 0);
  }

  getCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
