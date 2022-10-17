import fetchJson from '../../utils/fetch-json';
import NotificationMessage from '../notification';
import SortableList from '../sortable-list';

export default class Categories {
  element;
  subcategorySortableList;

  onHeaderPointerdownHandler = event => {
    const categoryHeader = event.target.closest('.category__header');
    if (!categoryHeader) return;
    event.preventDefault();

    categoryHeader.parentElement.classList.toggle('category_open');
  };

  onSortableListReorderHandle = async event => {
    let notificaion;
    try {
      await fetchJson(this.url, {
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.getSubcategoryRequestBody(),
        method: 'PATCH'
      });

      notificaion = new NotificationMessage('Category order saved', {
        duration: 2000,
        type: 'success'
      });
    } catch (error) {
      notificaion = new NotificationMessage(error.message, { duration: 2000, type: 'error' });

      throw new Error(error);
    } finally {
      notificaion.show();
    }
  };

  constructor({ id, title, subcategories, count, weight }) {
    this.id = id;
    this.title = title;
    this.subcategories = subcategories;
    this.count = count;
    this.categoryWeight = weight;
    this.url = new URL('api/rest/subcategories', process.env.BACKEND_URL);

    this.render();
  }

  initSubcategoryItems() {
    const subcategoryItems = this.subcategories.map(item => this.getSubcategoryItem(item));
    this.subcategorySortableList = new SortableList({ items: subcategoryItems });
  }

  getSubcategoryRequestBody() {
    const resultArray = [];
    let accruedWeight = 1;

    for (const listItem of this.element.querySelectorAll('.categories__sortable-list-item')) {
      resultArray.push({ id: listItem.dataset.id, weight: accruedWeight++ });
    }

    return JSON.stringify(resultArray);
  }

  getSubcategoryItem({ count, id, title }) {
    const wrapper = document.createElement('li');
    wrapper.classList.add('categories__sortable-list-item');
    wrapper.dataset.id = id;
    wrapper.dataset.grabHandle = '';

    wrapper.innerHTML = `<strong>${title}</strong>
    <span><b>${count}</b> products</span>`;

    return wrapper;
  }

  get template() {
    return `<div class="category category_open" data-id="${this.id}">
        <header class="category__header">
          ${this.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.initEventListners();

    this.initSubcategoryItems();
    this.renderSubcategoryItems();
  }

  renderSubcategoryItems() {
    this.element.querySelector('.subcategory-list').append(this.subcategorySortableList.element);
  }

  initEventListners() {
    this.element.addEventListener('pointerdown', this.onHeaderPointerdownHandler);
    this.element.addEventListener('sortable-list-reorder', this.onSortableListReorderHandle);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.onHeaderPointerdownHandler);
    this.element.removeEventListener('sortable-list-reorder', this.onSortableListReorderHandle);
    this.subcategorySortableList?.destroy();
    this.remove();
    this.element = null;
  }
}
