import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  data;

  async initComponents() {
    const url = new URL(
      `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
    );
    this.data = await fetchJson(url.toString());

    this.data.forEach(category => {
      const sortableList = new SortableList({
        items: category.subcategories.map(item => {
          const element = document.createElement('li');
          element.classList = 'categories__sortable-list-item sortable-list__item';

          element.dataset.grabHandle = '';
          element.dataset.id = item.id;

          element.innerHTML = `
                      <strong>${item.title}</strong>
                      <span><b>${item.count}</b> products</span>
                `;

          return element;
        })
      });

      this.components[category.id] = sortableList;
    });
  }

  sortableListTemplate(category) {
    return `
      <div class="category category_open" data-id="${category.id}">
      <header class="category__header">
        ${category.title}
      </header>
      <div class="category__body">
        <div class="subcategory-list"><ul class="sortable-list" data-element="${category.id}"></ul></div>
      </div>
     </div> `;
    }
  renderComponents() {
    const root = this.subElements.categoriesContainer;

    this.data.forEach(category => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.sortableListTemplate(category);

      root.append(wrapper.firstElementChild);
    });

    this.subElements = this.getSubElements(this.element);

    Object.keys(this.components).forEach(component => {
      const wrapper = this.subElements[component];
      const { element } = this.components[component];

      wrapper.append(element);
    });
  }
  async saveAfterReorder(categoryId, detail) {
    const { from, to } = detail;

    const reorderSubcategories = [
      ...this.data.find(category => category.id === categoryId).subcategories
    ];
    const moved = reorderSubcategories.splice(from, 1);
    reorderSubcategories.splice(to, 0, ...moved);

    const newData = reorderSubcategories.map((subCat, index) => {
      return {
        id: subCat.id,
        weight: index + 1
      };
    });

    try {
      await fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(newData)
      });

      this.data = this.data.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            subcategories: reorderSubcategories
          };
        }

        return category;
      });

      const notification = new NotificationMessage('Categories updated!', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    } catch (error) {
      const notification = new NotificationMessage(error.message, {
        duration: 2000,
        type: 'error'
      });

      notification.show();
    }
  }

  get template() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
      <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
      <div data-element="categoriesContainer">
        <!-- sortable-list components -->
      </div>
    </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    Object.keys(this.components).forEach(component => {
      const { element } = this.components[component];

      element.addEventListener('sortable-list-reorder', event => {
        this.saveAfterReorder(component, event.detail);
      });
    });

    this.subElements.categoriesContainer.addEventListener('click', event => {
      event.stopPropagation();
      const container = event.target.closest('.category');
      if (container) {
        container.classList.toggle('category_open');
      }
    });
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
