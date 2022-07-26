import SortableList from '../../components/sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';
import NotificationMessage from "../../components/notification";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
  element;
  subElements = {};
  components = {};
  categories;
  subcategories = [];
  duration = 2000;

  constructor() {
    this.openSubcategory = this.open.bind(this);
  }

  get template() {
    return `<div class="categories">
                <div class="content__top-panel">
                    <h1 class="page-title">Категории товаров</h1>
                </div>
                <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
                <div data-element="categoriesContainer">
                    ${this.getCategoriesTemplate()}
                </div>
            </div>
            `;
  }

  open() {
    if (event.target.nodeName === 'HEADER') {
      event.target.closest('.category').classList.toggle('category_open');
    }
    return;
  }

  getCategoriesTemplate() {
    return this.categories.map((item) => {
      return ` <div class = "category category_open" data-id="${item.id}" >
        <header class = "category__header" >
          ${item.title}
        </header>
        <div class="category__body">
        <div class="subcategory-list" data-element="${item.id}">
        </div>
      </div>
    </div>`;
    }).join('');
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];
      root.append(element);
    });
  }

  getCategories() {
    return fetchJson(new URL(BACKEND_URL + '/api/rest/categories?_sort=weight&_refs=subcategory'));
  }

  initComponents() {
    for (const category of this.categories) {
      this.components[category['id']] = new SortableList({
        items: category.subcategories.map((subitem) => {
          const element = document.createElement('li');
          element.classList.add('categories__sortable-list-item');
          element.setAttribute('data-grab-handle', '');
          element.setAttribute('data-id', subitem.category);
          element.innerHTML = `
            <strong>${subitem.title}</strong>
            <span><b>${subitem.count}</b> products</span>
            `;
          return element;
        })
      });
    }
  }

  async render() {
    const element = document.createElement('div');

    this.categories = await this.getCategories();

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.addListeners();

    return this.element;
  }

  addListeners() {
    this.element.addEventListener('click', this.openSubcategory);
    document.addEventListener('sortable-list-reorder', async event => {
      await this.saveOrder(event.detail);
    });
  }

  async saveOrder(data) {
    let url = new URL(BACKEND_URL + '/api/rest/subcategories');
    let newOrderArr = [];
    let newOrder = data.order.querySelectorAll("[data-id]");

    for (let i = 0; i < newOrder.length; i++) {
      newOrderArr[i] = {
        id: newOrder[i].getAttribute('data-id'),
        weight: i + 1
      };
    }

    try {
      await fetchJson(url, {
        method: 'PATCH',
        body: JSON.stringify(newOrderArr)
      });
      const notification = new NotificationMessage('Categories order saved', {
        duration: this.duration,
        type: 'success'
      });
      notification.show();
    } catch (e) {
      const notification = new NotificationMessage('Can not save categories order', {
        duration: this.duration,
        type: 'error'
      });
      notification.show();
    }
  }

  getSubElements(element) {
    let elements = element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
