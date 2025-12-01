import {
  IApi,
  IProduct,
  IOrderData,
  IOrderResult,
  IProductListResponse,
} from "../../types";

export class ApiClient {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  async getProductList(): Promise<IProduct[]> {
    try {
      const response = await this.api.get<IProductListResponse>("/product");
      return response.items;
    } catch (error) {
      console.error("Ошибка при получении списка товаров:", error);
      throw error;
    }
  }

  async createOrder(orderData: IOrderData): Promise<IOrderResult> {
    try {
      const response = await this.api.post<IOrderResult>("/order", orderData);
      return response;
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      throw error;
    }
  }
}
