import Categories from '../../components/categories/index.js';

export default class Page {
    subElements;

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(element);
        this.categories();

        return this.element;
    }

    get template() {
        return `<div class="categories">
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>
            <div data-element="categoriesContainer">
            </div>
        </div>`;
    }

    categories() {
        return new Categories().element;
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
    }
}
