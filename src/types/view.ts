import type { TPayment } from "./index";

export interface ICardActions {
  onSelect?: (id: string) => void;
  onBuy?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export interface IFormOrder {
  payment: TPayment;
  address: string;
}

export interface IFormContacts {
  email: string;
  phone: string;
}
