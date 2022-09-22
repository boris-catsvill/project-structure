import BaseComponent from "../BaseComponent";
import SortableList, { SORT_LIST_ACTIONS } from "../sortable-list"

const getChildren = () => {
  const sortableList = new SortableList({ items: [] })

  return { sortableList }
}

export default class CategoryDropdown extends BaseComponent {
  category = {}
  subcategories = []

  #elementDOM = null

  toggleSlider = (event) => {
    const container = event.target.parentNode

    const classList = [...container.classList]

    if (classList.includes('category_open')) {
      container.classList.remove('category_open')
      return
    }
    container.classList.add('category_open')
  }

  onSortCategories = () => {
    const { sortableList } = this.DOMChildren
    const sortListContainer = sortableList.element
    const orderIds = [...sortListContainer.childNodes].map((item) => {
      return item.dataset.id
    })

    this.onChangeOrder(this.category.id, orderIds)
  }

  constructor({ category, subcategories, onChangeOrder }) {
    super()

    this.category = category || {}
    this.subcategories = subcategories || []
    this.onChangeOrder = onChangeOrder || (() => null)

    Object.entries(getChildren()).forEach(([key, childInstance]) => {
      this.addChildrenComponent(key, childInstance)
    })
  }

  get element() {
    return this.#elementDOM
  }

  render() {
    this.#elementDOM = this.createDOMElement(this.template())

    const { sortableList } = this.DOMChildren

    const DOMListItems = this.subcategories.map(subcategory => {
      const { id, title, count } = subcategory
      const DOMItem = this.createDOMElement(this.templateCategory(id, title, count))
      return DOMItem
    })

    sortableList.items = DOMListItems
    
    this.memoDOM.memoizeDocument(this.#elementDOM)
    this.renderDOMChildren(this.#elementDOM)
    this.initEvents()
  }

  remove() {
    this.#elementDOM.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.memoDOM.clear()
    this.removeEvents()
    this.clearChildrenComponents()
  }

  initEvents() {
    const { sortableList } = this.DOMChildren
    const { sliderHeader } = this.memoDOM.cache

    sliderHeader.addEventListener('click', this.toggleSlider)

    sortableList.element.addEventListener(
      SORT_LIST_ACTIONS.sortlist, 
      this.onSortCategories
    )
  }

  template() {
    const { title } = this.category
    return /*html*/`
      <div class="category category_open">
        <header data-memo="sliderHeader" class="category__header">
          ${title}
        </header>
        <div class="category__body">
          <div class="subcategory-list">
            <span data-mount="sortableList"></span>
          </div>
        </div>
      </div>
    `
  }

  templateCategory(id, title, count) {
    return /*html*/`
      <li 
        class="products-edit__imagelist-item sortable-list__item"
        data-draggable
        data-grab-handle
        data-id=${id}
      >
        <strong>${title}</strong>
        <span>
          <b>${count}</b>
          products
        </span>
      </li>
    `
  }
}