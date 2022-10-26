import RangePicker from '../../components/RangePicker.js';
import SortableTable from '../../components/SortableTable.js';
import ColumnChart from '../../components/ColumnChart.js';

import getComponents from './getComponents.js';

export default class DashboardPage {
  static containersForFillig = ['rangePicker', 'orders-chart', 'sales-chart', 'customers-chart', 'sortableTable'];

  subElements = {}
  elements = []

  getComponents = getComponents
  childrenComponents = []

  mainClass = null
  range = {
    from: null,
    to: null
  }

  get elementDOM() {
    const wrapper = document.createElement('div');
    const dashbord = `
        <div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
                <div data-element="rangePicker"></div>
            </div>
            <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>

            <h3 class="block-title">Лидеры продаж</h3>

            <div data-element="sortableTable"></div>
        </div>`;

    wrapper.innerHTML = dashbord;
    return wrapper.firstElementChild;
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  updateRange(newRange) {
    const { from, to } = newRange;

    this.range.from = new Date(from);
    this.range.to = new Date(to);

    this.mainClass.range.from = new Date(from);
    this.mainClass.range.to = new Date(to);
  }

  async update() {
    this.childrenComponents.forEach((component) => component.element?.remove());
    
    this.childrenComponents = this.getComponents(this.range).map(([ComponentChild, containerName, inputData]) => {
      const component = new ComponentChild(...inputData);
      component.render();
      this.subElements[containerName].append(component.element);
      return component
    });

    const updateComponents = this.childrenComponents.map(componentChild => componentChild?.update())
    await Promise.all(updateComponents)
  }

  changeRangeHandler = (event) => {
    this.updateRange(event.detail);
    this.update();
  }

  addEventListeners() {
    this.element.addEventListener('date-select', this.changeRangeHandler);
  }

  render(mainClass, range) {
    this.mainClass = mainClass;
    this.range = {
      from: new Date(range.from),
      to: new Date(range.to)
    };

    this.element = this.elementDOM;

    this.setSubElements();
    this.addEventListeners();
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    this.childrenComponents.forEach((component) => component?.destroy())
    this.remove();
  }
}

