import SortableList from "../../components/sortable-list"
import fetchJson from "../../utils/fetch-json";
import '../../components/categories/style.css'

export default class Page {
  element = null
  components = {}
  categories = []

  async render() {
    this.categories = await this.fetchCategories()

    const element = document.createElement('div')
    element.innerHTML = this.template
    this.element = element.firstElementChild

    this.renderComponents()
    this.initEventListeners()
    return this.element
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', (e) => {
      const categoryHeader = e.target.closest('.category__header')
      if (categoryHeader) {
        categoryHeader.parentElement.classList.toggle('category_open')
      }
    })
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
      </div>
      <div data-elenet="categories">
        <div data-element="categoriesContainer">
            ${this.categories.map(category => this.getCategory(category)).join('')}
        </div>
      </div>
    </div>`
  }

  getCategory({id, title}) {
    return `
      <div class="category category_open" data-id="${id}">
        <header class="category__header">${title}</header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>`
  }

  getItem({id, title, count}) {
    let element = document.createElement('div')
    element.innerHTML = `
      <li class="categories__sortable-list-item" data-grab-handle="" data-id="${id}">
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>`
    return element.firstElementChild
  }

  renderComponents() {
    const listContainers = this.element.querySelectorAll('.subcategory-list')
    listContainers.forEach((container, index) => {
      const {subcategories} = this.categories[index]
      const listElements = subcategories.map(subcategory => this.getItem(subcategory))
      const sortableList = new SortableList({items: listElements})
      container.append(sortableList.element)
      this.components[index] = sortableList
    })
  }

  fetchCategories = () => {
    const categoriesURL = new URL('/api/rest/categories', process.env.BACKEND_URL)
    categoriesURL.searchParams.set('_sort', 'weight')
    categoriesURL.searchParams.set('_refs', 'subcategory')
    return fetchJson(categoriesURL)
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}
