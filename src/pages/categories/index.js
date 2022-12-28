import BasicPage from '../basic-page';
import Category from '../../components/categories';
import fetchJson from '../../utils/fetch-json';
import escapeHtml from '../../utils/escape-html';
import NotificationMessage from '../../components/notification';

const BACKEND_URL = 'https://course-js.javascript.ru';

/**
 * Categories page
 */
export default class extends BasicPage {

  async render() {
    await super.render();

    /** @type {Array<Object>} */
    const categories = await fetchJson(new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL));

    this.subElements.categoriesContainer.append(...categories.map(category => {
      return new Category({
        id: category.id,
        title: category.title,
        subItems: category.subcategories,
        itemTemplate: item => `<strong>${escapeHtml(item.title)}</strong> <span><b>${item.count}</b> товаров</span>`
      }).element;
    }));

    // Сохранение порядка
    this.subElements.categoriesContainer.addEventListener('sortable-list-reorder', async (event) => {
      const categoriesOrdered = [...event.target.querySelectorAll('[data-id]')]
        .map((el, index) => {
          return { id: el.dataset.id, weight: index + 1 };
        });

      await fetchJson(new URL('api/rest/subcategories', BACKEND_URL), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoriesOrdered)
      });

      const notification = new NotificationMessage('Порядок категорий сохранён', { type: 'success' });
      notification.show();
    });

    return this.element;
  }

  getTemplate() {
    return `<div class='categories'>
  <div class='content__top-panel'>
    <h1 class='page-title'>Категории товаров</h1>
  </div>
  <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
  <div data-element='categoriesContainer'><!-- Categories --></div>
</div>`;
  }
}
