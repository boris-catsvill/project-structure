export default class SortableList {
  onPointerMove = ({ clientX, clientY }) => {
    this.moveDraggingAt(clientX, clientY);

    const prevElem = this.placeholderElement.previousElementSibling;
    const nextElem = this.placeholderElement.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    if (clientY < firstElementTop) {
      return firstElementChild.before(this.placeholderElement);
    }

    if (clientY > bottom) {
      return lastElementChild.after(this.placeholderElement);
    }

    if (prevElem) {
      const { top, height } = prevElem.getBoundingClientRect();
      const middlePrevElem = top + height / 2;

      if (clientY < middlePrevElem) {
        return prevElem.before(this.placeholderElement);
      }
    }

    if (nextElem) {
      const { top, height } = nextElem.getBoundingClientRect();
      const middleNextElem = top + height / 2;

      if (clientY > middleNextElem) {
        return nextElem.after(this.placeholderElement);
      }
    }
  }

  onPointerUp = () => {
    this.dragStop();
  }

  constructor({ items = []} = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    this.addItems();
    this.initEventListeners();
  }

  addItems() {
    for (const item of this.items) {
      item.classList.add('sortable-list__item');
    }

    this.element.append(...this.items);
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', event => {
      this.onPointerDown(event);
    });
  }

  onPointerDown (event) {
    const element = event.target.closest('.sortable-list__item');

    if (element) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();

        this.dragStart(element, event);
      }

      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();

        element.remove();
      }
    }
  }

  dragStart(element, {clientX, clientY}) {
    this.draggingElem = element;
    this.elementInitialIndex = [...this.element.children].indexOf(element);

    const { x, y } = element.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = element;

    this.pointerShift = {
      x: clientX - x,
      y: clientY - y
    };

    this.draggingElem.style.width = offsetWidth + 'px';
    this.draggingElem.style.height = offsetHeight + 'px';
    this.draggingElem.classList.add('sortable-list__item_dragging');

    this.placeholderElement = this.createPlaceholderElement(offsetWidth, offsetHeight);

    this.draggingElem.after(this.placeholderElement);
    this.element.append(this.draggingElem);
    this.moveDraggingAt(clientX, clientY);
    this.addDocumentEventListeners();
  }

  dragStop() {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);

    this.draggingElem.style.cssText = '';
    this.draggingElem.classList.remove('sortable-list__item_dragging');
    this.placeholderElement.replaceWith(this.draggingElem);
    this.draggingElem = null;

    this.removeDocumentEventListeners();

    if (placeholderIndex !== this.elementInitialIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.elementInitialIndex,
        to: placeholderIndex
      });
    }
  }

  createPlaceholderElement(width, height) {
    const placeholder = document.createElement('div');
    placeholder.style.width = width + 'px';
    placeholder.style.height = height + 'px';
    placeholder.classList.add('sortable-list__placeholder');

    return placeholder;
  }

  dispatchEvent(type, details) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      details
    }));
  }

  addDocumentEventListeners() {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  removeDocumentEventListeners() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  moveDraggingAt(clientX, clientY) {
    this.draggingElem.style.left = (clientX - this.pointerShift.x) + 'px';
    this.draggingElem.style.top = (clientY - this.pointerShift.y) + 'px';
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
