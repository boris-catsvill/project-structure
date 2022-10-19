export default class SortableList {
  element;
  placeholder;
  movingElement;
  movingCoords = {};

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  addEventListeners() {
    this.element.addEventListener('pointerdown', event => {
      this.pointerDownHandler(event);
    })
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <ul class="sortable-list"></ul>
    `
    this.element = wrapper.firstElementChild;

    for (const item of this.items) {
      item.classList.add('sortable-list__item');
    }
    this.element.append(...this.items);

    this.addEventListeners();
  }

  removeEventListeners() {
    document.removeEventListener('pointermove', this.pointerMoveHandler);
    document.removeEventListener('pointerup', this.pointerUpHandler);
  }

  pointerDownHandler = (event) => {
    const element = event.target.closest('.sortable-list__item');

    if (element) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();
        this.dragNDrop(element, event);
      }

      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();
        element.remove();
      }
    }
  }

  dragNDrop(element, {clientX, clientY}) {
    this.movingElement = element;
    this.elementInitialIndex = [...this.element.children].indexOf(element);

    const { x, y } = element.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = element;

    this.movingCoords.x = clientX - x;
    this.movingCoords.y = clientY - y;

    this.movingElement.style.width = `${offsetWidth}px`;
    this.movingElement.style.height = `${offsetHeight}px`;
    this.movingElement.classList.add('sortable-list__item_dragging');

    const placeholderWrapper = document.createElement('li');
    placeholderWrapper.className = 'sortable-list__placeholder';
    placeholderWrapper.style.width = `${offsetWidth}px`;
    placeholderWrapper.style.height = `${offsetHeight}px`;
    this.placeholder = placeholderWrapper;

    this.movingElement.after(this.placeholder);
    this.element.append(this.movingElement);

    this.movingElement.style.left = `${clientX - this.movingCoords.x}px`;
    this.movingElement.style.top = `${clientY - this.movingCoords.y}px`;
    
    document.addEventListener('pointermove', this.pointerMoveHandler);
    document.addEventListener('pointerup', this.pointerUpHandler);
  }

  pointerMoveHandler = ({ clientX, clientY }) => {
    this.movingElement.style.left = `${clientX - this.movingCoords.x}px`;
    this.movingElement.style.top = `${clientY - this.movingCoords.y}px`;

    const prevElem = this.placeholder.previousElementSibling;
    const nextElem = this.placeholder.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { top } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    if (clientY < top) {
      return firstElementChild.before(this.placeholder);
    }

    if (clientY > bottom) {
      return lastElementChild.after(this.placeholder);
    }

    if (prevElem) {
      const { top, height } = prevElem.getBoundingClientRect();
      const middlePrevElem = top + height / 2;

      if (clientY < middlePrevElem) {
        return prevElem.before(this.placeholder);
      }
    }

    if (nextElem) {
      const { top, height } = nextElem.getBoundingClientRect();
      const middleNextElem = top + height / 2;

      if (clientY > middleNextElem) {
        return nextElem.after(this.placeholder);
      }
    }
  }

  pointerUpHandler = () => {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholder);

    this.movingElement.style.cssText = '';
    this.movingElement.classList.remove('sortable-list__item_dragging');
    this.placeholder.replaceWith(this.movingElement);
    
    this.movingElement = null;

    this.removeEventListeners();

    if (placeholderIndex !== this.elementInitialIndex) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        detail: {
          from: this.elementInitialIndex,
          to: placeholderIndex
        }
      }))
    }
  }

  remove() {
    this.element?.remove()
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
    this.movingCoords = {};
  }
}