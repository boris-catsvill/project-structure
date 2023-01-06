export default class Category { 
  // events
  evntSignal; //AbortController.signal

  //rendering    
  element;
  subElements = {};
  components = {};

  onPointerDown = (event) => {
    if (event.which !== 1) {return false;}
    event.preventDefault();
    this.element.classList.toggle("category_open");
    return false; 
  }

  constructor({ item, id = 'Some_id', title = 'Some title' } = {}) {
    this.item = item;
    this.id = id;
    this.title = title;

    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubelements();
    if (this.item) {
      this.subElements.body.append(this.item);
    }
  }

  getSubelements() {
    const body = this.element.querySelector(".category_body");
    const header = this.element.querySelector(".category_header");

    return { header, body};
  }

  getTemplate() {
    return `
      <div class="category category_open" data-id="${this.id}">
      <header class="category_header"> ${this.title} </header>
      <div class="category_body"> ${this.title} </div>
      </div>`
  }

  initEventListeners() {
    this.evntSignal = new AbortController();
    const { signal } = this.evntSignal;
    
    this.subElements.header.addEventListener("pointerdown", (event) =>this.onPointerDown(event), { signal });
  }

  remove() {
    if (this.element){
      this.element.remove();
    }
  }

  destroy() {
    if (this.evntSignal) {
      this.evntSignal.abort();
    }
    this.remove();
    this.element = null;   
    for (const component of Object.values(this.components)) {
        component.destroy();
    }
  }  
}