import BasicPage from '../../basic-page';
import SortableTable from '../../../components/sortable-table';
import header from '../products-header';
import DoubleSlider from '../../../components/double-slider';
import { currencyFormat } from '../../../utils/formatters';

/**
 * Product list page
 */
export default class extends BasicPage {

  initComponents() {
    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products?_embed=subcategory.category',
      sorted: { id: 'title', order: 'asc' }
    });

    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 5000,
      formatValue: value => currencyFormat(value)
    });

    this.components = { sortableTable, doubleSlider };

    /* Обработчики событий */
    let inputTimer = -1;

    this.subElements.filterName.addEventListener('input', event => {
      // Добавлена задержка, чтобы не отправлять слишком много запросов на каждый символ
      clearTimeout(inputTimer);

      inputTimer = setTimeout(() => {
        this.setProductFilters({ 'title_like': event.target.value });
      }, 150);
    });

    this.subElements.filterStatus.addEventListener('change', event => {
      this.setProductFilters({ 'status': event.target.value });
    });

    this.rangeSelectHandler = (event) => {
      const { from, to } = event.detail;
      this.setProductFilters({ 'price_gte': from, 'price_lte': to });
    };
    this.element.addEventListener('range-select', this.rangeSelectHandler);
  }

  /**
   * Задаёт фильтры поиска товаров и обновляет таблицу
   * @param {Object<String, any>} filters
   */
  setProductFilters(filters = {}) {
    /** @type {SortableTable} */
    const sortableTable = this.components.sortableTable;

    for (const [field, value] of Object.entries(filters)) {
      sortableTable.url.searchParams.set(field, value);
    }

    sortableTable.offset = 0;
    sortableTable.fetchData();
  }

  destroy() {
    this.element.removeEventListener('range-select', this.rangeSelectHandler);
    super.destroy();
  }

  getTemplate() {
    return `<div class='products-list'>
  <div class='content__top-panel'>
    <h1 class='page-title'>Товары</h1>
    <a href='/products/add' class='button-primary'>Добавить товар</a>
  </div>
  <div class='content-box content-box_small'>
    <form class='form-inline'>
      <div class='form-group'>
        <label class='form-label'>Сортировать по:</label>
        <input type='text' data-element='filterName' class='form-control' placeholder='Название товара'>
      </div>
      <div class='form-group' data-element='doubleSlider'>
        <label class='form-label'>Цена:</label>
        <!-- DoubleSlider -->
      </div>
      <div class='form-group'>
        <label class='form-label'>Статус:</label>
        <select class='form-control' data-element='filterStatus'>
          <option value='' selected=''>Любой</option>
          <option value='1'>Активный</option>
          <option value='0'>Неактивный</option>
        </select>
      </div>
    </form>
  </div>
  <div data-element='sortableTable' class='products-list__container'><!-- SortableTable --></div>
</div>`;
  }
}
