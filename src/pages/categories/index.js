import { categoriesState, CATEGORY_STATE_ACTIONS } from '../../state/CategoriesEventState'
import NotificationMessage from '../../components/notification'
import BaseComponent from '../../components/BaseComponent'
import CategoryDropdown from '../../components/category-dropdown'

export default class extends BaseComponent {
  #elementDOM = null

  onUpdeteOrderSuccess = () => {
    const notification = new NotificationMessage(
      'Новый порядок сохранен', 
      {
        duration: 2000,
        type: 'success'
      }
    )

    notification.show()
  }

  onUpdateOrderFail = () => {
    const notification = new NotificationMessage(
      'Не удалось сохранить порядок', 
      {
        duration: 2000,
        type: 'error'
      }
    )

    notification.show()
  }

  renderCategories = () => {
    const { categoriesContainer } = this.memoDOM.cache
    const { categoriesList, subcategoriesMap } = categoriesState

    categoriesList.forEach(category => {
      if (!category) return
      const subcategories = subcategoriesMap[category.id]

      const categorySlider = new CategoryDropdown({
        category,
        subcategories,
        onChangeOrder: categoriesState.updateSubcategoriesOrder.bind(categoriesState)
      })

      categorySlider.render()

      categoriesContainer.append(categorySlider.element)
    })
  }

  constructor() {
    super()
  }

  get element() {
    return this.#elementDOM
  }

  async render() {
    this.#elementDOM = this.createDOMElement(this.template())

    this.initEvents()
    this.memoDOM.memoizeDocument(this.#elementDOM)

    await categoriesState.updateCategories({
      _sort: 'weight',
      _refs: 'subcategory'
    })
  }

  remove() {
    this.#elementDOM.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.memoDOM.clear()
    this.removeEvents()
    categoriesState.clearState()
    this.clearChildrenComponents()
  }

  initEvents() {
    categoriesState.on(CATEGORY_STATE_ACTIONS.updateCategories, this.renderCategories)
    categoriesState.on(
      CATEGORY_STATE_ACTIONS.updateCategoriesOrderSucess, 
      this.onUpdeteOrderSuccess
    )
    categoriesState.on(
      CATEGORY_STATE_ACTIONS.updateCategoriesOrderFail, 
      this.onUpdateOrderFail
    )
  }

  removeEvents() {
    categoriesState.removeListener(
      CATEGORY_STATE_ACTIONS.updateCategories,
      this.renderCategories
    )
  }

  template() {
    return /*html*/`
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        
        <p>
          Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.
        </p>

        <div data-memo="categoriesContainer">

        </div>
      </div>
    `
  }
}