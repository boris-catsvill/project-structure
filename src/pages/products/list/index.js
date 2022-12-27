import BasicPage from '../../basic-page';

/**
 * Product list page
 */
export default class extends BasicPage {

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
        <input type='text' data-elem='filterName' class='form-control' placeholder='Название товара'>
      </div>
      <div class='form-group' data-elem='sliderContainer'>
        <label class='form-label'>Цена:</label>
        <div class='range-slider'><!-- RangeSlider --></div>
      </div>
      <div class='form-group'>
        <label class='form-label'>Статус:</label>
        <select class='form-control' data-elem='filterStatus'>
          <option value='' selected=''>Любой</option>
          <option value='1'>Активный</option>
          <option value='0'>Неактивный</option>
        </select>
      </div>
    </form>
  </div>
  <div data-elem='productsContainer' class='products-list__container'></div>
</div>`;
  }
}
