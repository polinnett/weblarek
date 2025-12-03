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
import { Modal } from "./components/View/Modal";

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
        onBuy: (id) => events.emit("card:buy", { id }),
      }
    );

    return card.render({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.image,
    });
  });

  gallery.catalog = cards;
});

// 6. Загрузка товаров
apiClient.getProductList().then((products) => catalog.setProducts(products));
