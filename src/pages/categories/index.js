import Categories from "../../components/categories";
import NotificationMessage from "../../components/notification";

const CATEGORY_URL = 'api/rest/categories';

export default class Page {
  element;
  categoriesElement;

  onNotificate = event => {
    console.log(event);
    const notification = new NotificationMessage(event.detail.note, {
      duration: 200000,
      type: 'success'
    });

    notification.show();
  };

  constructor() {
    this.render();
  }

  get template() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
        </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.categoriesElement = new Categories(CATEGORY_URL);

    this.element.append(this.categoriesElement.element);

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    document.addEventListener('subcategories-sorted', this.onNotificate);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('subcategories-sorted', this.onNotificate);

    this.remove();
    this.element = null;
  }
}
