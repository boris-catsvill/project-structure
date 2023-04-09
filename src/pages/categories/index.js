import PageComponent from '../page';
import Category from '../../components/categories';
import fetchJson from '../../utils/fetch-json.js';
import NotificationMessage from '../../components/notification';

export default class Page extends PageComponent {
  categoryComponents = [];

  get template() {
    return `
      <div class='categories'>
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element='categoriesContainer'></div>
      </div>
    `;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    const categories = await this.getCategories();

    for (const category of categories) {
      const categoryComponent = new Category(category);
      this.categoryComponents.push(categoryComponent);
      this.subElements.categoriesContainer.append(categoryComponent.element);
    }

    this.initEventListeners();
    return this.element;
  }

  async getCategories() {
    const url = new URL(`${this.backendUrl}/api/rest/categories`);
    url.searchParams.append('_sort', 'weight');
    url.searchParams.append('_refs', 'subcategory');

    return await fetchJson(url);
  }

  async initComponents() {

  }

  renderComponents() {

  }

  initEventListeners() {
    this.element.addEventListener('subcategories-reorder', async (event) => {
      await fetchJson(new URL('/api/rest/subcategories', this.backendUrl), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event.detail)
      });

      const notification = new NotificationMessage('Порядок категорий сохранен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    });
  }

  destroy() {
    this.categoryComponents.forEach(component => {
      component.destroy();
    });
  }
}
