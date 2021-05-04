import fetchJson from "../../utils/fetch-json.js";
const BACKEND_URL = process.env.BACKEND_URL;
export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  onWindowScroll = async() => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;
    if (
      bottom < document.documentElement.clientHeight &&
      !this.loading &&
      !this.isSortLocally
    ) {
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;
      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);
      this.loading = false;
    }
  };
  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = column.dataset.order === "asc" ? "desc" : "asc";
    if (!column) {
      return;
    }
    const { id } = column.dataset;
    column.dataset.order = toggleOrder;
    column.append(this.subElements.arrow);
    if (this.isSortLocally) {
      this.sortLocally(id, toggleOrder);
    } else {
      this.sortOnServer(id, toggleOrder, 1, 1 + this.step);
    }
  };
  constructor(
    headersConfig = [],
    {
      data = [],
      url = "",
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      isSortLocally = false,
      step = 20,
      start = 1,
      end = start + step,
    } = {}
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;
    this.render();
  }
  async render() {
    const { id, order } = this.sorted;
    const element = document.createElement("div");
    element.innerHTML = this.getTable();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    const data = await this.loadData(id, order, this.start, this.end);
    this.renderRows(data);
    this.initEventListeners();
  }
  renderRows(data) {
    if (!data.length) {
      this.element.classList.add("sortable-table_empty");
    }
    this.data = data;
    this.subElements.body.innerHTML = this.getTableRows(data);
    this.element.classList.remove("sortable-table_empty");
  }
  getTableHeader() {
    const headersConfig = this.headersConfig;
    const order = this.sorted.id ===  headersConfig.id? this.sorted.order : "asc";
    return headersConfig
      .map(
        ({ id, title, sortable }) => `
    <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
    <span>${title}</span>
    ${this.getHeaderSortingArrow(id)}
    </div>`
      )
      .join("");
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : "";
    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : "";
  }
  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }
  getTableRows(data) {
    return data
      .map(
        (item) => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
      )
      .join("");
  }
  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      return {
        id,
        template,
      };
    });
    return cells
      .map(({ id, template }) => {
        return template
          ? template(item[id])
          : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join("");
  }
  getTable() {
    return `
      <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getTableHeader()}
      </div>
        ${this.getTableBody(this.data)}
      </div>`;
  }
  async loadData(id, order, start, end) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);
    this.element.classList.add("sortable-table_loading");
    const response = await fetchJson(this.url);
    this.element.classList.remove("sortable-table_loading");
    return response;
  }
  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.onSortClick);
    document.addEventListener("scroll", this.onWindowScroll);
  }
  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find((item) => item.id === id);
    const { sortType, customSorting } = column;
    const directions = {
      asc: 1,
      desc: -1,
    };
    const direction = directions[order];
    return arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[id] - b[id]);
        case "string":
          return direction * a[id].localeCompare(b[id], ["ru", "en"]);
        case "custom":
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }
  sortLocally(id, order) {
    const sortedData = this.sortData(id, order);
    this.subElements.body.innerHTML = this.getTableBody(sortedData);
  }
  async sortOnServer(id, order, start, end) {
    const data = await this.loadData(id, order, start, end);
    this.renderRows(data);
  }
  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }
  update(data) {
    const rows = document.createElement("div");
    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);
    this.subElements.body.append(...rows.childNodes);
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.subElements = {};
    document.removeEventListener("scroll", this.onWindowScroll);
  }
}
