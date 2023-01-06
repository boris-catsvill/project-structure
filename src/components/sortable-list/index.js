/* eslint-disable no-unused-expressions */
export default class SortableList {

  //rendering
  element;
  draggingElem;
  placeholderElem;

  // events
  evntSignal; //AbortController.signal

  onDocumentPointerMove = (event) => {
    this.moveDraggingAt(event.clientX, event.clientY);
    if (event.clientY < this.element.firstElementChild.getBoundingClientRect().top) { 
      this.movePlaceholderAt(0);
    } else if (event.clientY > this.element.lastElementChild.getBoundingClientRect().bottom) {
      this.movePlaceholderAt(this.element.children.length);
    } else {
      for (let t = 0; t < this.element.children.length; t++) {
        let listElem = this.element.children[t];
        if (listElem !== this.draggingElem && 
          (event.clientY > listElem.getBoundingClientRect().top 
            && event.clientY < listElem.getBoundingClientRect().bottom)) {
          if (event.clientY < listElem.getBoundingClientRect().top 
              + listElem.offsetHeight / 2) {
            this.movePlaceholderAt(t);
            break;
          }
          this.movePlaceholderAt(t + 1);
          break;
        }
      }
    }
    this.scrollIfCloseToWindowEdge(event);
  }

  onDocumentPointerUp = () => {
    this.dragStop();
  }

  onPointerDown = (event) => {
    if (event.which !== 1) {return false;}
    const target = event.target.closest(".sortable-list__item");
  
    if (!target) {return;}
    const target2 = event.target.closest("[data-grab-handle]");
    if (!!target2) {
      event.preventDefault();
      this.dragStart(target, event); 
      return;
    } 
    const target3 = event.target.closest("[data-delete-handle]");
    if (target3) {
      event.preventDefault(), this.removeItem(target); 
      return;
    } 
  }

  constructor({
    items = [] } = { }) {
    this.items = items;    
    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement("div");
    
    element.innerHTML = this.getTemplate();
      
    this.element = element.firstElementChild;
    for (let itm of this.items) {
      this.addItem(itm);
    }    
  }

  addItem(itm) {
    itm.classList.add("sortable-list__item");
    this.element.append(itm);
  }
  
  removeItem(itm) {
    itm.remove();
    this.element.dispatchEvent(new CustomEvent("sortable-list-delete", {
      bubbles: !0,
      detail: {
        item: itm
      }
    }));
  }

  dragStart(elem, {clientX: t, clientY: i}) {
    this.elementInitialIndex = [...this.element.children].indexOf(elem);
    this.pointerInitialShift = {
      x: t - elem.getBoundingClientRect().x,
      y: i - elem.getBoundingClientRect().y
    };
    this.draggingElem = elem;
    this.placeholderElem = document.createElement("div");
    this.placeholderElem.className = "sortable-list__placeholder";
    elem.style.width = elem.offsetWidth + "px";
    elem.style.height = elem.offsetHeight + "px";

    this.placeholderElem.style.width = elem.style.width;
    this.placeholderElem.style.height = elem.style.height;
    elem.classList.add("sortable-list__item_dragging");

    elem.after(this.placeholderElem);
    this.element.append(elem);
    this.moveDraggingAt(t, i);

    const { signal } = this.evntSignal;
    document.addEventListener("pointermove", this.onDocumentPointerMove, { signal });
    document.addEventListener("pointerup", this.onDocumentPointerUp, { signal });
  }

  moveDraggingAt(left, top) {
    this.draggingElem.style.left = left - this.pointerInitialShift.x + "px";
    this.draggingElem.style.top = top - this.pointerInitialShift.y + "px";
  }

  scrollIfCloseToWindowEdge(event) {
    if (event.clientY < 20) {
      window.scrollBy(0, -10);
    } else if (event.clientY > document.documentElement.clientHeight - 20) {
      window.scrollBy(0, 10);
    }
  }

  movePlaceholderAt(index) {
    if (this.element.children[index] !== this.placeholderElem) {
      this.element.insertBefore(this.placeholderElem, this.element.children[index]);
    }
  }

  dragStop() {
    let elemIndex = [...this.element.children].indexOf(this.placeholderElem);
    this.placeholderElem.replaceWith(this.draggingElem);
    this.draggingElem.classList.remove("sortable-list__item_dragging");
    this.draggingElem.style.left = "";
    this.draggingElem.style.top = "";
    this.draggingElem.style.width = "";
    this.draggingElem.style.height = "";

    document.removeEventListener("pointermove", this.onDocumentPointerMove);
    document.removeEventListener("pointerup", this.onDocumentPointerUp);
    this.draggingElem = null;
    if (elemIndex !== this.elementInitialIndex) {
      this.element.dispatchEvent(new CustomEvent("sortable-list-reorder", {
        bubbles: !0,
        detail: {
          from: this.elementInitialIndex,
          to: elemIndex
        }
      }));
    }
  }

  getTemplate() {
    return `<ul class="sortable-list"></ul>`;
  }

  initEventListeners() {
    this.evntSignal = new AbortController();
    const { signal } = this.evntSignal;

    this.element.addEventListener("pointerdown", (event) =>this.onPointerDown(event), { signal });
  }
        
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
        
  destroy() {
    if (this.evntSignal) {
      this.evntSignal.abort();
    }        
    this.remove();
    this.element = null;
  }   
}
