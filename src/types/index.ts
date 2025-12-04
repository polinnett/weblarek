export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export type TPayment = "online" | "cash" | "";

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
export interface IProductListResponse {
  total: number;
  items: IProduct[];
}

export interface IOrderData extends IBuyer {
  total: number;
  items: string[];
}

export interface IOrderResult {
  id: string;
  total: number;
}
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
