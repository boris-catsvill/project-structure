// // const BACKEND_URL = "https://course-js.javascript.ru";

// export default class SortableTable {
//   element;
//   subElements = {};
//   data = [];
//   loading = false;
//   step = 20;
//   start = 1;
//   end = this.start + this.step;

//   constructor(
//     headerConfig = [],
//     {
//       data = [],
//       sorted = {},
//       url = "",
//       isSortLocally = false,
//       step = 20,
//       start = 1,
//       end = start + step,
//     } = {}
//   ) {
//     this.headerConfig = headerConfig;
//     this.url = new URL(url, process.env.BACKEND_URL);

//     this.data = [...data];
//     this.sorted = sorted;
//     this.isSortLocally = isSortLocally;
//     this.step = step;
//     this.start = start;
//     this.end = end;

//     this.render();
//   }

//   initListeners() {
//     document.addEventListener("pointerdown", this.onSortClick);
//     document.addEventListener("scroll", this.onWindowScroll);
//   }

//   removeListeners = () => {
//     document.removeEventListener("pointerdown", this.onSortClick);
//     document.removeEventListener("scroll", this.onWindowScroll);
//   };

//   onWindowScroll = async () => {
//     const { bottom } = this.element.getBoundingClientRect();
//     const { id, order } = this.sorted;

//     if (
//       bottom < document.documentElement.clientHeight &&
//       !this.loading &&
//       !this.isSortLocally
//     ) {
//       this.start = this.end;
//       this.end = this.start + this.step;

//       this.loading = true;

//       const data = await this.sortOnServer(id, order, this.start, this.end);

//       this.update(data);

//       this.loading = false;
//     }
//   };

//   onSortClick = (event) => {
//     const selectedColumn = event.target.closest('[data-sortable="true"]');

//     const orderToggler = (order) => {
//       const orders = {
//         asc: "desc",
//         desc: "asc",
//       };

//       const result = orders[order];
//       return result;
//     };

//     if (selectedColumn) {
//       const { id, order } = selectedColumn.dataset;
//       const newOrder = orderToggler(order);

//       const arrow = selectedColumn.querySelector(".sortable-table__sort-arrow");

//       selectedColumn.dataset.order = newOrder;

//       if (!arrow) {
//         selectedColumn.append(this.subElements.arrow);
//       }

//       if (this.isSortLocally) {
//         this.sortOnClient(id, newOrder);
//       } else {
//         this.sortOnServer(id, newOrder);
//       }
//     }
//   };

//   sortOnClient(id, order) {
//     const sortOrder = order === "asc" ? 1 : -1;

//     const sortingField = this.element.querySelector(`[data-id='${id}']`);

//     sortingField.dataset.order = order;

//     this.data.sort((a, b) => {
//       if (typeof a[id] === "number") {
//         return sortOrder * (a[id] - b[id]);
//       }

//       if (typeof a[id] === "string") {
//         return (
//           sortOrder *
//           a[id].localeCompare(b[id], ["ru", "en"], {
//             caseFirst: "upper",
//           })
//         );
//       }
//     });

//     this.subElements.body.innerHTML = this.getTableProducts(this.data);
//   }

//   async sortOnServer(
//     id = "title",
//     order = "asc",
//     start = 0,
//     end = this.data.length
//   ) {
//     // const pathNameURL = `${BACKEND_URL}/${this.url}`;
//     // const fetchURL = new URL(pathNameURL);

//     this.url.searchParams.set("_embed", "subcategory.category");
//     this.url.searchParams.set("_sort", id);
//     this.url.searchParams.set("_order", order);
//     this.url.searchParams.set("_start", start);
//     this.url.searchParams.set("_end", end);

//     this.element.classList.add("sortable-table_loading");

//     try {
//       const response = await fetch(this.url.toString());
//       const data = await response.json();

//       this.element.classList.remove("sortable-table_loading");
//       this.data = data;

//       this.subElements.body.innerHTML = this.getTableProducts(this.data);

//       return this.data;
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   get tableHeader() {
//     return this.headerConfig
//       .map((item) => {
//         return `
//         <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${
//           item.sortable
//         }" data-order="asc">
//           <span>${item.title}</span>
//           ${item.sortable ? this.arrowToSort : ""} 
//         </div>
//       `;
//       })
//       .join("");
//   }

//   get arrowToSort() {
//     return `
//       <span data-element="arrow" class="sortable-table__sort-arrow">
//         <span class="sort-arrow"></span>
//       </span>
//     `;
//   }

//   tableProductCells(item) {
//     return this.headerConfig
//       .map((data) => {
//         return data.template
//           ? data.template(item[data.id])
//           : `<div class="sortable-table__cell">${item[data.id]}</div>`;
//       })
//       .join("");
//   }

//   getTableProducts(data) {
//     return this.data
//       .map((item) => {
//         return `
//         <a href="/products/${item.id}" class="sortable-table__row">
//           ${this.tableProductCells(item, data)}
//         </a>
//       `;
//       })
//       .join("");
//   }

//   get sortableTableTemplate() {
//     return `
//     <div class="sortable-table">
//       <div data-element="header" class="sortable-table__header sortable-table__row">
//         ${this.tableHeader}
//       </div>
//       <div data-element="body" class="sortable-table__body">
//         ${this.getTableProducts(this.data)}
//       </div>   
//     </div>

//     <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

//     <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
//       <div>
//         <p>No products satisfies your filter criteria</p>
//         <button type="button" class="button-primary-outline">Reset all filters</button>
//       </div>
//     </div>
//     `;
//   }

//   getSubElements() {
//     const result = {};
//     const elements = this.element.querySelectorAll("[data-element]");

//     for (const subElement of elements) {
//       const name = subElement.dataset.element;

//       result[name] = subElement;
//     }

//     return result;
//   }

//   async render() {
//     const { id, order } = this.sorted;
//     const wrapper = document.createElement("div");

//     wrapper.innerHTML = this.sortableTableTemplate;
//     this.element = wrapper.firstElementChild;

//     this.subElements = this.getSubElements();
//     this.initListeners();

//     this.data = await this.sortOnServer(id, order, 0, 30);

//     this.subElements.body.innerHTML = this.getTableProducts(this.data);
//     this.subElements.header.innerHTML = this.tableHeader;
//   }

//   update(data) {
//     const rows = document.createElement("div");

//     this.data = [...this.data, ...data];
//     rows.innerHTML = this.getTableProducts(data);

//     this.subElements.body.append(...rows.childNodes);
//   }

//   remove() {
//     if (this.element) {
//       this.element.remove();
//     }
//   }

//   destroy() {
//     this.element.remove();
//     document.removeEventListener("scroll", this.onWindowScroll);
//   }
// }






import fetchJson from "../../utils/fetch-json.js";

// const BACKEND_URL = 'https://course-js.javascript.ru';

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

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  };

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortLocally(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  sortLocally(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
