import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class SortableTable {
  constructor(headerConfig, {
    url = '',
    isSortLocally = false
  } = {}) {
    this.headerConfig = headerConfig
    
    this.sortDirect = false
    this.isSortLocally = isSortLocally
    this.start = 0
    this.end = 30
    this.url = new URL(url)
    this.headerRowsTemplate = this.headerRows()

    this.render()
    this.appendData()
    this.subElements = this.getSubElements()
    this.initListeners()
  }

  render () {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    let firstSortElem = null
    for (const item of this.headerConfig) {
      if (item.sortable) {
        firstSortElem = this.element.querySelector(`[data-id="${item.id}"]`)
        break
      }
    }

    const arrow = document.createElement("div");
    arrow.innerHTML = this.arrowTemp;
    this.arrow = arrow.firstElementChild;
    firstSortElem.dataset.order = 'asc'
    firstSortElem.append(this.arrow)
  }

  getSubElements() {
    const subElements = {}
    const elementsArr = this.element.querySelectorAll('[data-element]');
    
    elementsArr.forEach(elem => {
      subElements[elem.dataset.element] = elem
    })

    return subElements;
  }

  headerRows () {
    return this.headerConfig.map(elem => {
        return `
          <div class="sortable-table__cell" data-id="${elem.id}" data-sortable="${elem.sortable}">
            <span>${elem.title}</span>
          </div>
        `
      })
  }

  bodyRows (data) {
    return [...data].map(elem => {
        return `
          <a ${this.url.href.includes('orders') ? null : `href="/products/${elem.id}"`} class="sortable-table__row">
            ${Object.values(this.headerConfig).map(field => {
              if (field.template) return field.template(elem[field.id])
              if (field.id === 'subcategory') {
                return `
                  <div class="sortable-table__cell">
                    <span data-tooltip='${this.tooltipTemplate(elem[field.id])}'>${elem[field.id].title}</span>
                  </div>`
              }
              return `<div class="sortable-table__cell">${elem[field.id]}</div>`
              }).join('')
            }
          </a>
        `
    })
  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerRowsTemplate.join('')}
        </div>
        <div data-element="body" class="sortable-table__body"></div>
      </div>
    </div>
    `
  }

  get arrowTemp() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `
  }

  tooltipTemplate(data) {
    return `
      <div class="sortable-table-tooltip">
        <span class="sortable-table-tooltip__category">${data.category.title}</span> /
        <b class="sortable-table-tooltip__subcategory">${data.title}</b>
      </div>
    `
  }

  get emptyTemplate() {
    return `
      <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products were found that meet the selected criteria</p>
          <button type="button" class="button-primary-outline">Очистить фильтры</button>
        </div>
      </div>
    `
  }

  initListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortedHandler)
    document.addEventListener('scroll', this.onScrollHandler)
  }

  async fetchData (field, order, start = 0, end = 30) {
    this.url.searchParams.set('_sort', field)
    this.url.searchParams.set('_order', order)
    this.url.searchParams.set('_start', start)
    this.url.searchParams.set('_end', end)

    const data = await fetchJson(this.url)

    return data
  }

  async appendData() {
    this.element.firstElementChild.classList.add('loading-line')

    this.data = await this.fetchData('title', 'asc')
    this.subElements.body.innerHTML = this.bodyRows(this.data).join('')
    
    this.element.firstElementChild.classList.remove('loading-line');
  }

  async addData (start = 0, end = 30) {
    this.url.searchParams.set('_start', start)
    this.url.searchParams.set('_end', end)

    const data = await fetchJson(this.url)

    const addTemp = document.createElement("div");
    addTemp.innerHTML = this.bodyRows(data).join('');
    this.subElements.body.append(...addTemp.children)
  }

  async updateData(url) {
    this.url = url

    let data = {}
    try {
      data = await fetchJson(this.url.href).catch(error => console.error(error))
    } catch (error) {
      console.log(error);
      return
    }

    console.log(data.length);
    if (data.length === 0) {
      this.subElements.body.innerHTML = this.emptyTemplate
    } else {
      const template = this.bodyRows(data)
      this.subElements.body.innerHTML = template.join('')
    }
    
  }

  async getMaxValue(field) {
    let maxValue = 0
    const data = await this.fetchData(field, 'desc')
    maxValue = data[0].price
    return maxValue
  }

  sort(field, order) {
    let sortedArr = []
    if (this.isSortLocally) {
      sortedArr = this.sortOnClient(field, order);
      this.subElements.body.innerHTML = this.bodyRows(sortedArr).join('')
    } else {
      this.sortOnServer(field, order).then(data => {
        this.subElements.body.innerHTML = this.bodyRows(data).join('')
      });
    }
  }

  sortOnClient (field, order) {
    const index = this.headerConfig.findIndex(elem => elem.id === field)
    const targetCol = this.headerConfig[index]

    let compare = (a, b) => a - b;
    
    if (targetCol.sortType === 'string') {
      compare = (a, b) => a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});
    }
    
    const sortedArr = [...this.data].sort((a, b) => {
      const curr = a[targetCol.id]
      const next = b[targetCol.id]
      if (order === 'asc') {
        return compare (curr, next)
      }
      if (order === 'desc') {
        return compare(next, curr)
      }
      throw new Error('Wrong parameter direction')
    });

    return sortedArr
  }

  async sortOnServer (field, order) {
    this.element.firstElementChild.classList.add('loading-line')
    const data = await this.fetchData(field, order)
    this.element.firstElementChild.classList.remove('loading-line');
    return data
  }

  onSortedHandler = event => {
    event.target.onselectstart = function() {
      return false;
    };
    
    const prevTarget = this.subElements.header.querySelector('[data-order]')
    const targetElem = event.target.closest('[data-sortable="true"]');
    
    if (targetElem === null) return
    
    if (targetElem !== prevTarget) {
      this.sortDirect = true
    }
    
    const order = this.sortDirect ? 'asc' : 'desc';

    const columns = this.subElements.header.querySelectorAll('[data-order]');
    for (const elem of columns) {
      elem.removeAttribute('data-order');
    }

    this.sort(targetElem.dataset.id, order)
    targetElem.dataset.order = order
    targetElem.appendChild(this.arrow)

    this.sortDirect = !this.sortDirect
  }

  onScrollHandler = event => {
    const countNewItems = 30
    const toBottom = document.documentElement.getBoundingClientRect().bottom - document.documentElement.clientHeight

    // Пытался написать (toBottom < 100) чтобы подгрузка была заранее, но из за этого подгрузка выполнялась много раз, а не один
    // При (toBottom === 100) происходит пропуск значения 100
    if (toBottom === 0) { 
      this.start += countNewItems
      this.end += countNewItems
      this.addData(this.start, this.end)
    }
  }

  remove () {
    this.element?.remove()
  }

  destroy () {
    this.remove()
    this.element = null
    document.removeEventListener('scroll', this.onScrollHandler)
  }
}
