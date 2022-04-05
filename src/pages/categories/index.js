import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../../components/sortable-list';
import NotificationMessage from '../../components/notification';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  subElements = {};
  components = {};
  initClickHandle = (event) => {
    if(event.target.closest('.category__header')) {
      event.target.closest('.category').classList.toggle('category_open')
    }
  };
  renderCategoriesForm(data) {
    return data.map(item => {
          const categoryEl = document.createElement('div');
          categoryEl.innerHTML = `<div class="category category_open" data-id="${item.id}">
                      <header class="category__header">
                          ${item.title}
                      </header>
                      <div class="category__body">
                          <div class="subcategory-list">
                          </div>
                      </div>
                  </div>`;
                  categoryEl.querySelector('.subcategory-list').append(this.renderSubcategories(item.subcategories));
                  return categoryEl.firstElementChild;
                })

  }
  renderSubcategories(category) {
      const items  = category.map(elem => {
        const subEl = document.createElement('div');
        subEl.innerHTML = `<li class="categories__sortable-list-item" data-grab-handle="" data-id="${elem.id}">
                <strong>${elem.title}</strong>
                <span><b>${elem.count}</b> products</span>`;
        return subEl.firstElementChild;
      });
    return new SortableList({items}).element;
  }
  async loadData() {
    return await fetchJson(`${BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`)
  }

  get template() {
    return `<div class="categories">
                <div class="content__top-panel">
                    <h1 class="page-title">Категории товаров</h1>
                </div>
                <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
                <div data-element="categoriesContainer">
            
                </div>
            </div>`;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.getSubElements(element);

    const data = await this.loadData();
    this.subElements.categoriesContainer.append(...this.renderCategoriesForm(data));
    this.initEventListeners();
    return this.element;
  }
  getSubElements(element) {
    const arr = element.querySelectorAll('[data-element]');
    for (const elem of arr) {
      this.subElements[elem.dataset.element] = elem;
    }
  }
  async saveOrder(elem) {
    let counter = 1;
    const elemList = [...elem.querySelectorAll("[data-id]")].map(elem => ({
      id: elem.dataset.id,
      weight: counter++
      })
    );
    try {
      const result = await fetchJson(`${BACKEND_URL}api/rest/subcategories`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(elemList)
        });
      console.log(result);
      const notification = new NotificationMessage('Category order saved', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    } catch (error) {
      console.error('Ошибка в отправке формы', error);
    }
  }

  initEventListeners() {
    this.element.addEventListener('click', this.initClickHandle);
    this.element.addEventListener('sortable-list-reorder', event => {
      this.saveOrder(event.detail.item);
      })
  }
  destroy() {
    this.subElements.categoriesContainer.removeEventListener('click', this.initClickHandle);
    this.subElements = {};
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
