/* решает какой режим по id - редактирование или сохранение */
import ProductForm from "../../../components/product-form";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const path = window.location.pathname
    const id = path.split('/')[2]


    const productForm = new ProductForm(id != 'add' ? id : '')
    const element = await productForm.render()
    this.element = element


    this.element.addEventListener('product-saved', event => {
      alert('продукт сохранен');
    });

    this.element.addEventListener('product-updated', event => {
      alert('продукт изменен');
    })

    return this.element;
  }

 
}
