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
import type { IProduct } from "./types";
import { Basket } from "./components/View/Basket";
import { Form } from "./components/View/Form";
import { FormOrder } from "./components/View/FormOrder";
import { FormContacts } from "./components/View/FormContacts";
import { Success } from "./components/View/Success";

// Catalog
// console.log("Тестируем каталог");
// const catalog = new Catalog();

// console.log("Сохраняем товары из apiProducts");
// catalog.setProducts(apiProducts.items);
// console.log("Массив товаров из каталога:", catalog.getProducts());

// // несуществующий id
// console.log('Поиск товара с id="1"');
// const product = catalog.getProductById("1");
// console.log("Найденный товар:", product);

// console.log('Поиск товара с id="854cef69-976d-4c2a-a18c-2aa45046c390"');
// const product2 = catalog.getProductById("854cef69-976d-4c2a-a18c-2aa45046c390");
// console.log("Найденный товар:", product2);

// console.log("Сохраняем товар для детального просмотра");
// if (product2) {
//   catalog.setSelectedProduct(product2);
//   console.log("Выбранный товар:", catalog.getSelectedProduct());
// }

// Cart
// console.log("\nТестируем корзину");
// const cart = new Cart();

// console.log("Добавляем товары в корзину");
// if (product2) {
//   cart.addItem(product2);
//   console.log(`Добавлен товар 1: ${product2.title}`);

//   // добавим еще один товар
//   const secondProduct = apiProducts.items[1];
//   cart.addItem(secondProduct);
//   console.log(`Добавлен товар 2: ${secondProduct.title}`);
// }

// console.log("Товары в корзине:", cart.getItems());
// console.log("Количество товаров в корзине:", cart.getCount());
// console.log("Общая стоимость корзины:", cart.getTotal());

// console.log("Проверяем наличие товара");
// console.log(
//   'Есть ли товар с id="c101ab44-ed99-4a54-990d-47aa2bb4e7d9":',
//   cart.hasItem("c101ab44-ed99-4a54-990d-47aa2bb4e7d9")
// );

// console.log("Удаляем товар из корзины");
// if (product2) {
//   cart.removeItem(product2);
//   console.log("Товары в корзине после удаления:", cart.getItems());
// }

// console.log("Очищаем корзину");
// cart.clear();
// console.log("Товары в корзине после очистки:", cart.getItems());

// Buyer
// console.log("\nТестируем покупателя");
// const buyer = new Buyer();

// console.log("Заполняем данные покупателя");
// buyer.setField("email", "test@test.com");
// buyer.setField("phone", "+79991234567");
// console.log("Данные покупателя (частично заполненые):", buyer.getData());

// console.log("Проверяем валидацию");
// const errors1 = buyer.validate();
// console.log("Ошибки валидации:", errors1);

// console.log("Заполняем остальные данные");
// buyer.setField("payment", "online");
// buyer.setField("address", "Москва, ул. Прянишникова, д. 2");
// console.log("Данные покупателя (полностью заполненые):", buyer.getData());

// console.log("Проверяем валидацию");
// const errors2 = buyer.validate();
// console.log("Ошибки валидации после полного заполнения:", errors2);

// console.log("Очищаем данные покупателя");
// buyer.clear();
// console.log("Данные покупателя после очистки:", buyer.getData());

// API
// async function testApiClient() {
//   console.log("\nТестируем ApiClient");

//   const api = new Api(API_URL);

//   const apiClient = new ApiClient(api);
//   const catalog = new Catalog();

//   try {
//     console.log("Получаем товары с сервера");
//     const products = await apiClient.getProductList();

//     catalog.setProducts(products);
//     console.log(`Получено товаров с сервера: ${products.length}`);

//     // для проверки
//     console.log("Первые 3 товара:");
//     products.slice(0, 3).forEach((product, index) => {
//       console.log(`${index + 1}. ${product.title} - ${product.price}`);
//     });
//   } catch (error) {
//     console.error("Ошибка при работе с API:", error);
//   }
// }

// testApiClient();

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

events.on("catalog:changed", () => {
  const products = catalog.getProducts();

  const cards = products.map((product) => {
    const template = document.getElementById(
      "card-catalog"
    ) as HTMLTemplateElement;

    const card = new CardCatalog(
      template.content.firstElementChild!.cloneNode(true) as HTMLElement,
      {
        onSelect: (id) => {
          console.log("card:select emitted", id);
          events.emit("card:select", { id });
        },
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

events.on<{
  items: IProduct[];
  total: number;
  count: number;
}>("cart:changed", ({ items, total, count }) => {
  header.counter = count;

  const basketEl = modalContainer.querySelector<HTMLElement>("#basket");
  if (basketEl) {
    const basket = new Basket(events, basketEl);

    const cards = items.map((product) => {
      const template = document.getElementById(
        "card-basket"
      ) as HTMLTemplateElement;

      const card = new CardBasket(
        template.content.firstElementChild!.cloneNode(true) as HTMLElement,
        {
          onRemove: (id) => events.emit("card:remove", { id }),
        }
      );

      return card.render(product);
    });

    basket.items = cards;
    basket.total = total;
    basket.empty = items.length === 0;
  }

  if (currentPreview && currentPreviewProductId) {
    currentPreview.inBasket = cart.hasItem(currentPreviewProductId);
  }
});

events.on("basket:open", () => {
  const template = document.getElementById("basket") as HTMLTemplateElement;

  const basketNode = template.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement;
  const basket = new Basket(events, basketNode);

  const items = cart.getItems();
  const cards = items.map((product) => {
    const itemTemplate = document.getElementById(
      "card-basket"
    ) as HTMLTemplateElement;

    const card = new CardBasket(
      itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
      {
        onRemove: (id) => events.emit("card:remove", { id }),
      }
    );

    return card.render(product);
  });

  basket.items = cards;
  basket.total = cart.getTotal();
  basket.empty = items.length === 0;

  modal.open(basketNode);
});

events.on("basket:checkout", () => {
  const template = document.getElementById("order") as HTMLTemplateElement;
  const orderNode = template.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement;

  const orderForm = new FormOrder(events, orderNode);

  const data = buyer.getData();

  orderForm.address = data.address;
  orderForm.payment = data.payment;

  modal.open(orderNode);
});

events.on("form:change", () => {
  const form = modalContainer.querySelector("form");
  if (!form) return;

  if (form.name === "order") {
    const orderForm = new FormOrder(events, form);
    const data = orderForm.serialize();

    buyer.setField("payment", data.payment);
    buyer.setField("address", data.address);
  }

  if (form.name === "contacts") {
    const contactsForm = new FormContacts(events, form);
    const data = contactsForm.serialize();

    buyer.setField("email", data.email);
    buyer.setField("phone", data.phone);
  }
});

events.on("buyer:changed", () => {
  const form = modalContainer.querySelector("form");
  if (!form) return;

  const errors = buyer.validate();
  const isValid = Object.keys(errors).length === 0;

  if (form.name === "order") {
    const orderForm = new FormOrder(events, form);
    orderForm.valid = !errors.payment && !errors.address;
    orderForm.errors = Object.values(errors);
  }

  if (form.name === "contacts") {
    const contactsForm = new FormContacts(events, form);
    contactsForm.valid = !errors.email && !errors.phone;
    contactsForm.errors = Object.values(errors);
  }
});

apiClient.getProductList().then((products) => catalog.setProducts(products));
