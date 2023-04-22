import ProductForm from '../../../components/product-form';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.id = window.location.pathname.split('/')[2];
    this.initProductForm();
    this.initEventListeners()
  }

  initEventListeners() {
    const toggleSidebar = document.querySelector('.sidebar__toggler');
    this.toggleSidebar = toggleSidebar;
    this.toggleSidebar.addEventListener('click', this.togglerSidebar);
  }
  togglerSidebar() {
    document.body.classList.toggle("is-collapsed-sidebar")
  }
  initProductForm() {
    this.components.productForm = this.id === 'add' ? new ProductForm('') : new ProductForm(this.id);
  }

  async render() {
    const element = await this.components.productForm.render();
    this.element = element

    return element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.toggleSidebar.removeEventListener('click', this.togglerSidebar);
    this.remove();
    this.element = null;
  }

}
