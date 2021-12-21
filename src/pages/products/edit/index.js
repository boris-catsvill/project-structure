import ProductForm from "../../../components/product-form";
import PageComponent from '../../../utils/page';

const FORM_CREATE_MODE = 'add';

export default class Page extends PageComponent {
  fromComponent = null;

  get isEdit() {
    return this.productId !== FORM_CREATE_MODE;
  }

  get productId() {
    const [,productId] = window.location.pathname.split('/').filter(Boolean);
    return productId;
  }

  get template() {
    return (`
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / ${this.isEdit ? 'Редактировать' : 'Добавить'}
        </h1>
      </div>
      <div class="content-box" data-element="formSlot"></div>
    `);
  }

  beforeMountedPage() {
    this.renderForm();
  }

  getForm() {
    if(this.isEdit) {
      return new ProductForm(this.productId);
    }

    return new ProductForm();
  }

  async renderForm() {
    this.fromComponent = this.getForm();
    await this.fromComponent.render();
    this.subElements.formSlot.append(this.fromComponent.element);
  };
}
