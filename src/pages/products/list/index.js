import DoubleSlider from '../../../components/double-slider';
import SortableTable from '../../../components/sortable-table';

export default class Page {
  element;
  subElements = {};
  components = {};
  isLoading = false;

  async render() {
    const element = document.createElement('div');
    element.className = 'products-list';

    element.innerHTML = `
      <div class="content__top-panel">
        <h1 class="page-title">List page</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
`;

    this.element = element;

    this.initComponents();
    await this.renderComponents();
    this.addEventListeners();
    this.getSubElements(this.element);
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    for (const item of elements) {
      this.subElements[item.dataset.elem] = item;
    }
  }

  initComponents() {
    const header = [
      {
        id: 'images',
        title: 'Image',
        sortable: false,
        template: (data = []) => {
          return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
          </div>
        `;
        }
      },
      {
        id: 'title',
        title: 'Name',
        sortable: true,
        sortType: 'string'
      },
      {
        id: 'quantity',
        title: 'Quantity',
        sortable: true,
        sortType: 'number'
      },
      {
        id: 'price',
        title: 'Price',
        sortable: true,
        sortType: 'number'
      },
      {
        id: 'status',
        title: 'Status',
        sortable: true,
        sortType: 'number',
        template: data => {
          return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
        }
      }
    ];

    this.components.sortableTable = new SortableTable(header, {
      url: 'api/rest/products',
      isSortedLocally: false
    });

    this.components.doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000
    });
  }

  getFormTemplate() {
    return `
    <div class="content-box content-box_small">
        <form class="form-inline" data-elem="form">
            <div class="form-group form-group_nested">
                <label class="form-label">Sort by:</label>
                <input type="text" data-elem="filterName" class="form-control" placeholder="Product name">
            </div>
            <div class="form-group form-group_nested" data-elem="sliderContainer">
                <label class="form-label">Price:</label>
            </div>
            <div class="form-group form-group_nested">
                <label class="form-label"></label>
                <select class="form-control" data-elem="filterStatus"></select>
            </div>
        </form>
    </div>
`;
  }

  addOptionsToSelect() {
    const select = this.subElements.filterStatus;

    const options = ['Any', 'Active', 'Inactive'];
    const values = [1, 0];

    options.forEach((item, index) => {
      const option = document.createElement('option');
      option.label = item;

      if (index === 0) {
        option.selected = true;
      } else {
        option.value = values[index - 1];
        option.value = values[index - 1];
      }

      select.append(option);
    });
  }

   renderComponents() {
    const formWrapper = document.createElement('div');
    formWrapper.innerHTML = this.getFormTemplate();
    this.getSubElements(formWrapper);

    this.subElements.sliderContainer.append(this.components.doubleSlider.element);

    this.addOptionsToSelect();

    const sortableTable = this.components.sortableTable.element;

    this.element.append(formWrapper.firstElementChild);
    this.element.append(sortableTable);
  }

  debounce(fn, ms = 700) {
    if (this.isLoading) return;
    setTimeout(() => {
      fn();
      this.isLoading = false;
    }, ms);
    this.isLoading = true;
  }

  requestWithNewDoubleSliderRange(event) {
    const { from, to } = event.detail;

    this.components.sortableTable.url.searchParams.set('price_gte', from.toString());
    this.components.sortableTable.url.searchParams.set('price_lte', to.toString());

    this.components.sortableTable.sortOnServer({ leastPrice: from, greatestPrice: to });
  }

  async onInputChangeHandler(event) {
    this.components.sortableTable.url.searchParams.set('title_like', event.target.value);

    this.debounce(() => this.components.sortableTable.sortOnServer({ titleLike: event.target.value }));
  }

  onSelectClickHandler(event) {
    this.components.sortableTable.url.searchParams.set('status', event.target.value);
    this.components.sortableTable.sortOnServer({ titleLike: event.target.value });
  }

  addEventListeners() {
    this.components.doubleSlider.element.addEventListener('range-select', event => this.requestWithNewDoubleSliderRange(event));
    this.subElements.filterName.addEventListener('input', event => this.onInputChangeHandler(event));
    this.subElements.filterStatus.addEventListener('change', event => this.onSelectClickHandler(event));
    this.components.sortableTable.element.addEventListener('clear-form', () => this.clearForm());
  }

  clearForm() {
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.selectedIndex = 0;

    this.components.doubleSlider.selected.from = 0;
    this.components.doubleSlider.selected.to = 4000;

    this.components.doubleSlider.reset();
    this.components.doubleSlider.update();

    this.components.sortableTable.url.searchParams.delete('price_gte');
    this.components.sortableTable.url.searchParams.delete('price_lte');
    this.components.sortableTable.url.searchParams.delete('title_like');
    this.components.sortableTable.url.searchParams.delete('status');

    this.components.sortableTable.sortOnServer({});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  remove() {
    this.element.remove();
  }
}
