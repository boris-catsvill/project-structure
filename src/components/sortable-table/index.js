import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL

export default class SortableTable {
  element = null
  subElements = {}
  start = 0
  step = 20
  loading = false
  isFullyLoaded = false

  constructor(header, {data = [], sortByDefault = 'title', url = ''} = {}) {
    this.url = new URL(url, BACKEND_URL)
    this.data = [...data]
    this.header = header
    this.lastSortField = sortByDefault
    this.lastSortOrder = 'asc'
    this.isProductTable = url.includes('/products?') || url.includes('/bestsellers?')
    this.render()
  }

  resetDefaults = () => {
    this.start = 0
    this.step = 20
    this.isFullyLoaded = false
  }

  async fetchData() {
    const url = this.url
    url.searchParams.set('_start', String(this.start))
    url.searchParams.set('_end', String(this.start + this.step))
    url.searchParams.set('_sort', this.lastSortField)
    url.searchParams.set('_order', this.lastSortOrder)
    this.element.classList.add('sortable-table_loading')
    const response = await fetchJson(url)
    this.element.classList.remove('sortable-table_loading')
    if (response.length === 0) {
      this.isFullyLoaded = true
      alert('Данные загружены полностью')
    }
    return response
  }

  get template() {
    return `
      <table class="sortable-table">
        <thead class="sortable-table__header">
          ${this.getHeader()}
        </thead>
        <tbody data-element="body" class="sortable-table__body">
          ${this.getBody(this.data)}
        </tbody>
      </table>`
  }

  getArrow(id) {
    return this.lastSortField === id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
         </span>`
      : ''
  }

  getHeader() {
    return `
      <tr data-element="header" class="sortable-table__header sortable-table__row">
        ${this.header.map(item => (`
          <th class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="asc">
            ${item.title}${this.getArrow(item.id)}
          </th>`))})
        .join('')}
      </tr>`
  }

  getRow(item) {
    return `
    ${(this.isProductTable) ? `<a href="/products/${item.id}" class="sortable-table__row">`: '<div class="sortable-table__row">'}
      ${this.header.map(headerItem => {
        return `
          <div class="sortable-table__cell">
            ${headerItem.template
               ? headerItem.template(item[headerItem.id])
               : item[headerItem.id]}
          </div>`
        }).join('')}
    ${(this.isProductTable) ? '</a>': '</div>'}`
  }

  getBody(data) {
    return `${data.map(item => {
      return (this.isProductTable)
        ? `<a href="/products/${item.id}">
              ${this.getRow(item)}
           </a>`
        : this.getRow(item)
    }).join('')}`
  }

  async render() {
    const element = document.createElement('div')
    element.innerHTML = this.template
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element)
    this.updateBody(await this.fetchData())
    this.initEventListeners()
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement
      return accum
    }, {})
  }

  sortEventHandler = (e) => {
    const headerItem = e.target.closest('[data-sortable="true"]')
    if (!headerItem) return
    if (this.lastSortField !== headerItem.dataset.id) {
      headerItem.append(this.subElements.arrow)
      this.lastSortField = headerItem.dataset.id
    }
    headerItem.dataset.order = headerItem.dataset.order === 'desc' ? 'asc' : 'desc'
    this.lastSortOrder = headerItem.dataset.order
    this.sortOnServer(this.lastSortField, this.lastSortOrder)
  }

  scrollHandler = async () => {
    let scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    )
    if (scrollHeight - (document.documentElement.clientHeight + pageYOffset) < 100
      && !this.isLoading
      && !this.isFullyLoaded) {
      this.start += this.step
      this.isLoading = true
      this.addToBody(await this.fetchData())
      this.isLoading = false
    }
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortEventHandler)
    window.addEventListener('scroll', this.scrollHandler)
  }

  async sortOnServer() {
    this.resetDefaults()
    this.updateBody(await this.fetchData())
  }

  sortOnClient(fieldValue, orderValue) {
    const headerItem = this.header.find(item => item.id === fieldValue)
    const data = [...this.data]
    const sortOrder = orderValue === 'desc' ? -1 : 1
    if (headerItem.sortType === 'number') {
      data.sort((a, b) => sortOrder * (a[fieldValue] - b[fieldValue]))
    } else if (headerItem.sortType === 'string') {
      data.sort((a, b) => sortOrder * (a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en'])))
    }
    this.updateBody(data)
  }

  updateBody(data) {
    this.subElements.body.innerHTML = this.getBody(data)
  }

  addToBody(additionalData) {
    this.subElements.body.insertAdjacentHTML('beforeend', this.getBody(additionalData))
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.element = null
    this.subElements = {}
  }
}

