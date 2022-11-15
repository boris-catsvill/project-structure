import DoubleSlider from '../../../components/double-slider';

export default class Page {

  constructor() {
    this.controller = new AbortController();
    this.render();
  }

  render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();

    this.element = div.firstElementChild;

    this.initComponents();

    return this.element;
  }

  initComponents() {
    this.doubleSlider = new DoubleSlider({
      min: 100,
      max: 200,
      formatValue: value => '$' + value,
      selected: {
        from: 100,
        to: 200
      }
    });
    this.element.querySelector('[data-elem="sliderContainer"]').append(this.doubleSlider.element)
  }

  getTemplate() {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Цена:</label>
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>`
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.controller.abort();
    this.components = {};

  }
}
