import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification';
import fetchJson from '../../utils/fetch-json.js';


export default class Page {
  element;
  subElements = {};
  data = [];

  get template () {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Product Categories</h1>
      </div>

      <div data-element="categoriesContainer">

      </div>
    </div>
  `;
  }

    async render () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    this.data = await this.getCategoryData();

    this.subElements = this.getSubElements(this.element);

    this.insertCategories();

    this.initEventListeners();

    return this.element;
  }

  async getCategoryData(){
    const url = new URL("api/rest/categories", process.env.BACKEND_URL)
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");

    const categoriesData =  await fetchJson(url);

    return categoriesData;
}

  insertCategories () {
    const categoriesContainer = this.subElements.categoriesContainer;

    this.data.map((category) => {
      const list = document.createElement("div");
      list.dataset.element = category.id;
      list.classList.add("category", "category_open");
      list.innerHTML = `
          <header class="category__header">
            ${category.title}
          </header>
      `;

      const categoryBody = document.createElement("div");
      categoryBody.className = "category__body";

      const subcategoryList = document.createElement("div");
      subcategoryList.className = "subcategory-list";

      const subcategories = category.subcategories.map(subcategory => this.getSubcategory(subcategory));
      const sortableList = new SortableList({ items: subcategories });

      subcategoryList.append(sortableList.element);
      categoryBody.append(subcategoryList);
      list.append(categoryBody);

      categoriesContainer.append(list);
    })
  }

  getSubcategory (subcategory) {
    const li = document.createElement("li");
    li.classList.add("categories__sortable-list-item", "sortable-list__item");
    li.dataset.id = subcategory.id;
    li.setAttribute("data-grab-handle", "");
        li.innerHTML = `
        <strong>${subcategory.title}</strong>
        <span><b>${subcategory.count}</b> products</span>
        `;
    return li;
  }

  async updateCategoryOrder(target) {
    const subcategories = [];

    [...target.childNodes].reduce((weight, check) => {
      subcategories.push({id: check.dataset.id, weight})
      return ++weight;
    }, 1);

    try {

      await fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
        method: "PATCH",
        body: JSON.stringify(subcategories),
        headers: {
            "Content-type": "application/json"
        }
      });

      const notification = new NotificationMessage('Category order saved', { type: 'success' });
      notification.show();

    } catch (error) {

      const notification = new NotificationMessage(e.body, { type: 'error' });
      notification.show();

      throw new Error(error.message);
    }
  }

  getSubElements(element = this.element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners(element = this.element) {
    this.controller = new AbortController();

    const headers = element.getElementsByClassName("category__header");
    for (const header of headers) {
      header.addEventListener("pointerdown", () => {header.parentElement.classList.toggle("category_open")}, { signal: this.controller.signal });
    }

    this.subElements.categoriesContainer.addEventListener("sortable-list-reorder", event => {
      this.updateCategoryOrder(event.target);
  }, {signal: this.controller.signal});
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.controller.abort();
    this.subElements = null;
  }
}
