export default class SortableList {
  constructor({ items = [] } = {}) {
    this.items = items;
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';
    for (const item of this.items) {
      item.classList.add('sortable-list__item');
    }
    this.element.append(...this.items);
    this.element.addEventListener('pointerdown', event => {
      this.down(event);
    });
  }

  down(event) {
    const element = event.target.closest('.sortable-list__item');
    if (element) {
      event.preventDefault();
      if (event.target.closest('[data-grab-handle]')) {
        this.drag(event, element);
      } else if (event.target.closest('[data-delete-handle]')) {
        element.remove();
      }
    }
  }

  drag(event, element) {
    let {clientX, clientY} = event;
    this.currentItem = element;
    this.startIndex = [...this.element.children].indexOf(element);

    const { x, y } = element.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = element;

    this.start = {
      x: clientX - x,
      y: clientY - y
    };
    this.emptyItem = this.createEmptyItem(offsetWidth, offsetHeight);

    this.currentItem.style.width = `${offsetWidth}px`;
    this.currentItem.style.height = `${offsetHeight}px`;
    this.currentItem.classList.add('sortable-list__item_dragging');
    this.currentItem.after(this.emptyItem);
    this.element.append(this.currentItem);
    this.moveTo(clientX, clientY);
    this.addListeners();
  }

  createEmptyItem(width, height) {
    const li = document.createElement('li');
    li.className = 'sortable-list__placeholder';
    li.style.width = `${width}px`;
    li.style.height = `${height}px`;
    return li;
  }

  addListeners() {
    document.addEventListener('pointermove', this.move);
    document.addEventListener('pointerup', this.up);
  }

  move = (event) => {
    let { clientX, clientY } = event;
    this.moveTo(clientX, clientY);
    const prevElem = this.emptyItem.previousElementSibling;
    const nextElem = this.emptyItem.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    if (clientY < firstElementTop) {
      return firstElementChild.before(this.emptyItem);
    }

    if (clientY > bottom) {
      return lastElementChild.after(this.emptyItem);
    }

    if (prevElem) {
      const { top, height } = prevElem.getBoundingClientRect();
      const middlePrevElem = top + height / 2;
      if (clientY < middlePrevElem) {
        return prevElem.before(this.emptyItem);
      }
    }

    if (nextElem) {
      const { top, height } = nextElem.getBoundingClientRect();
      const middleNextElem = top + height / 2;
      if (clientY > middleNextElem) {
        return nextElem.after(this.emptyItem);
      }
    }
  };

  moveTo(clientX, clientY) {
    this.currentItem.style.left = `${clientX - this.start.x}px`;
    this.currentItem.style.top = `${clientY - this.start.y}px`;
  }

  up = () => {
    const endIndex = [...this.element.children].indexOf(this.emptyItem);
    this.currentItem.style.cssText = '';
    this.currentItem.classList.remove('sortable-list__item_dragging');
    this.emptyItem.replaceWith(this.currentItem);
    this.currentItem = null;

    this.removeListeners();

    if (endIndex !== this.startIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.startIndex,
        to: endIndex
      });
    }
  }

  removeListeners() {
    document.removeEventListener('pointermove', this.move);
    document.removeEventListener('pointerup', this.up);
  }

  dispatchEvent(type, details) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      details
    }));
  }

  remove () {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeListeners();
    this.element = null;
  }
}
