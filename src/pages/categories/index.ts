import { INodeListOfSubElements, IPage, SubElementsType } from '../../types';
import { menu } from '../../components/sidebar/menu';
import fetchJson from '../../utils/fetch-json';
import SortableList from '../../components/sortable-list';
import { error, success } from '../../components/notification';

const SUB_CATEGORY_API_PATH = 'api/rest/subcategories';

type RequestOrderType = Array<{ id: string; weight: number }>;

class Categories implements IPage {
  element: Element | null;
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
    const categoriesElements = categories.map(category => this.getCategoryElement(category));
    // @ts-ignore
    categoriesContainer.append(...categoriesElements);
  }

  getCategoryElement({ id = '', title = '', subcategories = [] }) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class='category category_open' data-id='${id}'>
                            <header class='category__header'>${title}</header>
                            <div class='category__body'>
                              <div class='subcategory-list'></div>
                            </div>
                         </div>`;
    const items = subcategories.map(subcategory => this.getSubCategoryElement(subcategory));
    const sortableList = new SortableList({ items });
    const { element } = sortableList;
    //@ts-ignore
    wrapper.querySelector('.subcategory-list').append(element);
    return wrapper.firstElementChild;
  }

  getSubCategoryElement({ id = '', title = '', count = 0 } = {}) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<li class='categories__sortable-list-item sortable-list__item' data-grab-handle='' data-id='${id}'>
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
       </li>`;
    return wrap.firstElementChild;
  }

  loadCategories(): Promise<object[]> {
    //@ts-ignore
    const categoriesUrl = new URL(process.env['CATEGORIES_API_PATH'], process.env['BACKEND_URL']);
    return fetchJson(categoriesUrl);
  }

  collapseCategory(e: PointerEvent) {
    const element = e.target as HTMLElement;
    if (element.classList.contains('category__header')) {
      element.closest('.category')?.classList.toggle('category_open');
    }
  }

  initListeners() {
    const { categoriesContainer } = this.subElements;
    categoriesContainer.addEventListener(
      'pointerdown',
      (e: PointerEvent) => {
        this.collapseCategory(e);
      },
      true
    );
    categoriesContainer.addEventListener(SortableList.EVENT_CHANGED_ORDER, e =>
      this.changeOrder(e)
    );
  }

  async changeOrder(e: Event) {
    const list = (e.target as HTMLElement).closest('ul.sortable-list');
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
    response.length ? success('Category Order Saved') : error('Category Order Not Saved');
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
    this.element = null;
  }
}

export default Categories;
