import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './orders-headers.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class SalesPage {
  subelements = {}

  update = (event) =>{
    const { sortTable } = this.componentsObject;
    sortTable.defaultSort.options['createdAt_gte'] = event.detail.from;
    sortTable.defaultSort.options['createdAt_lte'] = event.detail.to;
    sortTable._refreshInitialData();
    this.updateComponent(event.detail.from, event.detail.to, 'delivery');
  }

  constructor() {
    this.defaultSort = {id: 'user', order: 'asc'};
  }

  render () {
    const {createdAt_gte, createdAt_lte} = defaultSortTableChartFormat.sorted.options;
    this.componentsObject = {
      sortTable: new SortableTable(header, defaultSortTableChartFormat),
      rangePicker: new RangePicker({from: createdAt_gte, to: createdAt_lte})
    };

    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subelements = this.getSubelements();
    this.componentsUpdate();
    document.getElementsByClassName('progress-bar')[0].style.display = 'none';
    this.initEvents();
    return this.element;
  }

  getTemplate () {
    return `
    <div class="sales full-height flex-column">
          <div class="content__top-panel">
            <h2 class="page-title">Продажи</h2>
            <div class="rangepicker">
            <div data-element="rangePicker">

            </div>
            <div class="rangepicker__selector" data-elem="selector"></div>
          </div>
        </div>
        <div class="full-height flex-column" data-element="ordersContainer">
           <div data-element="sortTable"></div>
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
    this.componentsObject.rangePicker.element.addEventListener('date-select', this.update);

  }





  async updateComponent (from, to, createdAt = this.defaultSort.id) {
    const response = await this.componentsObject.sortTable.fetchData({options: {createdAt_gte: from, createdAt_lte: to}, field: createdAt});
    this.componentsObject.sortTable.update(response);
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


}




const defaultSortTableChartFormat = {url: 'api/rest/orders', immediateFetch: true, isSortLocally: false, chunk: 30, sorted: {id: 'delivery', order: 'asc', options: {createdAt_lte: new Date(), createdAt_gte: new Date('April 19, 2022 03:24:00')}}};

