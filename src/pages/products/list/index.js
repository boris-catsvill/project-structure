import DoubleSlider from '../../../components/double-slider';
import SortableTable from '../../../components/sortable-table';
import header from './products-header.js';

const URL_PATH = process.env.URL_PATH;

export default class Page {
  element;
  subElements = {};
  components = {};
  filter = {
    '_embed': 'subcategory.category',
  };

  get template() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h2 class="page-title">Товары</h2>
          <a href="/${URL_PATH}products/add" class="button-primary">Добавить товар</a>
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
        <div data-element="productsContainer" class="products-list__container"></div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListners();

    return this.element;
  }

  initComponents() {    
    const sliderContainer = new DoubleSlider({ min: 0, max: 4000 });

    const productsContainer = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      sorted: {
        id: 'title',
        order: 'asc',
      },
      start: 0,
      end: 30,
      step: 30,
      placeholder: `
        <div>
          <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
        </div>
      `,
      rowUrlTemplate: row => `/${URL_PATH}products/${row.id}`,
    });

    this.components = {
      sliderContainer,
      productsContainer,
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListners() {
    this.components.sliderContainer.element.addEventListener('range-select', event => {
      const { from, to } = event.detail;
      this.filter.price_gte = from;
      this.filter.price_lte = to;
      this.updateComponents();
    });

    let delayTimer;
    this.subElements.filterName.addEventListener('keyup', () => {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        const value = this.subElements.filterName.value.trim();
        if (value !== this.filter.title_like) {
          this.filter.title_like = value;
          this.updateComponents();
        }
      }, 1000);
    });

    this.subElements.filterStatus.addEventListener('change', () => {
      const { value } = this.subElements.filterStatus;
      if (value === '') {
        delete this.filter.status;
      } else {
        this.filter.status = value;
      }
      this.updateComponents();
    });
  }

  updateComponents() {
    this.components.productsContainer.setFilter(this.filter);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.remove();

    this.element = null;
    this.subElements = null;
    this.components = null;
  }
}
