import SortableList from '../../components/sortable-list';
import fetchJson from '../../utils/fetch-json';
import { getSubElements } from '../../utils/helpers';
import NotificationMessage from '../../components/notification';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  data = [];
  section = 'categories'

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstChild;
    this.subElements = getSubElements(this.element)
    this.data = await this.getCategoryData();
    this.getCategories();
    this.initEventListeners();
    return this.element;
  }

  get template() {
    return `<div class='categories'>
                <div class='content__top-panel'>
                    <h1 class='page-title'>Категории товаров</h1>
                </div>
                <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
                <div data-element='categoriesContainer'></div>
            </div>`;
  }

  getCategories() {
    for (const category of this.data) {
      const categoryItem = document.createElement('div');
      categoryItem.className = 'category';
      categoryItem.classList.add('category_open');
      categoryItem.dataset.id = `${category.id}`;
      categoryItem.innerHTML = `<header class='category__header'>${category.title}</header>`;
      if (category.subcategories) {
        categoryItem.append(this.getSubcategories(category.subcategories));
      }
      this.subElements.categoriesContainer.append(categoryItem);
    }
  }

  getSubcategories(subcategories) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
          <div class='category__body'>
            <div class='subcategory-list'></div>
          <div>
        `;
    const categoryBody = wrapper.firstElementChild;
    const items = subcategories.map(subcategory => {
      return this.getSubcategoryItem(subcategory);
    });

    const sortableList = new SortableList({ items });
    const list = categoryBody.querySelector('.subcategory-list');
    list.append(sortableList.element);
    return categoryBody;
  }

  getSubcategoryItem(item) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
          <li class='categories__sortable-list-item' data-id='${item.id}' data-grab-handle style>
            <strong>${item.title}</strong>
            <span><b>${item.count}</b> products</span>
          </li>
        `;

    return wrapper.firstElementChild;
  }

  async updateCategoryOrder(data) {
    const subcategories = [];
    const items = data.querySelectorAll('li');
    items.forEach((item, index) => {
      subcategories.push({
        id: item.dataset.id,
        weight: index + 1
      });
    });

    const url = new URL('api/rest/subcategories', BACKEND_URL);

    await fetchJson(url, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(subcategories)
    });
    this.showNotification()
  }

  showNotification(){
    const notification = new NotificationMessage('Категория сохранена', {duration: 10000, type: 'success'})
    notification.show()
  }

  async getCategoryData() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.toggleCategory);
    this.subElements.categoriesContainer.addEventListener('sortable-list-reorder', event => {
      this.updateCategoryOrder(event.target);
    });
  }

  toggleCategory = event => {
    if (event.target.closest('.category__header')) {
      const element = event.target.closest('.category')
      element.classList.toggle('category_open');
    }
  };

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
  }
}
