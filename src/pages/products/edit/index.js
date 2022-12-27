import BasicPage from '../../basic-page';

/**
 * Product edit page
 */
export default class extends BasicPage {

  getTemplate() {
    return `<div class='products-edit'>
  <div class='content__top-panel'>
    <h1 class='page-title'>
      <a href='/products' class='link'>Товары</a> &rsaquo; Добавить
    </h1>
  </div>
  <div class='content-box'><!-- ProductForm --></div>
</div>`;
  }
}
