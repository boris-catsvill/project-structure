import fetchJson from '../../utils/fetch-json';
import { BACKEND_URL } from '../../constants.js';
import SortableList from '../../components/sortable-list';
import NotificationMessage from '../../components/notification';

export default class Page {
  element = null;
  subElements = {};


  loadData() {
    fetchJson(`${ BACKEND_URL }/api/rest/categories?_sort=weight&_refs=subcategory`)
      .then(data => {
        this.categories = data;
        this.renderCategories();
      })
      .catch(e => {

      });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  saveOrder(items) {
    fetchJson(`${ BACKEND_URL }/api/rest/subcategories`, items)
      .then((resp) => {
        const notification = new NotificationMessage('Порядок категорий сохранён', { duration: 2 * 1000 });
        notification.show(this.element);
      })
      .catch(e => {
        //todo show error
      });
  }

  onCategoryOrderChanged = (categoryId, changedNodes) => {
    const newCategoriesMap = {};
    changedNodes.forEach((node, index) => {
      newCategoriesMap[node.dataset.categoryId] = index +1;
    });

    const prevCategory = this.categories.find(({id}) => id === categoryId);
    if (!prevCategory) {
      return;
    }

    const categoriesChanged = prevCategory.subcategories.some(({id, weight}) =>
      weight !== newCategoriesMap[id]
    );

    if(categoriesChanged) {
      const newCategoriesOrder = Object.entries(newCategoriesMap).map(([key, value]) => ({
        id: key,
        weight: value
      }))

      this.saveOrder(newCategoriesOrder);
    }
  };

  toggleCategoryPanel = (ev) => {
    const categoryContainer = ev.target.closest('.category');
    if (categoryContainer.classList.contains('category_open')) {
      categoryContainer.classList.remove('category_open');
    } else {
      categoryContainer.classList.add('category_open');
    }
  };


  renderListItem({ id, title, count, subcategories }) {
    const container = document.createElement('div');
    container.innerHTML = `
    <li class='categories__sortable-list-item' data-category-id='${ id }'>
      <div data-grab-handle class='draggableContainer'>
          <div class='categoryTitle'><strong>${ title }</strong></div>
          <div class='productsCount'><span>${ count } товаров</span></div>
      </div>
    </li>`;

    return container.firstElementChild;
  }

  renderCategories() {
    this.categories.forEach(({ id, title, count, subcategories }) => {
      const categoryContainer = document.createElement('div');
      categoryContainer.innerHTML = `
          <div class='category category_open' data-id='${ id }'>
            <header class='category__header'>${ title }</header>
            <div class='category__body'>
              <div class='subcategory-list'>
              </div>
            </div>
          </div>
      `;

      const categoryItem = categoryContainer.firstElementChild;
      const panelHeader = categoryItem.querySelector('.category__header');
      const sortableListContainer = categoryItem.querySelector('.subcategory-list');
      const listItems = subcategories.map(this.renderListItem);
      const sortableList = new SortableList({
        items: listItems, onOrderChanged: (newNodes) => {
          this.onCategoryOrderChanged(id, newNodes);
        }
      });
      sortableListContainer.append(sortableList.element);

      panelHeader.addEventListener('click', this.toggleCategoryPanel);
      this.subElements.categoriesContainer.append(categoryItem);
    });
  }

  get template() {
    return `<div class='categories'>
        <div class='content__top-panel'>
          <h2 class='page-title'>Категория товаров</h2>
        </div>
        <div data-element='categoriesContainer'>
        </div>
    </div>`;
  }

  render() {
    const container = document.createElement('div');

    container.innerHTML = this.template;
    this.element = container.firstElementChild;
    this.subElements = this.getSubElements();

    this.element.addEventListener('orderChanged', this.onCategoryOrderChanged);

    this.loadData();
    return this.element;
  }
}
