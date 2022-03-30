import CategoriesList from '../../components/categories/index.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async getDataForCategoriesContainer () {
		const CATEGORIES =`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`;

    return await fetchJson(CATEGORIES);
  }

  // async updateTableComponent (from, to) {
  //   const data = await fetchJson(`${process.env.BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`);
  //   this.components.sortableTable.addRows(data);
  // }
  //
  // async updateChartsComponents (from, to) {
  //   const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);
  //   const ordersDataTotal = ordersData.reduce((accum, item) => accum + item);
  //   const salesDataTotal = salesData.reduce((accum, item) => accum + item);
  //   const customersDataTotal = customersData.reduce((accum, item) => accum + item);
  //
  //   this.components.ordersChart.update({headerData: ordersDataTotal, bodyData: ordersData});
  //   this.components.salesChart.update({headerData: '$' + salesDataTotal, bodyData: salesData});
  //   this.components.customersChart.update({headerData: customersDataTotal, bodyData: customersData});
  // }

  async initComponents () {
    const categories = await this.getDataForCategoriesContainer();

    const temp = {};

    for (const id in categories) {

      temp[id] = new CategoriesList(categories[id]);
      this.components.categoriesContainer = temp;
    }
  }

  get template () {
    return `<div class="categories">
      <div class="content__top-panel">
        <h2 class="page-title">Категории товаров</h2>
       </div>
      <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
      <div data-element="categoriesContainer">

      <!-- categoriesContainer -->

      </div>
    </div>
		`;
  }

  async render () {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();

    return this.element;
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const element = this.components[component];

      for (const key in Object.keys(element)) {
        root.append(element[key].element);
      }
    });
  }


  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy () {
    for (const components of Object.values(this.components)) {
      Object.values(components).forEach((component) => component.destroy())
    }
  }
}
