import SortableTable from '../components/SortableTable.js';
import RangePicker from '../components/RangePicker.js';

import header from '../store/sales-header.js';

export default class SalesPage {
  static containersForFillig = ['rangePicker', 'sortableTableContainer'];

  subElements = {}
  wrappersOfElementHTML = []


  constructor({ mainClass, range, url }) {

    const [path, backendURL] = url;

    this.mainClass = mainClass;
    this.path = path;
    this.backendURL = backendURL;

    this.range = {
      from: new Date(range.from),
      to: new Date(range.to)
    };

    this.inputData = {
      rangePicker: [this.range],
      sortableTable: [header, {
        range: this.range,
        url: (new URL(this.path, this.backendURL)).toString(),
        isSortLocally: false,
        showingPage: 'SalesPage',
      }]
    };

    this.components = [
      ['rangePicker', RangePicker, this.inputData.rangePicker],
      ['sortableTable', SortableTable, this.inputData.sortableTable],
    ];

    this.render();
  }

  get ProductsElement() {
    const wrapper = document.createElement('div');
    const dashbord = `
        <div class="sales full-height flex-column">
            <div class="content__top-panel">
                <h1 class="page-title">Продажи</h1>
                <div data-element="rangePicker"></div>
            </div>
      <div data-element="sortableTableContainer" class="full-height flex-column"></div>
      </div>`;
    wrapper.innerHTML = dashbord;
    return wrapper.firstElementChild;
  }

  getElements() {
    const elements = Object.entries(this.subElements).flatMap(([nameOfContainer, container]) => {
      if (!SalesPage.containersForFillig.includes(nameOfContainer)) { return []; }

      const component = this.components.find(([name]) => nameOfContainer.includes(name));

      if (!component) { return []; }

      const [_, Constructor, dataAsArray] = component;

      const wrapperOfElementHTML = new Constructor(...dataAsArray);
      this.wrappersOfElementHTML.push(wrapperOfElementHTML);
      return [[container, wrapperOfElementHTML]];
    });
    return elements;
  }

  update() {
    this.mainClass.toggleProgressbar();

    const htmlDataOfElements = this.getElements();

    htmlDataOfElements.forEach(([container, wrapperOfElementHTML]) => {
      container.append(wrapperOfElementHTML.element);
    });

    this.mainClass.toggleProgressbar();
  }


  updateRange(newRange) {
    const { from, to } = newRange;

    this.range.from = new Date(from);
    this.range.to = new Date(to);

    this.mainClass.range.from = new Date(from);
    this.mainClass.range.to = new Date(to);
  }

  changeRangeHandler = (event) => {
    this.updateRange(event.detail);

    this.wrappersOfElementHTML.forEach(wrapper => { wrapper.destroy(); });
    this.elements = [];

    this.update();
  }

  addEventListeners() {
    this.element.addEventListener('date-select', this.changeRangeHandler);
  }


  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  async render() {
    this.element = this.ProductsElement;

    this.setSubElements();
    this.addEventListeners();

    this.update();

    return this.element;
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    this.wrappersOfElementHTML.forEach(wrapper => { wrapper.destroy(); });
    this.remove();
  }
}

