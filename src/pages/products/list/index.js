import fetchJson from '../../../utils/fetch-json';
import SortableTable from '../../../components/sortable-table';
import DoubleSlider from '../../../components/double-slider';
import header from '../../products/list/products-header';
const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};
  start = 0;
  end = 30;
  url = new URL('api/rest/products?_embed=subcategory.category', BACKEND_URL);

  async updateComponents(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);

  }

  loadData(from = this.start, to = this.end) {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);
    this.components.sortableTable.endOfData = false;
    this.components.sortableTable.url = this.url;
    this.components.sortableTable.data = [];
    return fetchJson(this.url);
  }

  initComponents() {
    const sliderContainer = new DoubleSlider({min:1, max: 4000});
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);
    const sortableTable = new SortableTable(header,{
      url: this.url,
    });
    this.components = {
      sliderContainer,
      sortableTable
    };
  }

  get template() {
    return `<div class="products-list">
              <div class="content__top-panel">
                <h1 class="page-title">Товары</h1>
                <a href="/products/add" class="button-primary">Добавить товар</a>
              </div>
              
              <div class="content-box content-box_small">
                <form class="form-inline">
                  <div class="form-group">
                    <label class="form-label">Сортировать по:</label>
                    <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
                  </div>
                  
                  <div class="form-group" data-element="sliderContainer">
                    <label class="form-label">Цена:</label>
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
                            
              <div data-element="sortableTable">
                  <!-- sortable-table component -->
              </div>
            </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.getSubElements(element);
    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }
  renderComponents() {
    for (const component of Object.keys(this.components)) {
      this.subElements[component].append(this.components[component].element);
    }
  }
  initEventListeners() {
    this.subElements.sliderContainer.addEventListener('range-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
    this.subElements.filterName.addEventListener('input', event => {
      this.url.searchParams.set('title_like', event.target.value);

      this.updateComponents();
    });
    this.subElements.filterStatus.addEventListener('change', event => {
      const status = [...event.target.options].find(item => item.selected).value;
      if (!status)  {
        this.url.searchParams.delete('status');
      } else {

        this.url.searchParams.set('status', status);
      }

      this.updateComponents();
    })
  }
  getSubElements(element) {
    const arr = element.querySelectorAll('[data-element]');
    for (const elem of arr) {
      this.subElements[elem.dataset.element] = elem;
    }
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.subElements = {};
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
  }

}
