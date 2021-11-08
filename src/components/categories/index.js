import SortableList from "../../components/sortable-list/index.js";
import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class Categories {
  element;
  target;
  isLoaded;
  componentIsLoaded = new Promise((resolve) => {
    this.isLoaded = resolve;
  });

  onToggleData = (event) => {
    this.target = event.target.closest(".category");
    if (this.target) {
      const dataList = [...this.target.querySelectorAll("li")].map(
        (item, index) => {
          return { id: item.dataset.id, weight: ++index };
        }
      );
      /*const dataIndex = this.elements.findIndex((item) => {
        return target === item;
      });
      const data = [...this.data[dataIndex].subcategories];

      this.sortedData = data.sort((a, b) => {
        return dataList.indexOf(a.id) - dataList.indexOf(b.id);
      });
      this.data[dataIndex].subcategories = this.sortedData;*/
      if (event.detail.changed) this.save(dataList);
    }
  };
  constructor({
    urls = {},
    templates = {
      body: ({ id, title }) => {
        return `
            <div class="category category_open" data-id="${id}">
              <header class="category__header">${title}</header>
              <div class="category__body">
                <div data-element="list" class="subcategory-list">
                </div>
              </div>
            </div>
          `;
      },
      row: ({ id, title, count }) => {
        return `
            <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id=${id}>
              <strong>${title}</strong>
              <span><b>${count}</b> products</span>
            </li>
          `;
      },
    },
    eventsList = {
      onToggle: (event) => {
        const target = event.target.closest(".category__header");
        if (target) {
          const category = target.closest(".category");
          category.classList.toggle("category_open");
        }
      },
    },
  } = {}) {
    this.urls = urls;
    this.templates = templates;
    this.eventsList = eventsList;

    this.render();
    this.events("add");
  }

  getList(data) {
    const root = document.createElement("div");

    root.innerHTML = this.templates.body(data);

    const itemsList = data.subcategories.map((item) => {
      return this.getItem(item);
    });

    const sortableList = new SortableList({ items: itemsList });
    root.querySelector("[data-element]").append(sortableList.element);

    return root.firstElementChild;
  }

  getItem(item) {
    const element = document.createElement("div");
    element.innerHTML = this.templates.row(item);
    return element.firstElementChild;
  }

  async render() {
    const wrapper = document.createElement("div");
    this.element = wrapper;

    const data = await fetchJson(new URL(this.urls.categories, BACKEND_URL));
    const elements = data.map((category) => {
      return this.getList(category);
    });

    wrapper.append(...elements);
    this.isLoaded();
  }

  async save(data) {
    const url = new URL(this.urls.subcategories, BACKEND_URL);
    try {
      const result = await fetchJson(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      this.dispatchEvent(result);
    } catch (e) {
      this.dispatchEvent(e);
      console.error(e);
    }
  }

  dispatchEvent(data) {
    let eventString;
    if (!(data instanceof Error)) eventString = "event-successPost";
    else eventString = "event-errorPost";

    const event = new CustomEvent(eventString, {
      detail: data,
      bubbles: true,
    });

    this.target.dispatchEvent(event);
  }

  events(type) {
    document[`${type}EventListener`]("pointerup", this.eventsList.onToggle);
    document[`${type}EventListener`]("toggle-event", this.onToggleData);
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.target = null;
    this.events("remove");
  }
}
