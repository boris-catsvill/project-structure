import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';

export default class Categories {

  element; //html element

  toggleAccordion = (event) => {
    event.preventDefault();
    const {target} = event;
    const isHeader = target.classList.contains("category__header");
    const parentDiv = target.closest("div");

    if (isHeader) {
      parentDiv.classList.toggle("category_open");
    }
  }

  onSortableListReorder = async (event) => {
    const { target } = event;
    const { children } = target;

    const payload = [...children].map((child, index) => {
      const { id } = child.dataset;

      return {
        id,
        weight: index
      };
    });

    try {
      await this.send(payload);
      this.showNotificationMessage("Category order saved", {type: "success"});
    } catch (error) {
      this.showNotificationMessage(`Server side error! ${error}`, {type: "error", duration: 3000});
    }
  }

  constructor(data) {
    this.data = data;
    this.render();
  }

  showNotificationMessage(message, {duration = 2000, type} = {}) {
    const notificationMessage = new NotificationMessage(message, {
      duration: duration,
      type: type
    });
    notificationMessage.show();
  }

  async send(payload) {
    const url = new URL ('api/rest/subcategories', process.env.BACKEND_URL);
    const requestParams = {
      method: 'PATCH',
      headers:             {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }

    await fetchJson(url, requestParams);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getCategoriesContainerTemplate(this.data);

    this.element = wrapper.firstElementChild;

    this.appendSubcategoryDraggableList();
    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener("click", this.toggleAccordion);
    this.element.addEventListener("sortable-list-reorder", this.onSortableListReorder);
  }

  removeEventListeners() {
    this.element.removeEventListener("click", this.toggleAccordion);
    this.element.removeEventListener("sortable-list-reorder", this.onSortableListReorder);
  }

  getCategoriesContainerTemplate(data) {
    return `
      <div data-element="categoriesContainer">
        ${this.getCategoryTemplate(data)}
      </div>
    `;
  }

  getCategoryTemplate(data) {
    return data
      .map(item => {
        return `
          <div class="category category_open" data-id="${item.id}">
            <header class="category__header">${escapeHtml(item.title)}</header>
            <div class="category__body">
              <div class="subcategory-list" data-element="subcategoryList">
              </div>
            </div>
          </div>
        `;
      }).join("");
  }

  createSubcategoryList() {
    return this.data
      .map(element => {
        const { subcategories } = element;
        const items = subcategories.map(({ id, title, count }) => this.getSortableListItemTemplate(id, title, count));
        return items;
      });
  }

  getSortableListItemTemplate(id, title, count) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${id}">
        <strong>${escapeHtml(title)}</strong>
        <span><b>${count}</b> products</span>
      </li>`;

    return wrapper.firstElementChild;
  }

  appendSubcategoryDraggableList() {
    const subcategoryListArr = this.createSubcategoryList();
    const subcategoryElementArr = this.element.querySelectorAll("[data-element='subcategoryList']");

    subcategoryElementArr.forEach((subcategoryElement, index) => {
      const sortableList = new SortableList({ items: subcategoryListArr[index] });
      subcategoryElement.append(sortableList.element);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}
