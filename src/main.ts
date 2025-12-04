import "./scss/styles.scss";

import { Catalog } from "./components/Models/Catalog";
import { Cart } from "./components/Models/Cart";
import { Buyer } from "./components/Models/Buyer";
import { apiProducts } from "./utils/data";
import { ApiClient } from "./components/Communication/ApiClient";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";
import { Header } from "./components/View/Header";
import { Gallery } from "./components/View/Gallery";
import { CardCatalog } from "./components/View/CardCatalog";
import { CardPreview } from "./components/View/CardPreview";
import { CardBasket } from "./components/View/CardBasket";
import { Modal } from "./components/View/Modal";
import type { IProduct, IOrderData, IFormOrder, IFormContacts } from "./types";
import { Basket } from "./components/View/Basket";
import { Form } from "./components/View/Form";
import { FormOrder } from "./components/View/FormOrder";
import { FormContacts } from "./components/View/FormContacts";
import { Success } from "./components/View/Success";

const events = new EventEmitter();

const catalog = new Catalog(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

const api = new Api(API_URL);
const apiClient = new ApiClient(api);

const pageHeader = document.querySelector(".header") as HTMLElement;
const pageMain = document.querySelector(".gallery") as HTMLElement;
const modalContainer = document.querySelector(".modal") as HTMLElement;

const header = new Header(events, pageHeader!);
const gallery = new Gallery(pageMain!);
const modal = new Modal(events, modalContainer!);

let currentPreview: CardPreview | null = null;
let currentPreviewProductId: string | null = null;

let orderForm: FormOrder | null = null;
let contactsForm: FormContacts | null = null;

function validateOrderForm(order: IFormOrder): string[] {
  const errors: string[] = [];

  if (!order.payment) errors.push("Не выбран вид оплаты");
  if (!order.address) errors.push("Необходимо указать адрес");

  return errors;
}

function validateContactsForm(contacts: IFormContacts): string[] {
  const errors: string[] = [];

  if (!contacts.email) errors.push("Укажите email");
  if (!contacts.phone) errors.push("Укажите телефон");

  return errors;
}

events.on("catalog:changed", () => {
  const products = catalog.getProducts();

  const cards = products.map((product) => {
    const template = document.getElementById(
      "card-catalog"
    ) as HTMLTemplateElement;

    const card = new CardCatalog(
      template.content.firstElementChild!.cloneNode(true) as HTMLElement,
      {
        onSelect: (id) => events.emit("card:select", { id }),
      }
    );

    return card.render(product);
  });

  gallery.catalog = cards;
});

events.on<{ product: IProduct }>("catalog:select", ({ product }) => {
  const template = document.getElementById(
    "card-preview"
  ) as HTMLTemplateElement;

  currentPreview = new CardPreview(
    template.content.firstElementChild!.cloneNode(true) as HTMLElement,
    {
      onBuy: (id) => events.emit("card:buy", { id }),
      onRemove: (id) => events.emit("card:remove", { id }),
    }
  );

  const rendered = currentPreview.render(product);

  currentPreviewProductId = product.id;

  currentPreview.inBasket = cart.hasItem(product.id);

  modal.open(rendered);
});

events.on<{
  items: IProduct[];
  total: number;
  count: number;
}>("cart:changed", ({ items, total, count }) => {
  header.counter = count;

  const basketEl = modalContainer.querySelector<HTMLElement>(".basket");
  if (basketEl) {
    const basket = new Basket(events, basketEl);

    const cards = items.map((product, index) => {
      const template = document.getElementById(
        "card-basket"
      ) as HTMLTemplateElement;

      const card = new CardBasket(
        template.content.firstElementChild!.cloneNode(true) as HTMLElement,
        {
          onRemove: (id) => events.emit("card:remove", { id }),
        }
      );

      const rendered = card.render(product);
      card.index = index + 1;

      return rendered;
    });

    basket.items = cards;
    basket.total = total;
    basket.empty = items.length === 0;
  }

  if (currentPreview && currentPreviewProductId) {
    currentPreview.inBasket = cart.hasItem(currentPreviewProductId);
  }
});

events.on<{ id: string }>("card:select", ({ id }) => {
  const product = catalog.getProductById(id);
  if (product) catalog.setSelectedProduct(product);
});

events.on<{ id: string }>("card:buy", ({ id }) => {
  const product = catalog.getProductById(id);
  if (product) {
    cart.addItem(product);
  }

  if (currentPreviewProductId === id) {
    modal.close();
    currentPreview = null;
    currentPreviewProductId = null;
  }
});

events.on<{ id: string }>("card:remove", ({ id }) => {
  const product = catalog.getProductById(id);
  if (product) {
    cart.removeItem(product);
  }

  if (currentPreviewProductId === id) {
    modal.close();
    currentPreview = null;
    currentPreviewProductId = null;
  }
});

events.on("basket:open", () => {
  const template = document.getElementById("basket") as HTMLTemplateElement;

  const basketNode = template.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement;
  const basket = new Basket(events, basketNode);

  const items = cart.getItems();
  const cards = items.map((product, index) => {
    const itemTemplate = document.getElementById(
      "card-basket"
    ) as HTMLTemplateElement;

    const card = new CardBasket(
      itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
      {
        onRemove: (id) => events.emit("card:remove", { id }),
      }
    );

    const rendered = card.render(product);
    card.index = index + 1;

    return rendered;
  });

  basket.items = cards;
  basket.total = cart.getTotal();
  basket.empty = items.length === 0;

  modal.open(basketNode);
});

events.on("basket:checkout", () => {
  const template = document.getElementById("order") as HTMLTemplateElement;
  const node = template.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement;

  orderForm = new FormOrder(events, node);

  modal.open(node);
});

events.on("form:change", () => {
  const form = modalContainer.querySelector("form");
  if (!form) return;

  if (form.name === "order" && orderForm) {
    const data = orderForm.serialize();
    const errors = validateOrderForm(data);

    orderForm.errors = errors;
    orderForm.valid = errors.length === 0;

    buyer.setField("payment", data.payment);
    buyer.setField("address", data.address);
  }

  if (form.name === "contacts" && contactsForm) {
    const data = contactsForm.serialize();
    const errors = validateContactsForm(data);

    contactsForm.errors = errors;
    contactsForm.valid = errors.length === 0;

    buyer.setField("email", data.email);
    buyer.setField("phone", data.phone);
  }
});

events.on("order:next", () => {
  const template = document.getElementById("contacts") as HTMLTemplateElement;
  const node = template.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement;

  contactsForm = new FormContacts(events, node);

  modal.open(node);
});

events.on("order:submit", async () => {
  const errors = buyer.validate();

  if (Object.keys(errors).length > 0) {
    if (contactsForm) {
      contactsForm.errors = Object.values(errors);
      contactsForm.valid = false;
    }
    return;
  }

  const buyerData = buyer.getData();
  const items = cart.getItems();

  const orderData: IOrderData = {
    payment: buyerData.payment,
    address: buyerData.address,
    email: buyerData.email,
    phone: buyerData.phone,
    items: items.map((item) => item.id),
    total: cart.getTotal(),
  };

  try {
    const result = await apiClient.createOrder(orderData);

    cart.clear();
    buyer.clear();

    const template = document.getElementById("success") as HTMLTemplateElement;
    const node = template.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;

    const success = new Success(events, node);
    success.total = result.total;

    modal.open(node);
  } catch (error) {
    console.error("Ошибка при оформлении заказа:", error);

    if (contactsForm) {
      contactsForm.errors = ["Ошибка при создании заказа. Попробуйте позже."];
    }
  }
});

events.on("success:close", () => {
  modal.close();
});

apiClient.getProductList().then((products) => catalog.setProducts(products));
