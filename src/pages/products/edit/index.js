/* решает какой режим по id - редактирование или сохранение */
import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification-message";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const path = window.location.pathname
    const id = path.split('/')[2]


    const productForm = new ProductForm(id !== 'add' ? id : '')
    const element = await productForm.render()
    this.element = element


    this.element.addEventListener('product-saved', event => {
      const savedMessage = new NotificationMessage("product saved!").render()
      this.element.append(savedMessage)
      setTimeout(() => savedMessage.remove(), 5000)
    });

    this.element.addEventListener('product-updated', event => {
      const updateMessage = new NotificationMessage("product updated!").render()
      this.element.append(updateMessage)
      setTimeout(() => updateMessage.remove(), 5000) 

    })

    return this.element;
  }


}
