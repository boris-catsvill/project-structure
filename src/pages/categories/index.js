import SortableList from '../../components/categories/index.js';
import fetchJson from '../../utils/fetch-json.js';
export default class Page {
    element;
    subElements = {};
    components = {};

    get template() {
        return `<div class="categories">
      <div class="content__top-panel">
        <h2 class="page-title">Categories</h2>
      </div>
      <div data-element="SortableList" class="SortableList">
      </div>
    </div>`;
    }

    async getData() {

        const CATEGORIES = `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`;

        const categories = fetchJson(CATEGORIES);
        const data = await categories;
        return data;
    }

    initComponents() {
        const categoryWrapper = this.data.map((item) => {
            return `<div class="category category_open" data-id="${item.id}" data-element="subcategoryList">
        <header class="category__header">
        ${item.title}
        </header></div>`
        }).join('');
        const categoryWrapperDiv = document.createElement('div');
        categoryWrapperDiv.innerHTML = categoryWrapper;
        this.element.append(categoryWrapperDiv);
    }

    createSubcategoryList() {
        return this.data.map((item) => {
            const newel = document.createElement('div');
            newel.innerHTML = item.subcategories.map((sub) => {
                return `<li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
        data-id="${sub.id}">
      <strong>${sub.title}</strong>
      <span><b>${sub.count}</b> products</span>
    </li>
    `
            }).join('');
            return [...newel.children];
        })
    }

    appendSubcategoryDraggableList() {
        const subcategotyListArr = this.createSubcategoryList();
        const subcategoryElementArr = this.element.querySelectorAll("[data-element='subcategoryList']");

        subcategoryElementArr.forEach((subcategoryElement, index) => {
            const sortableList = new SortableList({items: subcategotyListArr[index]});

            subcategoryElement.append(sortableList.element);
        });
    }

    renderComponents() {
        Object.keys(this.components).forEach(component => {
            const root = this.subElements[component];
            const {element} = this.components[component];

            root.append(element);
        });
    }
    initEventListeners() { }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
        this.data = await this.getData();
        this.initComponents();
        this.renderComponents();
        this.appendSubcategoryDraggableList();
        this.initEventListeners();

        return this.element;
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }

}
