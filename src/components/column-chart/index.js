import BaseComponent from '../BaseComponent'
import ChartEventState from '../../state/ChartEventState'
export default class ColumnChart extends BaseComponent {
  #chartHeight = 50
  #elementDOM = null

  label = ''
  link = ''
  formatHeading = (v) => v

  stateManager = null

  changeLoading = () => {
    const classList = [...this.#elementDOM.classList]
    classList.includes('column-chart_loading')
      ? this.#elementDOM.classList.remove('column-chart_loading')
      : this.#elementDOM.classList.add('column-chart_loading')
  }

  updateColumns = () => {
    const { body, header } = this.memoDOM.cache
    body.innerHTML = this.templateColumns()
    header.innerHTML = this.formatHeading(this.stateManager.value)
  }

  constructor({ label, link, formatHeading }, stateManager) {  
    super()

    if (!(stateManager instanceof ChartEventState)) 
      throw new Error('state manager not passed to chart need in ChartEventState')

    this.label = label || this.label
    this.link = link || this.link
    this.formatHeading = formatHeading || this.formatHeading

    this.stateManager = stateManager
  }

  get element() {
    return this.#elementDOM
  }

  render() {
    this.#elementDOM = this.createDOMElement(this.template())
    this.memoDOM.memoizeDocument(this.#elementDOM)
    this.initEvents()
  }

  remove() {
    this.#elementDOM?.remove();
  }

  destroy() {
    this.remove()
    this.memoDOM.clear()
    this.#elementDOM = null
    this.removeEvents()
  }

  template() {
    return /*html*/`
      <div
        class="column-chart" 
        style="--chart-height: ${this.#chartHeight}"
      >
        <div class="column-chart__title">
          ${this.label}
          ${this.templateLink()}
        </div>
        <div class="column-chart__container">
          <div data-memo="header" class="column-chart__header">
            ${this.formatHeading(this.stateManager.value)}
          </div>
          <div data-memo="body" class="column-chart__chart">
            ${this.templateColumns()}
          </div>
        </div>
      </div>
    `;
  }

  templateLink() {
    return this.link
      ? /*html*/`<a class="column-chart__link" href="${this.link}">View all</a>`
      : ""
  }

  templateColumns() {
    const columnsData = this.stateManager.data
    const maxValue = Math.max(...columnsData);
    const scale = this.#chartHeight / maxValue;

    return columnsData.map((columnValue) => {
      const percent = ((columnValue / maxValue) * 100).toFixed(0);
      const value = String(Math.floor(columnValue * scale))
      return /*html*/`
        <div style="--value: ${value}" data-tooltip="${percent}%"></div>
      `
    }).join('')
  }

  initEvents() {
    this.stateManager.on('updateChartRange', this.updateColumns)
    this.stateManager.on('startLoading', this.changeLoading)
    this.stateManager.on('finishLoading', this.changeLoading)
  }

  removeEvents() {
    this.stateManager.removeListener('updateChartRange', this.updateColumns)
    this.stateManager.removeListener('startLoading', this.changeLoading)
    this.stateManager.removeListener('finishLoading', this.changeLoading)
  }
}