import fetchJson from '../../utils/fetch-json';
import SortableList from '../sortable-list/index';
import NotificationMessage from '../notification/index';
export default class Categories {
    constructor(data = []) {
        this.categories = data

        this.render()
    }

    appendSubcategories() {
        this.categories.map(category => {
            const elements = category.subcategories.map(subcategory => {
                const div = document.createElement('div')
                div.innerHTML = `
                    <li 
                        class="categories__sortable-list-item" 
                        data-grab-handle="" 
                        data-id="${subcategory.id}"
                    >
                        <strong>${subcategory.title}</strong>
                        <span><b>${subcategory.count}</b> products</span>
                    </li>
                `
                return div.firstElementChild
            })

            const sortableListCategoryContainer = 
                this.element.querySelector(`[data-id=${category.id}]`)
                    .lastElementChild
                    .firstElementChild

            const sortableList = new SortableList({items: elements}).element
            sortableListCategoryContainer.append(sortableList)
            sortableList.addEventListener('sortable-list-reorder', this.saveReorder)
        })
    }

    saveReorder = async (event) => {
        const {elements} = event.detail
        const newOrder = [...elements].map((element, index) => (
            {
                id: element.dataset.id,
                weight: index + 1
            }
        ))
       
        const result = await fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newOrder)
        });

        if (result) {
            new NotificationMessage(
                'Category order saved',
                {duration: 4000, type: 'success'}
            ).show()
        } else {
            new NotificationMessage(
                'Something went wrong...',
                {duration: 4000, type: 'error'}
            ).show()
        }
    }
    
    get categoriesTemplate() {
        return this.categories.map(category => (`
            <div class="category category_open" data-id="${category.id}">
                <header class="category__header">
                    ${category.title}
                </header>
                <div class="category__body">
                    <div class="subcategory-list" data-element="subcategories"></div>
                </div>
           </div>
        `)).join('')
    }

    get template() {
        return `
            <div data-elem="categoriesContainer">
                ${this.categoriesTemplate}
            </div>
        `;
      }
    
      async render() {
        const element = document.createElement('div');
    
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
    
        this.subElements = this.getSubElements(this.element);
    
        this.appendSubcategories()

        this.initEventListeners()

        return this.element;
      }
    
      getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
      }

      initEventListeners() {
        const elements = this.element.querySelectorAll('.category__header')
        for (const element of elements) {
            element.addEventListener('click', () => {
                element.parentElement.classList.toggle('category_open')
            })
        }
      }
    
      update ({headerData, bodyData}) {
        this.subElements.header.textContent = headerData;
        this.subElements.body.innerHTML = this.getColumnBody(bodyData);
      }
    
      destroy() {
        this.element.remove();
      }
}