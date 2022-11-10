export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    value = 0,
    label = "",
    link = "",
    formatHeading = (value) => value,
  } = {}) {
    this.data = data;
    this.value = value;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading

    this.render();
  }

  get HTMLTemplate() {
    return `
      <div class='column-chart column-chart_loading'>
        <div class='column-chart__title'>
          Total ${this.label}
          ${this.renderLink()}
        </div>
        <div class='column-chart__container'>
          <div class='column-chart__header'>${this.formatHeading(this.value)}</div>
          <div class='column-chart__chart' data-element="columnChart">
            ${this.renderValues()}
          </div>
        </div>
      </div>
    `;
  }

  renderLink() {
    if (!this.link) return "";
    return `
      <a class='column-chart__link' href=${this.link}>
        Подробнее
      </a>
    `;
  }

  renderValues() {
    if (!this.data.length) return;
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    console.log(this.data);
    return this.data
      .map((value) => {
        const precent = ((value / maxValue) * 100).toFixed(0) + "%";
        return `
        <div
          data-hover="true"
          style='--value: ${Math.floor(value * scale)}'
          onhover="this.classList.toggle('is-hovered')"
          data-tooltip='<div><strong>${this.formatHeading(value)}</strong><div/>'
        ></div>
      `;
      })
      .join("");
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.HTMLTemplate;
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove(`column-chart_loading`);
    }

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners()

    return this.element;
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  toggleHover = (event) => {
    if (event.target.closest('[data-hover="true"]')) {
      this.subElements.columnChart.classList.toggle('has-hovered')
      event.target.classList.toggle('is-hovered')
    }
  }

  initEventListeners() {
    this.subElements.columnChart.addEventListener('pointerover', this.toggleHover)
    this.subElements.columnChart.addEventListener('pointerout', this.toggleHover)
  }

  update ({headerData, bodyData}) {
    this.subElements.header.textContent = headerData;
    this.subElements.body.innerHTML = this.getColumnBody(bodyData);
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element?.remove();
  }
}