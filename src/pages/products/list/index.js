import DoubleSlider from '../../../components/double-slider/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-headers.js';

import fetchJson from '../../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ProductsPage {
  subelements = {}
  update = (event) =>{
    let curDataElement = event.target.closest('[data-element]');
    let sortField = this.getSortField(curDataElement.dataset.element);

    const { productsContainer } = this.componentsObject;
    productsContainer.defaultSort.options = this.getDataFromForm();
    productsContainer.defaultSort.id = sortField || 'title';
    productsContainer._refreshInitialData();
    this.updateComponent();

  }

  constructor() {
    this.defaultSort = {id: 'price', order: 'asc'};
  }

  render () {
    this.componentsObject = {
      productsContainer: new SortableTable(header, defaultSortTableChartFormat),
      doubleSlider: new DoubleSlider({min: 200, max: 4000})
    };

    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subelements = this.getSubelements();
    this.componentsUpdate();
    this.subelements.from = this.element.querySelector('[data-element="from"]');
    this.subelements.to = this.element.querySelector('[data-element="to"]');
    document.getElementsByClassName('progress-bar')[0].style.display = 'none';
    this.initEvents();
    return this.element;
  }

  getTemplate () {
    return `
    <div class="products-list">
          <div class="content__top-panel">
            <h2 class="page-title">Товары</h2>
            <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small">
            <form class="form-inline">
                <div class="form-group">
                  <label class="form-label">Сортировать по:</label>
                  <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
                </div>
                <div class="form-group" data-elem="sliderContainer">
                  <label class="form-label">Цена:</label>
                  <div data-element="doubleSlider"> </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Статус:</label>
                  <select class="form-control" data-element="filterStatus">
                    <option value="" selected="">Любой</option>
                    <option value="1">Активный</option>
                    <option value="0">Неактивный</option>
                  </select>
                </div>
              </form>
        </div>
        <div class="products-list__container" data-element="productsContainer">

        </div>


    </div>
    `;
  }


  componentsUpdate () {
    const subsList = Object.entries(this.subelements);

    for (const [elementName, elementValue] of subsList) {
      try{
        elementValue.append(this.componentsObject[elementName].element);
      } catch (err) {console.error(err)}

    }
  }

  getSubelements () {
    const subs = {};
    const subsList = this.element.querySelectorAll('[data-element]');

    for (const element of subsList) {
      subs[element.dataset.element] = element;
    }

    return subs;
  }

  initEvents () {
    const {doubleSlider, filterName, filterStatus} = this.subelements;
    doubleSlider.addEventListener('range-select', this.update);
    filterName.addEventListener('keyup', this.update);
    filterStatus.addEventListener('change', this.update);

  }





  async updateComponent (from, to, createdAt = this.defaultSort.id) {
    const response = await this.componentsObject.productsContainer.fetchData();
    this.componentsObject.productsContainer.update(response);
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    for (const component in this.componentsObject) {
      this.componentsObject[component].destroy();
    }
    this.componentsObject = null;
    this.subelements = null;
  }

  getDataFromForm () {
    const {from, to, filterStatus, filterName} = this.subelements;
    const opt = {
      price_gte: this.parsePrice(from.innerText),
      price_lte: this.parsePrice(to.innerText),
      title_like: filterName.value,
      status: filterStatus.options[filterStatus.selectedIndex].value
    };
    const options = {};
    for (const prop in opt) {
      if (opt[prop]!= "") {
        options[prop] = opt [prop];
      }
    }

  return options;
  }

  parsePrice (strPrice) {
    return strPrice.replace('$', '');
  }

  getSortField (name) {
    switch (name){
    case "doubleSlider" :
      return 'price';
    case "filterStatus" :
      return 'enabled';
    case "filterName" :
      return 'title';

    }
  }


}




const defaultSortTableChartFormat = {url: 'api/rest/products', immediateFetch: true, isSortLocally: false, chunk: 30, sorted: {id: 'name', order: 'asc'}};

