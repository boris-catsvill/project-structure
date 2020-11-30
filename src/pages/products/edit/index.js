import ProductForm from "../../../components/product-form"

export default class Page {
  element
  subElements = {}
  components = {}
  productId = ''

  async render() {
    const pathname = window.location.pathname
    if (!pathname.endsWith('/add')) {
      this.productId = pathname.slice(pathname.lastIndexOf('/') + 1)
    }
    this.element = document.createElement('div')
    this.element.innerHTML = `
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / ${ (this.productId) ? 'Редактировать' : 'Добавить' }
        </h1>
      </div>
      <div data-element="productForm"></div>`

    this.subElements.productForm = this.element.querySelector('[data-element="productForm"]')
    this.initComponents()
    await this.renderComponents()
    return this.element
  }

  initComponents() {
    this.components.productForm = new ProductForm(this.productId)
  }

  async renderComponents() {
    this.subElements.productForm.append(await this.components.productForm.render())
  }

  initEventListeners() {
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}
