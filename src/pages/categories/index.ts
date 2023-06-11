import { INodeListOfSubElements, IPage, SubElementsType } from '../../types';
import { menu } from '../../components/sidebar/menu';
import fetchJson from '../../utils/fetch-json';
import SortableList from '../../components/sortable-list';
import { errorNotice, successNotice } from '../../components/notification';
import CategoryList from '../../components/categories';

const SUB_CATEGORY_API_PATH = 'api/rest/subcategories';

type RequestOrderType = Array<{ id: string; weight: number }>;

class Categories implements IPage {
  element: Element;
  subElements: SubElementsType;
  categories: object[];

  get type() {
    return menu.categories.page;
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
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild as Element;
    this.subElements = this.getSubElements(this.element);
    this.categories = await this.loadCategories();
    this.renderCategories(this.categories);
    this.initListeners();
    return this.element;
  }

  renderCategories(categories: object[]) {
    const { categoriesContainer } = this.subElements;
    const categoriesElements: Element[] = categories.map(category => {
      const categoryList = new CategoryList(category);
      return categoryList.element;
    });
    categoriesContainer.append(...categoriesElements);
  }

  loadCategories(): Promise<object[]> {
    const categoriesUrl = new URL(
      process.env['CATEGORIES_API_PATH'] as string,
      process.env['BACKEND_URL']
    );
    return fetchJson(categoriesUrl);
  }

  initListeners() {
    this.element.addEventListener(SortableList.EVENT_CHANGED_ORDER, e => this.changeOrder(e));
  }

  async changeOrder(e: Event) {
    const list = (e.target as HTMLElement).closest('ul.sortable-list');
    const { categoriesContainer } = this.subElements;
    if (!categoriesContainer.contains(list)) return;

    const items = list?.querySelectorAll('li') || [];
    const updateUrl = new URL(SUB_CATEGORY_API_PATH, process.env['BACKEND_URL']);

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

  getSubElements(element: Element) {
    const elements: INodeListOfSubElements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      const elementName = el.dataset.element;
      acc[elementName] = el;
      return acc;
    }, {} as SubElementsType);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}

export default Categories;
