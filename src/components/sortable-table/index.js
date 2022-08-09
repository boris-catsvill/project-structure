import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';


export default class SortableTable {
  itemsPerPage = 30
  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    url = '',
    from = '',
    to = '',
    paramFrom = 'from',
    paramTo = 'to',
    pricefrom = '',
    priceTo = '',
    status = '',
    productSearchValue = '',
    isSortLocally = false
  } = {}) {
    this.isSortLocally = isSortLocally
    this.page = 0
    this.headerConfig = headersConfig
    this.data = data
    // параметры для запросов на сервер
    this.sorted = sorted
    this.url = url
    this.paramFrom = paramFrom
    this.paramTo = paramTo
    this.from = from
    this.to = to
    this.pricefrom = pricefrom
    this.priceTo = priceTo
    this.productSearchValue = productSearchValue
    this.status = status
    //
    this.render()
    this.initEventListeners()

  }

  render() {
    if (this.element) return
    this.element = this.createElement(`
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.fillHeaderTemplate()}
      </div>
      <div data-element="body" class="sortable-table__body">
      </div>
      </div>`)
    this.subElements = this.getSubElements(this.element)
    this.update(this.from, this.to)
  }

  fillHeaderTemplate() {
    return this.headerConfig
      .map(item => {
        return `<div class="sortable-table__cell" data-id=${item.id} data-sortable="${item.sortable}">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </div>`
      })
      .join('')
  }

  async update(fromParam, toParam) {
    const { start, end } = this.getPagination()
    this.data = await this.loadData(start, end, fromParam, toParam)
    this.subElements.body.innerHTML = ""
    this.fillBodyTemplate()
    this.addArrow()
  }

  async loadData(start, end, fromParam, toParam) {
    const path = new URL(this.url, BACKEND_URL)

    if (fromParam && toParam) {
      this.from = fromParam
      this.to = toParam
      const startInput = this.from.toISOString();
      const endInput = this.to.toISOString();
      path.searchParams.set(this.paramFrom, startInput)
      path.searchParams.set(this.paramTo, endInput)
      start = 0
      end = 30
    } else { path.searchParams.set('_embed', 'subcategory.category') }

    this.priceFrom ? path.searchParams.set('price_gte', this.priceFrom) : ''
    this.priceTo ? path.searchParams.set('price_lte', this.priceTo) : ''
    this.productSearchValue ? path.searchParams.set('title_like', this.productSearchValue) : ''
    this.status ? path.searchParams.set('status', this.status) : ''


    path.searchParams.set('_sort', this.sorted.id)
    path.searchParams.set('_order', this.sorted.order)
    path.searchParams.set('_start', start)
    path.searchParams.set('_end', end)
    return await fetchJson(path)
  }

  addParam(priceFrom, priceTo, searchValue, status) { // вызывается извне и добавляет параметры для запроса
    priceFrom ? this.priceFrom = priceFrom : ''
    priceTo ? this.priceTo = priceTo : ''
    searchValue ? this.productSearchValue = searchValue : ''
    status != '' ? this.status = status : this.status = '' // если status = '', значит, выбран option 'любой'
  }


  getPagination() {
    const start = this.itemsPerPage * this.page;
    const end = start + this.itemsPerPage;

    return { start, end }
  }

  async add() {
    const { start, end } = this.getPagination()
    this.data = await this.loadData(start, end)
    this.fillBodyTemplate()
    this.addArrow()
  }


  sort() {
    const { id, order } = this.sorted
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    }
    else { this.sortOnServer() }
  }

  fillBodyTemplate() {
    let element 
    this.data.forEach(obj => {
      if (Number.isInteger(obj.id)) { /* если передается объект НЕ с продуктом, то НЕ оборачиваем в ссылку */
        element = this.createElement(`<div class="sortable-table__row">${this.getTableRow(obj)}</div>`)
      } else {
        element = this.createElement(`<a href="/products/${obj.id}" class="sortable-table__row">${this.getTableRow(obj)}</a>`)
      } /* передается объект С ПРОДУКТОМ, оборачиваем в ссылку для редактирования */
      
      this.subElements.body.append(element)
    })
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick)
    document.addEventListener('scroll', this.scrollLoader);
  }

  sortOnClick = event => {
    const eventTarget = event.target.closest(`.sortable-table__cell[data-sortable="true"]`)
    if (!eventTarget) return

    this.sorted = {
      id: eventTarget.dataset.id,
      order: eventTarget.dataset.order == 'desc' ? 'asc' : 'desc'
    }
    this.sort()
  }

  sortOnServer() {
    if (this.page > 0) {
      this.page = 0
    }

    this.update(this.from, this.to)
  }

  scrollLoader = event => {
    const overallHeight = document.documentElement.scrollHeight
    let scrollByY = window.scrollY
    let heigthOfHtmlInWIndow = document.documentElement.clientHeight

    if (Math.round(scrollByY + heigthOfHtmlInWIndow) === overallHeight) {
      this.page = this.page + 1
      this.add()
    }
  }

  getTableRow(obj) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return { id, template }
    });

    return cells
      .map(({ id, template }) => {
        return template
          ? template(obj[id]) // id === "images"
          : `<div class="sortable-table__cell">${this.checkId(id, obj[id])}</div>`;
      })

      .join('');
  }

  checkId(id, idOfObj) { // метод, добавляющий знак доллара или форматирующий дату
    if (id === 'createdAt') {
      return idOfObj.split('T')[0]

    }

    if (id === 'totalCost' || id === 'price') {
      return `${idOfObj}$`
    }

    else {
      return idOfObj
    }

  }


  sortOnClient(id, order) {
    this.addArrow()
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[order] // 1 или -1
    this.data.sort(sortArray)

    function sortArray(a, b) {
      switch (id) {
        case 'title':
          return direction * a[id].localeCompare(b[id], 'ru', { caseFirst: 'upper', sensitivity: 'case' });
        default:
          return direction * (a[id] - b[id])

      }
    }
    this.subElements.body.innerHTML = ""
    this.fillBodyTemplate()
  }

  addArrow() {
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${this.sorted.id}"]`)

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = this.sorted.order
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  removeListeners() {
    document.removeEventListener('scroll', this.scrollLoader);
  }

  destroy() {
    this.remove();
  }

}