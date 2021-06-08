import SortableList from "../sortable-list";
import NotificationMessage from "../notification";
import fetchJson from "../../utils/fetch-json";

const BACKEND_URL = process.env.BACKEND_URL;

export default class Categories {
  components = {};
  isOpen = true;

  constructor(category) {
    this.category = category;

    this.render();
  }

  handlerToggleOpen = () => {
    if (this.isOpen) {
      this.element.classList.remove('category_open');
      this.isOpen = false;
    } else {
      this.element.classList.add('category_open');
      this.isOpen = true;
    }
  };

  handlerReOrderCategories = () => {
    this.sendFormData()
      .then(() => {
        const notificationSuccess = new NotificationMessage('Category order saved', {
          duration: 2000,
          type: 'success'
        });
        notificationSuccess.show()
      })
      .catch(() => {
        const notificationError = new NotificationMessage('Category order not saved', {
          duration: 2000,
          type: 'error'
        });
        notificationError.show()
      })
  };

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.renderSubCategories();

    this.getFormData();

    this.addEventListener();
  }

  getFormData() {
    const subcategoryList = this.element.querySelector('.subcategory-list');
    const scHTMLCollection = subcategoryList.querySelectorAll('.categories__sortable-list-item');
    const result = [];

    for (const [index, subcategory] of scHTMLCollection.entries()) {
      result.push({
        id: subcategory.dataset.id,
        weight: index + 1
      });
    }

    return result
  }

  async sendFormData() {
    const url = new URL('/api/rest/subcategories', BACKEND_URL);
    const params = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getFormData())
    };

    return await fetchJson(url, params);
  }

  addEventListener() {
    const categoryHeader = this.element.querySelector('.category__header');
    const { sortableList } = this.components;

    categoryHeader.addEventListener('pointerdown', this.handlerToggleOpen);
    sortableList.element.addEventListener('drag-event', this.handlerReOrderCategories);
  }

  renderSubCategories() {
    const subcategoryList = this.element.querySelector('.subcategory-list');

    const imagesHtmlCollection = [];

    for (const subcategory of this.category.subcategories) {
      imagesHtmlCollection.push(this.renderSubCategoriesItem(subcategory));
    }

    const sortableList = new SortableList({
      items: imagesHtmlCollection
    });

    this.components.sortableList = sortableList;

    subcategoryList.append(sortableList.element);
  }

  renderSubCategoriesItem(subcategory) {
    const element = document.createElement('div');
    element.innerHTML = `
      <li class="categories__sortable-list-item" data-id="${subcategory.id}" data-grab-handle>
        <strong>${subcategory.title}</strong>
        <span><b>${subcategory.count}</b> products</span>
      </li>`;

    return element.firstElementChild;
  }

  getTemplate() {
    return `
      <div class="category category_open" data-id="${this.category.id}">
        <header class="category__header">${this.category.title}</header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.components = {};
    this.remove();
  }
}
