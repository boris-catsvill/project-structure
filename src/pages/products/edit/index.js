import ProductForm from '../../../components/product-form/index.js';

const IMGUR_CLIENT_ID = `${process.env.IMGUR_CLIENT_ID}`;
const BACKEND_URL = `${process.env.BACKEND_URL}`; 

export default class Page {
    element;
    subElements = {};
    components = {};

    constructor(productId) {
        this.productId = productId;
  }
  
  initComponents() {
        
        const productForm =  new ProductForm(this.productId);

        this.components = {
            productForm
        };
    }

    async randerComponents() {
        const root = this.element.querySelector('[data-element]');
        const renderForm = await this.components.productForm.render();
        root.append(renderForm);
    }


    get template() {
        return ` 
             <div class="products-edit">
              <div class="content__top-panel">
                <h1 class="page-title">
                  <a href="/products" class="link">Товары</a> / Редактировать
                </h1>
              </div>
              <div  data-element="productForm"></div>
            </div>`
           
    }
     render() {
        
        this.element = document.createElement('div'); // (*)
        this.element.innerHTML = this.template;
        this.element = this.element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        this.randerComponents() ;
        return this.element;
     }

     getSubElements(element) {
         const elements = element.querySelectorAll('[data-element]');
         return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
            return accum;
        }, {});
     }

      remove () {
        if (this.element) {
            this.element.remove();
        }
     }

      destroy() {
        this.remove();
        for(let component in this.components) {
            this.components[component].destroy();
        }
        this.element = null;
        this.subElements = {};
      }

}
