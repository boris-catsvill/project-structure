export default class SortableList {
  abortController = new AbortController();
  draggingElement;
  initShift;
  placeholderElement;
  element;

  constructor({items}) {
    this.items = items;
    this.render();
  }

  render() {
    this.element = this.getTemplate();
    this.addEventListeners();
  }

  addEventListeners() {
    this.element.addEventListener(
      'pointerdown',
      this.onPointerDown,
      this.abortController.signal
    );
  }

  getTemplate() {
    const ul = document.createElement('ul');
    ul.classList.add('sortable-list');
    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
      ul.append(item);
    });
    return ul;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.abortController.abort();
    this.draggingElement = null;
    this.initShift = null;
    this.placeholderElement = null;
    this.element = null;
  }

  onPointerDown = event => {
    const grabElement = event.target.closest('[data-grab-handle]');
    if (grabElement) {
      event.preventDefault();
      event.ondragstart = () => {
        return false;
      };
      this.draggingElement = grabElement.closest('li');
      this.elementInitialIndex = [...this.element.children].indexOf(this.draggingElement);
      this.dragStart(event);
      return;
    }
    const deleteElement = event.target.closest('[data-delete-handle]');
    if (deleteElement) {
      const deletingElement = deleteElement.closest('li');
      deletingElement.remove();
    }
  };

  dragStart({clientX, clientY}) {
    const element = this.draggingElement;
    this.initShift = {
      x: clientX - element.getBoundingClientRect().x,
      y: clientY - element.getBoundingClientRect().y
    };
    element.style.width = element.offsetWidth + "px";
    element.style.height = element.offsetHeight + "px";
    element.classList.add("sortable-list__item_dragging");

    this.makePlaceHolder(element);
    element.before(this.placeholderElement);
    this.element.append(element);
    this.moveAt(element, clientY);

    document.addEventListener(
      "pointermove",
      this.onDocumentPointerMove,
      this.abortController.signal
    );
    document.addEventListener(
      "pointerup",
      this.onDocumentPointerUp,
      this.abortController.signal
    );
  }

  makePlaceHolder(element) {
    this.placeholderElement = document.createElement("div");
    this.placeholderElement.className = "sortable-list__placeholder";
    this.placeholderElement.style.width = element.style.width;
    this.placeholderElement.style.height = element.style.height;
  }

  moveAt(clientX, clientY) {
    this.draggingElement.style.left = clientX - this.initShift.x + "px";
    this.draggingElement.style.top = clientY - this.initShift.y + "px";
  }

  onDocumentPointerMove = ({clientX, clientY}) => {
    this.moveAt(clientX, clientY);
    if (clientY < this.element.firstElementChild.getBoundingClientRect().top) {
      this.movePlaceholderBefore(0);
      return;
    }
    if (clientY > this.element.lastElementChild.getBoundingClientRect().bottom) {
      this.movePlaceholderBefore(this.element.children.length);
      return;
    }
    for (let index = 0; index < this.element.children.length; index++) {
      const item = this.element.children[index];
      const moveInItem = clientY > item.getBoundingClientRect().top && clientY < item.getBoundingClientRect().bottom;
      if (this.draggingElement !== item && moveInItem) {
        if (clientY < item.getBoundingClientRect().top + item.offsetHeight / 2) {
          this.movePlaceholderBefore(index);
          break;
        }
        this.movePlaceholderBefore(index + 1);
        break;
      }
    }
  };

  movePlaceholderBefore(index) {
    const currentItem = this.element.children[index];
    if (currentItem === this.placeholderElement) {
      return;
    }
    currentItem.before(this.placeholderElement);
  }

  onDocumentPointerUp = () => {
    this.dragStop();
  };

  dragStop() {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);

    const draggingElem = this.draggingElement;
    this.placeholderElement.replaceWith(draggingElem);
    draggingElem.classList.remove("sortable-list__item_dragging");
    draggingElem.style.left = "";
    draggingElem.style.top = "";
    draggingElem.style.width = "";
    draggingElem.style.height = "";
    document.removeEventListener("pointermove", this.onDocumentPointerMove);
    document.removeEventListener("pointerup", this.onDocumentPointerUp);
    this.draggingElement = null;

    if (placeholderIndex !== this.elementInitialIndex) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        detail: {
          from: this.elementInitialIndex,
          to: placeholderIndex
        }
      }));
    }
  }
}
