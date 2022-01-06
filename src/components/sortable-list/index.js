export default class SortableList {
  element;
  positionShift = 5;
  draggingElement;
  placeholderElement;
  diffTop;
  diffLeft;

  constructor(items = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');

    const {items} = this.items;
    items.forEach(item => item.classList.add('sortable-list__item'));

    for (const item of items) {
      this.element.append(item);
    }

    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = (event) => {
    event.preventDefault();

    if (event.target.closest('[data-grab-handle]')) {
      this.onDragItem(event);
    }

    if (event.target.closest('[data-delete-handle]')) {
      this.onDeleteItem(event.target);
    }
  }

  onDragItem(event) {
    const {clientX, clientY} = event;

    this.draggingElement = event.target.closest('.sortable-list__item');

    this.modifyDraggingElement(clientX, clientY);
    this.insertPlaceholderItem();

    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointermove', this.onPointerMove);
  }

  onPointerUp = () => {
    this.placeholderElement.replaceWith(this.draggingElement);
    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.draggingElement.removeAttribute('style');

    this.placeholderElement = null;
    this.draggingElement = null;

    this.dispatchEvent();
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerMove = (event) => {
    const {clientX, clientY} = event;
    const dragElemTop = clientY - this.diffTop;

    this.draggingElement.style.top = `${dragElemTop}px`;
    this.draggingElement.style.left = `${clientX - this.diffLeft}px`;

    let {nextElementSibling: nextElement} = this.placeholderElement;
    const {previousElementSibling: prevElement} = this.placeholderElement;
    const {bottom: dragElemBottom} = this.draggingElement.getBoundingClientRect();
    const {firstElementChild, lastElementChild} = this.element;
    const {top: firstElementTop} = firstElementChild.getBoundingClientRect();
    const {bottom: lastElementBottom} = lastElementChild.getBoundingClientRect();

    if (nextElement && nextElement.classList.contains('sortable-list__item_dragging')) {
      nextElement = this.draggingElement.nextElementSibling;
    }

    if (clientY < firstElementTop) {
      firstElementChild.before(this.placeholderElement);
    }

    if (clientY > lastElementBottom) {
      lastElementChild.after(this.placeholderElement);
    }

    if (prevElement) {
      const {top, bottom, height} = prevElement.getBoundingClientRect();
      const middlePrevElement = top + height / 2;

      if (clientY < bottom && dragElemTop < middlePrevElement) {
        prevElement.before(this.placeholderElement);
      }
    }

    if (nextElement) {
      const {top, height} = nextElement.getBoundingClientRect();
      const middleNextElement = top + height / 2;

      if (clientY > top && dragElemBottom > middleNextElement) {
        nextElement.after(this.placeholderElement);
      }
    }
  }

  onDeleteItem(element) {
    const item = element.closest('.sortable-list__item');
    if (item) {
      item.remove();
    }
  }

  modifyDraggingElement(x, y) {
    const {top, left, width, height} = this.draggingElement.getBoundingClientRect();
    const newTop = top + this.positionShift;
    const newLeft = left + this.positionShift;

    this.draggingElement.classList.add('sortable-list__item_dragging');
    this.draggingElement.style.top = `${newTop}px`;
    this.draggingElement.style.left = `${newLeft}px`;
    this.draggingElement.style.width = `${width}px`;
    this.draggingElement.style.height = `${height}px`;

    this.diffTop = y - newTop;
    this.diffLeft = x - newLeft;
  }

  insertPlaceholderItem() {
    const {width, height} = this.draggingElement.getBoundingClientRect();

    this.placeholderElement = document.createElement('li');
    this.placeholderElement.classList.add('sortable-list__placeholder');
    this.placeholderElement.style.width = `${width}px`;
    this.placeholderElement.style.height = `${height}px`;

    this.draggingElement.before(this.placeholderElement);
  }

  dispatchEvent () {
    this.element.dispatchEvent(new CustomEvent('list-sorted', {
      bubbles: true,
      detail:  this.element
    }));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
