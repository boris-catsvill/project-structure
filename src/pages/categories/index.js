import SortableList from '../../components/sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Categories {

    constructor() {
        this.components = {};
    }

    async getCategoriesData() {
        this.categories = await fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
    }

    initComponents() {
        this.categories.map(category => {
            this.components[category.id] = new SortableList(getObjectWithArrOfLiElement(category.subcategories));
        })

        function getObjectWithArrOfLiElement(object) {
            const liArray = object.reduce((accum, current) => {
                const liElement = document.createElement('li');
                liElement.setAttribute('data-grab-handle', '');
                liElement.textContent = current.title;
                accum.push(liElement);

                return accum;
            }, []);

            const result = {
                items: liArray
            }

            return result;
        }
    }

    getTemplate() {
        const categoriesElement = this.categories.reduce((accum, category) => {
            accum.push(this.createCategory(category));
            return accum;
        }, []).join('');

        return `<div class="class="categories">
                    <div class="content__top-panel">
                        <h1 class="page-title">Категории товаров</h1>
                    </div>
                    <div data-element="categoriesContainer">
                        ${categoriesElement}
                    </div>
                </div>`
    }

    createCategory(element) {
        return `<div class="category category_open" data-id=${element.id}>
                    <header class="category__header">
                        ${element.title}
                    </header>
                    <div class="category__body">
                        <div data-element=${element.id} class="subcategory-list">
                            
                        </div>
                    </div>
                </div>`
    }

    async render() { // Улучшить!
        await this.getCategoriesData();
        this.initComponents();

        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.subElements = this.getSubElements(wrapper);

        Object.keys(this.components).forEach(component => {
            this.subElements[component].append(this.components[component].element);
        })

        this.element = wrapper.firstElementChild;
        return this.element;
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        for (const key in this.components) {
            this.components[key].destroy();
        }
    }

    // -------------------------- Utils Methods --------------------------
    getSubElements(element) {
        const result = {};

        const elements = element.querySelectorAll('[data-element]');
        elements.forEach(el => {
            result[el.dataset.element] = el;
        });

        return result;
    }
}
