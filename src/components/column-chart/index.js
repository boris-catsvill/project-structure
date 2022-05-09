import fetchJson from '../../utils/fetch-json.js';

export default class ColumnChart {
  subelements = {}
  static calculateValue (obj) {
    return Object.values(obj).reduce((summ, value) => summ + value, 0);
  }

  constructor(options = {}) {
    ({url: this.url, value: this.value = 0, data: this.data = [], formatHeading: this.formatHeading = item => item, label: this.label = '', link: this.link, chartHeight: this.chartHeight = 50, immediateFetch: this.immediateFetch = true} = options);
    this.type = this.label || DEFAULT_TYPE;
    this.from = options.range.from;
    this.to = options.range.to;
    this.render();
    this.subelements = this.getSubelements();
    if (options.url && options.immediateFetch) {
      this.fetchData().then(data => this.update(data));
    }

  }

  getTemplate () {
    return `
      <div class="dashboard__chart_${this.type}">
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                 Total ${this.label}
            </div>
             <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
                <div data-element="body" class="column-chart__chart"> </div>
             </div>
        </div>
      </div>
    `;
  }

  render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    if (this.data.length) {
      wrapper.querySelector('.column-chart__chart').append(...this._formDataColumns(this.data));
      wrapper.querySelector('.column-chart').classList.remove('column-chart_loading');
    }


    if (this.link) {
      const link = document.createElement('a');
      link.href = this.link;
      link.innerText = "View all";
      link.classList.add('column-chart__link');
      wrapper.querySelector('.column-chart__title').append(link);
    }

    this.element = wrapper.firstElementChild;


  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.element = null;
  }

  fetchData ({
    start = this.from,
    end = this.to,
    url = this.url
  }={}) {
    return fetchJson(`${BACKEND_URL}/${url}?` + new URLSearchParams({
      'from': start.toISOString(),
      'to': end.toISOString()
    }));

  }


  update (...args) {
    this.element.querySelector('.column-chart').classList.add('column-chart_loading');
    if (!args.length) {
      this.fetchData().then((res)=>this.update(res));
      return;
    }

    if (args[0] instanceof Date) {
      this.fetchData({start: args[0], end: args[1]}).then((res)=>this.update(res));
    }
    //if data is { "2022-03-20": 11, "2022-03-21": 48}

    this._update(args[0]);

  }

  _update (dataObj) {
    this.element.querySelector('.column-chart').classList.remove('column-chart_loading');
    const chartElement = this.element.querySelector('.column-chart__chart');
    chartElement.replaceChildren(...this._formDataColumns(dataObj));
    this.data = dataObj;
    this.value = ColumnChart.calculateValue(dataObj);
    this.subelements.header.textContent = this.formatHeading(this.value);
  }

  _formDataColumns(dataObj) {
    const propsArray = this._getColumnProps(dataObj);

    return propsArray.map(item =>{
      const div = document.createElement('div');
      div.setAttribute("style", `--value:${item.value}`);
      div.dataset.tooltip = item.tooltip;
      return div;
    });
  }

  _getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(data).map(([tooltipDate, item]) => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale)),
        tooltip: this.getDataTooltip(tooltipDate, item)
      };
    });
  }

  getDataTooltip (tooltipDate, item) {
    return `
    <div><small>${tooltipDate}</small></div><strong>${item}</strong>
    `;
  }

  getSubelements () {
    const subelements = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      subelements[element.dataset.element] = element;
    }

    return subelements;
  }


}

const BACKEND_URL = 'https://course-js.javascript.ru';
const   DEFAULT_TYPE = 'order';
