import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL

export default class SortableTable {
  element = null
  subElements = {}
  start = 0
  step = 20
  loading = false
  isFullyLoaded = false

  constructor(header, {data = [], sortByDefault = header[1].id, url = '', isSortLocally = false} = {}) {
    this.url = new URL(url, BACKEND_URL)
    this.data = [...data]
    this.header = header
    this.isSortLocally = isSortLocally
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

  async fetchData({
                    sortField = this.lastSortField,
                    sortOrder = this.lastSortOrder,
                    dateFrom = '',
                    dateTo = '',
                    title_like= null,
                    status = null
                  } = {}) {
    this.url.searchParams.set('_start', String(this.start))
    this.url.searchParams.set('_end', String(this.start + this.step))
    this.url.searchParams.set('_sort', sortField)
    this.url.searchParams.set('_order', sortOrder)
    if (dateFrom) {
      this.url.searchParams.set('createdAt_gte', dateFrom)
    }
    if (dateTo) {
      this.url.searchParams.set('createdAt_lte', dateTo)
    }
    if (title_like !== null) {
      this.url.searchParams.set('title_like', title_like.toUpperCase())
    }
    if (status !== null) {
      this.url.searchParams.set('status', status)
      console.log(this.url)
    }
    this.element.classList.add('sortable-table_loading')
    const response = await fetchJson(this.url)
    this.element.classList.remove('sortable-table_loading')
    if (response.length === 0) {
      this.isFullyLoaded = true
      alert('Данные загружены полностью')
    }
    this.data = [...response]
    return response
  }

  async render() {
    const element = document.createElement('div')
    element.innerHTML = this.template
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element)
    this.updateBody(await this.fetchData())
    this.initEventListeners()
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

  getArrow(id) {
    return this.lastSortField === id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
         </span>`
      : ''
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

  getRow(item) {
    return `
    ${(this.isProductTable) ? `<a href="/products/${item.id}" class="sortable-table__row">` : '<div class="sortable-table__row">'}
      ${this.header.map(headerItem => {
      return `
          <div class="sortable-table__cell">
            ${headerItem.template
        ? headerItem.template(item[headerItem.id])
        : item[headerItem.id]}
          </div>`
    }).join('')}
    ${(this.isProductTable) ? '</a>' : '</div>'}`
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement
      return accum
    }, {})
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortEventHandler)
    window.addEventListener('scroll', this.scrollHandler)
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

  sortEventHandler = (e) => {
    const headerItem = e.target.closest('[data-sortable="true"]')
    if (!headerItem) return
    if (this.lastSortField !== headerItem.dataset.id) {
      headerItem.append(this.subElements.arrow)
      this.lastSortField = headerItem.dataset.id
    }
    headerItem.dataset.order = headerItem.dataset.order === 'desc' ? 'asc' : 'desc'
    this.lastSortOrder = headerItem.dataset.order
    if (this.isSortLocally) {
      this.sortOnClient(this.lastSortField, this.lastSortOrder)
    } else {
      this.sortOnServer(this.lastSortField, this.lastSortOrder)
    }
  }

  async sortOnServer() {
    console.log('onServer')
    this.resetDefaults()
    this.updateBody(await this.fetchData())
  }

  sortOnClient(fieldValue, orderValue) {
    console.log('locally')
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
    window.removeEventListener('scroll', this.scrollHandler)
  }

  destroy() {
    this.remove()
    this.element = null
    this.subElements = {}
  }
}

