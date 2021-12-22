import PageComponent from "../../../utils/page";
import SortableTable from "../../../components/sortable-table";
import ProductsFilters from "../../../components/filters";

import header from "./products-header";

export default class ProductsPage extends PageComponent {
  url = new URL(`${process.env.BACKEND_URL}api/rest/products`);

  get components() {
    return {
      sortableTable: SortableTable,
      productsFilters: ProductsFilters
    }
  }

  get template() {
    return (`
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small" data-element="productsFilters"></div>
        <div class="products-list__container" data-element="sortableTable"></div>
      <div>
    `)
  }

  initComponents() {
    const { url } = this;
    const SortableTable = this.getComponentByName('sortableTable');
    const ProductsFilters = this.getComponentByName('productsFilters');

    const sortableTable = new SortableTable(header, {
      url,
      hasInfinityScroll: true,
      hasRowClicked: true,
      queryParams: {'_embed': 'subcategory.category'}
    })

    const productsFilters = new ProductsFilters();

    this.instanceComponents = {
      sortableTable,
      productsFilters
    };

  }

  getBaseQuerySearchParams() {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
  }

  initEventListeners() {
    this.element.addEventListener('change-input-filter', this.listenChangeInputValue);
    this.element.addEventListener('change-status-filter', this.listenChangeStatusValue);
    this.element.addEventListener('range-select', this.listenChangeSlider);
    this.element.addEventListener('clear-filter', this.handleClearFilter);
  }

  removeEventListeners() {
    this.element.removeEventListener('change-input-filter', this.listenChangeInputValue);
    this.element.removeEventListener('change-status-filter', this.listenChangeStatusValue);
    this.element.removeEventListener('range-select', this.listenChangeSlider);
    this.element.addEventListener('clear-filter', this.handleClearFilter);
  }

  handleClearFilter = () => {
    const { doubleSlider: { setInitalState } } = this.instanceComponents.productsFilters;
    this.instanceComponents.productsFilters.getChildElementByName('filterName').value = '';
    this.instanceComponents.productsFilters.getChildElementByName('filterStatus').value = '';

    setInitalState({ from: 0, to: 4000 });
    this.clearAllQueryParams();
  }

  async clearAllQueryParams() {
    this.url.searchParams.delete('status');
    this.url.searchParams.delete('title_like');
    this.url.searchParams.set('price_gte', 0);
    this.url.searchParams.set('price_lte', 4000);
    
    this.instanceComponents.sortableTable.deleteUrl('status');
    this.instanceComponents.sortableTable.deleteUrl('title_like');
    this.instanceComponents.sortableTable.updateUrl({'price_gte': 0, 'price_lte': 4000 });

    await this.updateTableData();
  }

  async updateTableData() {
    const data = await this.loadData();
    this.instanceComponents.sortableTable.update(data);
  }

  listenChangeStatusValue = async ({detail}) => {
    const { status } = detail;

    if(status) {
      this.url.searchParams.set('status', status);
      this.instanceComponents.sortableTable.updateUrl({'status': status});
    } else {
      this.url.searchParams.delete('status');
      this.instanceComponents.sortableTable.deleteUrl('status');
    }

    await this.updateTableData();
  }

  listenChangeSlider = async ({detail}) => {
    const { from, to } = detail;

    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);
    this.instanceComponents.sortableTable.updateUrl({'price_gte': from, 'price_lte': to });

    await this.updateTableData();
  }

  listenChangeInputValue = async ({ detail }) => {
    const { value } = detail;

    if(value) {
      this.url.searchParams.set('title_like', value);
      this.instanceComponents.sortableTable.updateUrl({'title_like': value});
    } else {
      this.url.searchParams.delete('title_like');
      this.instanceComponents.sortableTable.deleteUrl('title_like');
    }

    this.updateTableData();
  }

  async loadData() {
    this.getBaseQuerySearchParams();
    return await this.fetchJson(this.url);
  }
}
