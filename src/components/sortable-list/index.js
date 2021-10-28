export default class SortableList {
  element;

  onPointerDown = event => {
    const item = event.target.closest('.sortable-list__item');
    if (!item) {
      return;
    }

    if (event.target.closest('[data-grab-handle]')) {
      this.startDragging(this.getClientX(event), this.getClientY(event), item);
    }

    if (event.target.closest('[data-delete-handle]')) {
      item.remove();
    }
  }

  onPointerMove = event => {
    const item = this.element.querySelector('.sortable-list__item.sortable-list__item_dragging');
    if (!item) {
      return;
    }

    const x = this.getClientX(event) - this.shiftX;
    const y = this.getClientY(event) - this.shiftY;

    this.moveAt(x, y, item);
  }

  onPointerUp = event => {
    const item = this.element.querySelector('.sortable-list__item.sortable-list__item_dragging');
    if (!item) {
      return;
    }

    this.stopDragging(item);
  }

  constructor({items = []}) {
    this.items = items;

    this.render();
    this.initEventListeners();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');

    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
    });

    this.element.append(...this.items);
  }

  initEventListeners() {
    this.element.addEventListener('dragstart', () => false);
    this.element.addEventListener('touchstart', this.onPointerDown);
    this.element.addEventListener('mousedown', this.onPointerDown);
  }

  moveAt(x, y, element) {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    this.checkMovePlaceholder(y + element.offsetHeight / 2);
  }

  checkMovePlaceholder(elementMiddle) {
    const placeholder = this.getPlaceholder();
    const {top, bottom} = placeholder.getBoundingClientRect();

    if (placeholder.previousElementSibling && (elementMiddle < top)) {
      placeholder.previousElementSibling.before(placeholder);
    }

    if (placeholder.nextElementSibling && (elementMiddle > bottom)) {
      placeholder.nextElementSibling.after(placeholder);
    }
  }

  startDragging(x, y, element) {
    this.indexFrom = this.getIndex(element);

    const {left, width, top, height} = element.getBoundingClientRect();

    this.shiftX = x - left;
    this.shiftY = y - top;

    element.classList.add('sortable-list__item_dragging');
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;

    element.after(this.createPlaceholder(width, height));

    // move to the bottom of the list
    element.parentElement.append(element);

    this.addEventListeners();
  }

  addEventListeners() {
    // touch events
    this.element.addEventListener('touchend', this.onPointerUp);
    this.element.addEventListener('touchmove', this.onPointerMove);

    // mouse events
    this.element.addEventListener('mouseup', this.onPointerUp);
    this.element.addEventListener('mousemove', this.onPointerMove);
  }

  stopDragging(element) {
    this.removeEventListeners();

    element.classList.remove('sortable-list__item_dragging');
    element.style.cssText = '';

    const placeholder = this.getPlaceholder();
    placeholder.before(element);
    placeholder.remove();

    const indexTo = this.getIndex(element);
    if (this.indexFrom !== indexTo) {
      this.fireCustomEvent(this.indexFrom, indexTo);
    }
  }

  removeEventListeners() {
    // touch events
    this.element.removeEventListener('touchmove', this.onPointerMove);
    this.element.removeEventListener('touchend', this.onPointerUp);

    // mouse events
    this.element.removeEventListener('mousemove', this.onPointerMove);
    this.element.removeEventListener('mouseup', this.onPointerUp);
  }

  createPlaceholder(width, height) {
    const placeholder = document.createElement('div');

    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;

    return placeholder;
  }

  getPlaceholder() {
    return this.element.querySelector('.sortable-list__placeholder');
  }

  getClientX(event) {
    return event.clientX ? event.clientX : event.changedTouches[0].clientX;
  }

  getClientY(event) {
    return event.clientY ? event.clientY : event.changedTouches[0].clientY;
  }

  getIndex(element) {
    let i = 0;
    let current = element;
    while (current.previousElementSibling) {
      current = current.previousElementSibling;
      i++;
    }
    return i;
  }

  fireCustomEvent(indexFrom, indexTo) {
    this.element.dispatchEvent(new CustomEvent('list-order-update', {
      bubbles: true,
      detail: {
        indexFrom,
        indexTo
      }
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
