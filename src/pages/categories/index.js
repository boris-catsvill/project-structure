import BasicPage from '../basic-page';

/**
 * Categories page
 */
export default class extends BasicPage {

  getTemplate() {
    return `<div class='categories'>
  <div class='content__top-panel'>
    <h1 class='page-title'>Категории товаров</h1>
  </div>
  <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
  <div data-elem='categoriesContainer'><!-- Categories --></div>
</div>`;
  }
}
