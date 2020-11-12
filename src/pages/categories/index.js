import SortableList from "../../components/sortable-list"
import fetchJson from "../../utils/fetch-json";

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
    return this.element
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
      </div>
      <div data-element="categoriesContainer">
          ${this.categories.map(category => this.getCategory(category)).join('')}
      </div>
    </div>`
  }

  getCategory({id, title}) {
    return `
      <div class="category" data-id="${id}">
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
    const allLists = this.element.querySelectorAll('.subcategory-list')
    allLists.forEach((root, index) => {
      const listElements = this.categories[index].subcategories.map(item => this.getItem(item))
      const sortableList = new SortableList({items: listElements})

      root.append(sortableList.element)
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
