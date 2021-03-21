import SortableList from '../sortable-list/index.js';

export default class Categories {
    constructor(category) {
        this.category = category;

        this.render();
    }

    getCategoryList(id, title) {
        return `
            <div class="category category_open" data-id="${id}">
                <header class="category__header">${title}</header>
                <div class="category__body">
                    <div class="subcategory-list"></div>
                </div>
            </div>
        `;
    }

    getCategory({id, title, count}) {
        return `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${id}">
            <strong>${title}</strong>
            <span><b>${count}</b> products</span>
        </li>
        `;
    }

    createSubcategories(subcategories) {
        const sortableList = new SortableList({
            items: subcategories.reduce((memo, item) => {
                const element = document.createElement('li');

                element.innerHTML = this.getCategory(item);
                memo.push(element.firstElementChild);

                return memo;
              }, []),
        });

        const subcategoryList = this.element.querySelector('.subcategory-list');
        subcategoryList.append(sortableList.element);
    }

    render() {
        const element = document.createElement('div');
        const {id, title, subcategories} = this.category;

        element.innerHTML = this.getCategoryList(id, title);
        this.element = element.firstElementChild;
        this.createSubcategories(subcategories);
    }

    remove() {
        this.element.remove();
    }
    
    destroy() {
        this.remove();
    }
}