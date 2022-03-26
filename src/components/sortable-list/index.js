export default class SortableList {
  constructor({
    items = []
  } = {}) {
    this.items = items;
    this.render();
  }
  render() {
    this.element = document.createElement("ul");
    this.element.classList.add('sortable-list');
    for (const elem of this.items) {
      this.addItem(elem);
    }
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }
  onPointerDown = (event) => {
    const element = event.target.closest('.sortable-list__item');
    if (!element) return;
    if (event.target.closest('[data-grab-handle]')) {
      event.preventDefault();
      this.elMove = element;
      this.elShift = event.pageY - element.getBoundingClientRect().top;
      event.preventDefault();
      this.dragStart(element, event);
    }
    if (event.target.closest("[data-delete-handle]")) {
      this.removeItem(element);
    }
  };
  addItem(elem) {
    elem.classList.add("sortable-list__item");
    this.element.append(elem);
  }
  removeItem(element) {
    element.remove();
    this.element.dispatchEvent(new CustomEvent("sortable-list-delete", {
      bubbles: true,
      details: {
        item: element
      }
    }))
  }
  dragStart(element, {clientX, clientY}) {
    this.elementInitialIndex = [...this.element.children].indexOf(element);
    this.elShift = {
      x: clientX - element.getBoundingClientRect().x,
      y: clientY - element.getBoundingClientRect().y
    };
    this.elMove = element;
    this.placeholderElem = document.createElement("div");
    this.placeholderElem.className = "sortable-list__placeholder";
    element.style.width = element.offsetWidth + "px";
    element.style.height = element.offsetHeight + "px";
    this.placeholderElem.style.width = element.style.width;
    this.placeholderElem.style.height = element.style.height;
    element.classList.add("sortable-list__item_dragging");
    element.after(this.placeholderElem);
    this.element.append(element);
    this.moveDraggingAt(clientX, clientY);
    document.addEventListener("pointermove", this.onDocumentPointerMove);
    document.addEventListener("pointerup", this.onDocumentPointerUp);
  }
  moveDraggingAt(x, y) {
    this.elMove.style.left = x - this.elShift.x + "px";
    this.elMove.style.top = y - this.elShift.y + "px";
  }
  onDocumentPointerMove = (event) => {
    this.moveDraggingAt(event.clientX, event.clientY);
    this.elMove.style.display = 'none';
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    this.elMove.style.display = '';
    if (!elemBelow) return;
    const elFromList = elemBelow.closest('.sortable-list__item');
    if (!elemBelow.closest('.sortable-list__placeholder') && elFromList) {
      const direction = elFromList.getBoundingClientRect().top > this.placeholderElem.getBoundingClientRect().top
        ? 1 : 0;
      this.movePlaceholderAt(elFromList, direction);
    }
  };
  movePlaceholderAt(elFromList, direction) {
    direction ? elFromList.after(this.placeholderElem) : elFromList.before(this.placeholderElem);

  }
  onDocumentPointerUp = (event) => {
    this.dragStop();
  }

  dragStop () {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderElem);
    this.placeholderElem.replaceWith(this.elMove);
    this.elMove.classList.remove('sortable-list__item_dragging');
    this.elMove.style.width = '';
    this.elMove.style.height = '';
    this.elMove.style.left = '';
    this.elMove.style.top = '';
    this.placeholderElem.remove();
    document.removeEventListener("pointermove", this.onDocumentPointerMove);
    document.removeEventListener("pointerup", this.onDocumentPointerUp);
    this.elMove = null;
    if (placeholderIndex !== this.elementInitialIndex) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        detail: {
          item: this.element,
        }
      }));
    }
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener("pointermove", this.onDocumentPointerMove);
    document.removeEventListener("pointerup", this.onDocumentPointerUp);
    this.element.remove();
  }
}
