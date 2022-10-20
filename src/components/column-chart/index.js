import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor ({url='', range={from, to}, label='', link='', formatHeading= data => data} = {}) {
    this.label = label
    this.link = link
    this.range = range
    this.formatHeading = formatHeading

    this.url = new URL(BACKEND_URL +'/'+ url)

    this.render()
    this.getSubElements()
    this.update(this.range.from, this.range.to)
    this.initEventListeners()
  }

  render () {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  async fetchData (from, to) {
    this.url.searchParams.set('from', from)
    this.url.searchParams.set('to', to)

    const data = await fetchJson(this.url)

    return data
  }

  get template() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
    `;
  }

  dataTemplate (data) {
    const date = Object.keys(data)
    const values = Object.values(data)

    const maxData = Math.max(...values)
    const coef = 100 / maxData

    const dataTemplateArr = Object.entries(data).map(item => {
      const value = item[1]
      const date = new Date(item[0])

      const dateString = `${date.getDate()} ${new Intl.DateTimeFormat('en-US', {month: 'short'}).format(date)} ${date.getFullYear()}`

      const coefValue = value * coef
      const heightCol = Math.floor((this.chartHeight / 100) * coefValue)
      
      return `<div style="--value: ${heightCol}" data-tooltip="${this.tooltipTemplate(dateString ,value)}"></div>`
    })

    return [...dataTemplateArr].join('')
  }

  tooltipTemplate(date, value) {
    return `
      <div><small>${date}</small></div><strong>${value}</strong>
    `
  }

  initEventListeners() {
    this.element.addEventListener('mouseover', this.mouseOver)
  }

  mouseOver = event => {
    const target = event.target.closest('[data-tooltip]')
    if (target === null) return
    
    this.body.classList.add('has-hovered')
    target.classList.add('is-hovered')

    target.addEventListener('mouseout', this.mouseOut)
  }
  
  mouseOut = event => {
    const target = event.target.closest('[data-tooltip]')

    this.body.classList.remove('has-hovered')
    target.classList.remove('is-hovered')
  }

  async update (from, to) {
    this.element.classList.add('column-chart_loading');

    const data = await this.fetchData(from, to)

    const value = Object.values(data).reduce((a, b) => a+b, 0)

    this.element.classList.remove('column-chart_loading');
    
    this.body.innerHTML = this.dataTemplate(data)
    this.header.innerHTML = this.formatHeading(value)
  }

  getSubElements() {
    this.header = this.element.querySelector('[data-element="header"]')
    this.body = this.element.querySelector('[data-element="body"]')
  }

  remove () {
    this.element?.remove()
  }

  destroy () {
    this.remove()
    this.element = null
  }
}

