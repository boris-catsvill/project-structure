export default class SortableList {
  element;
  dragElement;
  placeholder;

  onPointerDown = (event) => { 
    const element = event.target.closest('.sortable-list__item');
    if(!element) return;

    event.preventDefault();
    if(event.target.closest('[data-delete-handle]')) this.removeItem(element);
    if(event.target.closest('[data-grab-handle]')) this.startGrabbing(event, element);
  }

  onPointerUp = () => {
    const finalPlaceholderPosition = [...this.element.children].indexOf(this.placeholder);

    this.placeholder.replaceWith(this.dragElement);
    
    this.dragElement.classList.remove("sortable-list__item_dragging");
    this.dragElement.style.removeProperty("left");
    this.dragElement.style.removeProperty("top");
    this.dragElement.style.removeProperty("width");
    this.dragElement.style.removeProperty("height");

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);

    if(this.initialPlaceholderPosition !== finalPlaceholderPosition) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {bubbles: true}));
    }
  }

  onPointerMove = (event) => {
    this.moveDraggingElement(event.clientX, event.clientY);

    this.dragElement.style.visibility = 'hidden';
    const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    const listElement = elemBelow.closest("li:not(.sortable-list__placeholder)");
    this.dragElement.style.visibility = 'visible';
    if(!listElement || !this.element.contains(listElement)) return;

    if (this.dragElement !== listElement) {
      this.dragElement.getBoundingClientRect().top > listElement.getBoundingClientRect().top ?
      listElement.before(this.placeholder) :
      listElement.after(this.placeholder);
    }
  }

  constructor({items}) {
    this.items = items;

    this.render();
    this.initEventListeners();
  }

  moveDraggingElement(shiftX, shiftY) {
    this.dragElement.style.left = `${shiftX - this.pointerGrabOffset.left}px`;
    this.dragElement.style.top = `${shiftY - this.pointerGrabOffset.top}px`;     
  }

  startGrabbing(event, listElement) {
    this.pointerGrabOffset =  {
      left: event.clientX - listElement.getBoundingClientRect().left,
      top: event.clientY - listElement.getBoundingClientRect().top
    };

    this.setupDragElement(listElement);
    this.moveDraggingElement(event.clientX, event.clientY);
    this.addPlaceholder(listElement);
  }

  setupDragElement(listElement) {
    this.dragElement = listElement;
    this.dragElement.style.width = listElement.offsetWidth + "px",
    this.dragElement.style.height = listElement.offsetHeight + "px",

    this.dragElement.classList.add("sortable-list__item_dragging");

    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);  
  }

  addPlaceholder(listElement) {
    this.placeholder = document.createElement("div");
    this.placeholder.className = "sortable-list__placeholder";
    this.placeholder.style.width = listElement.style.width;
    this.placeholder.style.height = listElement.style.height;

    listElement.after(this.placeholder);
    this.initialPlaceholderPosition = [...this.element.children].indexOf(this.placeholder);
  }

  render() {
    this.element = document.createElement("ul"),
    this.element.className = "sortable-list";
    this.items.map(listElement => this.addItem(listElement));
  }

  initEventListeners() {
    this.element.addEventListener("pointerdown", this.onPointerDown);
  }

  addItem(listElement) {
    listElement.classList.add("sortable-list__item");
    this.element.append(listElement);
  }

  removeItem(listElement) {
    listElement.remove();
  }

  remove() {
    if(this.element) {
      this.element.remove();  
    }
  }
    
  destroy() {
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);

    this.remove();
    this.element = null;
  }
}