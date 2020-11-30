export default class ColumnChart {
  chartHeight = 50
  element = null

  constructor({data = [], label = '', link = '', value = null} = {}) {
    this.data = data
    this.label = label
    this.link = link
    this.value = value
    this.render()
  }

  render() {
    const isLoading = this.data.length === 0
    const maxValue = Math.max(...this.data)
    const element = document.createElement('div')

    element.innerHTML = `
      <div class="column-chart" style="--chart-height:${this.chartHeight};">
        <div class="column-chart__title">
          <span>Total ${this.label}</span>
          ${(this.link) && `<a class="column-chart__link" href="${this.link}">View all</a>`}
        </div>
        <div class="column-chart__container">
          <div class="column-chart__header">${this.value}</div>
          <div class="column-chart__chart">
            ${this.data.map(item => `
                <div data-tooltip="${Math.round(item / maxValue * 100)}%" style="--value:${Math.floor(item / maxValue * this.chartHeight)};"></div>
              `).join('')}
          </div>
        </div>
      </div>
    `

    this.element = element.firstElementChild
    if (isLoading) {
      this.element.classList.add('column-chart_loading')
    }
  }

  destroy() {
    this.element.remove()
  }

  remove() {
    this.element.remove()
  }

  update(newData = []) {
    const parentElement = this.element.parentElement
    this.data = newData
    this.value = this.data.reduce((accum, item) => accum + item)
    this.element.remove()
    this.render()
    parentElement.append(this.element)
  }

  updateHeader() {

  }
}
