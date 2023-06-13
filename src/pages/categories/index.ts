import { Menu } from '../../components/sidebar/menu';
import fetchJson from '../../utils/fetch-json';
import { errorNotice, successNotice } from '../../components/notification';
import CategoryList from '../../components/categories';
import { BasePage } from '../../base-page';
import { IPage } from '../../types/base';
import { API_ROUTES, CUSTOM_EVENTS } from '../../constants';

type RequestOrderType = Array<{ id: string; weight: number }>;

class Categories extends BasePage implements IPage {
  categories: object[];

  get type() {
    return Menu.categories.page;
  }

  get template() {
    return `<div class='categories'>
              <div class='content__top-panel'>
                <h1 class='page-title'>Product categories</h1>
              </div>
              <p>Subcategories can be dragged and dropped to change their order within their category.</p>
              <div data-element='categoriesContainer'></div>
            </div>`;
  }

  async render() {
    super.render();
    this.categories = await this.loadCategories();
    this.renderCategories(this.categories);
    this.initListeners();
    return this.element;
  }

  renderCategories(categories: object[]) {
    const { categoriesContainer } = this.subElements;
    const categoriesElements: Element[] = categories.map((category, index) => {
      const categoryList = new CategoryList(category, index === 0);
      return categoryList.element;
    });
    categoriesContainer.append(...categoriesElements);
  }

  loadCategories(): Promise<object[]> {
    const categoriesUrl = new URL(API_ROUTES.CATEGORIES, process.env['BACKEND_URL']);
    return fetchJson(categoriesUrl);
  }

  initListeners() {
    this.element.addEventListener(CUSTOM_EVENTS.ChangedOrder, e => this.changeOrder(e));
  }

  async changeOrder(e: Event) {
    const list = (e.target as HTMLElement).closest('ul.sortable-list');
    const { categoriesContainer } = this.subElements;
    if (!categoriesContainer.contains(list)) return;

    const items = list?.querySelectorAll('li') || [];
    const updateUrl = new URL(API_ROUTES.SUB_CATEGORY, process.env['BACKEND_URL']);

    const data = [...items].reduce((acc: RequestOrderType, item, index) => {
      const weight = index + 1;
      const { id = '' } = item.dataset;
      const order = { id, weight };
      return [...acc, order];
    }, []);

    const response = await fetchJson(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    response.length
      ? successNotice('Category Order Saved')
      : errorNotice('Category Order Not Saved');
  }
}

export default Categories;
