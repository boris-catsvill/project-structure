export default class SortableList {
  mouseMovement = {};
  placeholder;
  element;

  constructor({ items = [] } = {}) {
    this.items = items;
    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';
    this.createItems();
    this.initEventListeners();
  }

  createItems() {
    for (const item of this.items) {
      item.classList.add('sortable-list__item');
    }
    this.element.append(...this.items);
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', event => {
      this.dragNDrop(event);
    });
  }
  dragNDrop(event) {
    const element = event.target.closest('.sortable-list__item');

    if (element) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();
        this.startDragging(event, element);
      }
      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();
        element.remove();
      }
    }
  }
  startDragging(event, element) {
    const shiftX = event.clientX;
    const shiftY = event.clientY;
    this.movingElement = element;
    this.elementIndex = [...this.element.children].indexOf(element);

    const { x, y } = element.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = element;

    this.mouseMovement.posX = shiftX - x;
    this.mouseMovement.posY = shiftY - y;

    this.movingElement.style.width = offsetWidth + 'px';
    this.movingElement.style.height = offsetHeight + 'px';
    this.movingElement.classList.add('sortable-list__item_dragging');

    this.placeholder = document.createElement('li');
    this.placeholder.className = 'sortable-list__placeholder';
    this.placeholder.style.width = offsetWidth + 'px';
    this.placeholder.style.height = offsetHeight + 'px';
    this.movingElement.after(this.placeholder);

    this.movingElement.style.left = shiftX - this.mouseMovement.posX + 'px';
    this.movingElement.style.top = shiftY - this.mouseMovement.posY + 'px';
    document.addEventListener('pointermove', this.wrapperDragging);
    document.addEventListener('pointerup', this.wrapperStopDragging);
  }

  wrapperDragging = event => {
    this.dragging(event);
  };

  dragging(event) {
    const shiftX = event.clientX;
    const shiftY = event.clientY;

    this.movingElement.style.left = shiftX - this.mouseMovement.posX + 'px';
    this.movingElement.style.top = shiftY - this.mouseMovement.posY + 'px';

    const prev = this.placeholder.previousElementSibling;
    const next = this.placeholder.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const elementTop = firstElementChild.getBoundingClientRect().top;
    const elementBottom = this.element.getBoundingClientRect().bottom;

    if (shiftY < elementTop) {
      return firstElementChild.before(this.placeholder);
    }

    if (shiftY > elementBottom) {
      return lastElementChild.after(this.placeholder);
    }

    if (prev) {
      const { top, height } = prev.getBoundingClientRect();
      const middlePrev = top + height / 2;

      if (shiftY < middlePrev) {
        return prev.before(this.placeholder);
      }
    }

    if (next) {
      const { top, height } = next.getBoundingClientRect();
      const middleNext = top + height / 2;

      if (shiftY > middleNext) {
        return next.after(this.placeholder);
      }
    }
  }

  wrapperStopDragging = () => {
    this.stopDragging();
  };

  stopDragging() {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholder);
    this.movingElement.style.cssText = '';
    this.movingElement.classList.remove('sortable-list__item_dragging');

    this.placeholder.replaceWith(this.movingElement);
    this.movingElement = null;

    this.removeEventListeners();
    if (placeholderIndex !== this.elementIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.elementIndex,
        to: placeholderIndex
      });
    }
  }
  dispatchEvent(type, details) {
    this.element.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        details
      })
    );
  }

  removeEventListeners() {
    document.removeEventListener('pointermove', this.wrapperDragging);
    document.removeEventListener('pointerup', this.wrapperStopDragging);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
    this.placeholder = null;
    this.mouseMovement = {};
  }
}
