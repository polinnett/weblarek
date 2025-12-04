import "./scss/styles.scss";

import { Catalog } from "./components/Models/Catalog";
import { Cart } from "./components/Models/Cart";
import { Buyer } from "./components/Models/Buyer";
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
import type {
  IProduct,
  IOrderData,
  IFormOrder,
  IFormContacts,
  TPayment,
  IBuyer,
} from "./types";
import { Basket } from "./components/View/Basket";
import { FormOrder } from "./components/View/FormOrder";
import { FormContacts } from "./components/View/FormContacts";
import { Success } from "./components/View/Success";
import { cloneTemplate } from "./utils/utils";

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

const basketNode = cloneTemplate<HTMLElement>("#basket");
const basket = new Basket(events, basketNode);

function updateBasketContent() {
  const items = cart.getItems();

  const cards = items.map((product, index) => {
    const card = new CardBasket(cloneTemplate("#card-basket"), {
      onRemove: () => events.emit("basket:remove", { id: product.id }),
    });

    const container = card.render({
      title: product.title,
      price: product.price,
    });

    card.index = index + 1;
    return container;
  });

  basket.items = cards;
  basket.total = cart.getTotal();
  basket.empty = items.length === 0;
}

events.on("catalog:changed", () => {
  const products = catalog.getProducts();

  const cards = products.map((product) => {
    const card = new CardCatalog(cloneTemplate("#card-catalog"), {
      onSelect: () => events.emit("card:select", { id: product.id }),
    });

    return card.render(product);
  });

  gallery.catalog = cards;
});

events.on<{ id: string }>("card:select", ({ id }) => {
  const product = catalog.getProductById(id);
  if (product) catalog.setSelectedProduct(product);
});

events.on("catalog:select", () => {
  const product = catalog.getSelectedProduct();
  if (!product) return;

  const previewNode = cloneTemplate<HTMLElement>("#card-preview");

  const preview = new CardPreview(previewNode, {
    onClick: () => events.emit("preview:action"),
  });

  preview.title = product.title;
  preview.price = product.price;
  preview.category = product.category;
  preview.description = product.description;
  preview.image = product.image;

  if (product.price === null) {
    preview.buttonDisabled = true;
    preview.buttonTitle = "Недоступно";
  } else {
    const inCart = cart.hasItem(product.id);
    preview.buttonDisabled = false;
    preview.buttonTitle = inCart ? "Удалить из корзины" : "Купить";
  }

  modal.open(previewNode);
});

events.on("preview:action", () => {
  const product = catalog.getSelectedProduct();
  if (!product) return;

  if (product.price === null) return;

  const inCart = cart.hasItem(product.id);

  if (inCart) {
    cart.removeItem(product);
  } else {
    cart.addItem(product);
  }

  modal.close();
});

events.on("basket:open", () => {
  updateBasketContent();
  modal.open(basket.render());
});

events.on("cart:changed", () => {
  header.counter = cart.getCount();

  const basketElement = document.querySelector(".basket");
  if (basketElement && basketElement.parentElement) {
    updateBasketContent();
  }
});

events.on<{ id: string }>("basket:remove", ({ id }) => {
  const product = catalog.getProductById(id);
  if (product) cart.removeItem(product);
});

events.on("order:next", () => {
  const contactsNode = cloneTemplate<HTMLElement>("#contacts");
  const contactsForm = new FormContacts(events, contactsNode);

  contactsForm.email = "";
  contactsForm.phone = "";

  modal.open(contactsNode);
});

events.on("basket:checkout", () => {
  buyer.clear();

  const orderNode = cloneTemplate<HTMLElement>("#order");
  const orderForm = new FormOrder(events, orderNode);

  orderForm.address = "";
  orderForm.payment = "" as TPayment;

  modal.open(orderNode);
});

events.on("order:submit", () => {
  const contactsNode = cloneTemplate<HTMLElement>("#contacts");
  const contactsForm = new FormContacts(events, contactsNode);

  const buyerData = buyer.getData();
  contactsForm.email = buyerData.email || "";
  contactsForm.phone = buyerData.phone || "";

  modal.open(contactsNode);
});

const handleOrderSubmit = async () => {
  events.off("contacts:submit", handleOrderSubmit);

  const modalContent = document.querySelector(".modal__content");
  const contactsFormElement = modalContent?.querySelector(
    'form[name="contacts"]'
  );

  if (!contactsFormElement) {
    events.on("contacts:submit", handleOrderSubmit);
    return;
  }

  const contactsForm = new FormContacts(
    events,
    contactsFormElement as HTMLElement
  );

  contactsForm.valid = false;

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

    const successNode = cloneTemplate<HTMLElement>("#success");
    const success = new Success(events, successNode);
    success.total = result.total;

    modal.open(successNode);
  } catch (error) {
    console.error("Ошибка при оформлении заказа:", error);
  }
};

events.on("contacts:submit", handleOrderSubmit);

events.on("form:change", (data: { field: string; value: string }) => {
  const { field, value } = data;

  const buyerFields: (keyof IBuyer)[] = [
    "payment",
    "address",
    "email",
    "phone",
  ];

  if (buyerFields.includes(field as keyof IBuyer)) {
    buyer.setField(field as keyof IBuyer, value);
  }

  updateFormUI();
});

function updateFormUI() {
  const modalContent = document.querySelector(".modal__content");
  const currentForm = modalContent?.querySelector("form");

  if (!currentForm) return;

  const errors = buyer.validate();
  const formName = currentForm.getAttribute("name");

  if (formName === "order") {
    const orderForm = new FormOrder(events, currentForm as HTMLElement);

    const buyerData = buyer.getData();
    orderForm.payment = buyerData.payment;

    const orderErrors = [];
    if (errors.payment) orderErrors.push(errors.payment);
    if (errors.address) orderErrors.push(errors.address);

    orderForm.errors = orderErrors;
    orderForm.valid = orderErrors.length === 0;
  }

  if (formName === "contacts") {
    const contactsForm = new FormContacts(events, currentForm as HTMLElement);

    const contactsErrors = [];
    if (errors.email) contactsErrors.push(errors.email);
    if (errors.phone) contactsErrors.push(errors.phone);

    contactsForm.errors = contactsErrors;
    contactsForm.valid = contactsErrors.length === 0;
  }
}

events.on("success:close", () => {
  modal.close();
});

apiClient
  .getProductList()
  .then((products) => catalog.setProducts(products))
  .catch((err) => console.error(err));
