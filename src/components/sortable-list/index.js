export default class SortableList {
  element;

  onTouchStart = event => {
    event.preventDefault();
    this.onPointerDown(event);
  }

  onTouchMove = event => {
    event.preventDefault();
    this.onPointerMove(event);
  }

  onTouchEnd = event => {
    event.preventDefault();
    this.onPointerUp(event);
  }

  onPointerDown = event => {
    const item = event.target.closest('.sortable-list__item');
    if (!item) {
      return;
    }

    if (event.target.closest('[data-grab-handle]')) {
      event.preventDefault();
      this.startDragging(event.clientX, event.clientY, item);
    }

    if (event.target.closest('[data-delete-handle]')) {
      event.preventDefault();
      item.remove();
    }
  }

  onPointerMove = event => {
    const item = this.element.querySelector('.sortable-list__item.sortable-list__item_dragging');
    if (!item) {
      return;
    }

    event.preventDefault();

    const x = event.clientX - this.shiftX;
    const y = event.clientY - this.shiftY;
    this.moveAt(x, y, item);

    const placeholder = this.element.querySelector('.sortable-list__placeholder');
    const {top, bottom} = placeholder.getBoundingClientRect();
    const {offsetHeight} = placeholder;

    if (placeholder.previousElementSibling) {
      if (bottom - offsetHeight / 2 > item.getBoundingClientRect().bottom) {
        placeholder.previousElementSibling.before(placeholder);
      }
    }

    if (placeholder.nextElementSibling) {
      if (top + offsetHeight / 2 < item.getBoundingClientRect().top) {
        placeholder.nextElementSibling.after(placeholder);
      }
    }
  }

  onPointerUp = event => {
    const item = this.element.querySelector('.sortable-list__item.sortable-list__item_dragging');
    if (!item) {
      return;
    }

    event.preventDefault();

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

    this.element.addEventListener('mousedown', this.onPointerDown);
    this.element.addEventListener('touchstart', this.onTouchStart);

    this.element.addEventListener('pointercancel', () => {
      alert('pointercancel');
    });
  }

  moveAt(x, y, element) {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  startDragging(x, y, element) {
    this.indexFrom = this.getIndex(element);

    const rect = element.getBoundingClientRect();

    this.shiftX = x - rect.left;
    this.shiftY = y - rect.top;

    element.classList.add('sortable-list__item_dragging');
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;

    element.after(this.createPlaceholder(rect.width, rect.height));

    // move to the bottom of the list
    element.parentElement.append(element);

    this.element.addEventListener('touchend', this.onTouchEnd);
    this.element.addEventListener('touchmove', this.onTouchMove);

    this.element.addEventListener('mouseup', this.onPointerUp);
    this.element.addEventListener('mousemove', this.onPointerMove);
  }

  stopDragging(element) {
    this.element.removeEventListener('touchmove', this.onTouchMove);
    this.element.removeEventListener('touchend', this.onTouchEnd);

    this.element.removeEventListener('mousemove', this.onPointerMove);
    this.element.removeEventListener('mouseup', this.onPointerUp);

    element.classList.remove('sortable-list__item_dragging');
    element.style.cssText = '';

    const placeholder = this.element.querySelector('.sortable-list__placeholder');
    placeholder.before(element);
    placeholder.remove();

    const indexTo = this.getIndex(element);

    if (this.indexFrom !== indexTo) {
      this.element.dispatchEvent(new CustomEvent('list-order-update', {
        bubbles: true,
        detail: {
          indexFrom: this.indexFrom,
          indexTo: indexTo
        }
      }));
    }
  }

  createPlaceholder(width, height) {
    const placeholder = document.createElement('div');

    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;

    return placeholder;
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
