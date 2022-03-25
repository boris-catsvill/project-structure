export default class SortableList {
  element = {};
  draggingElement = {};
  elementInitialIndex = {};
  pointerShift = {};
  placeholder = {};
  offsetPointer = {};
  constructor({
    items,
  }) {
    this.items = items;

    this.render();
  }

  render = () => {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');

    this.addItem();
    this.element.addEventListener('pointerdown', this.pointerDownHandler);
  }
  pointerDownHandler = (event) => {
    const dragElement = event.target.closest('[data-grab-handle]');
    const removeElement = event.target.closest('[data-delete-handle]');
    if (dragElement) {
      event.preventDefault();
      this.dragStart(dragElement.closest('.sortable-list__item'), event);
    }
    if (removeElement) {
      event.preventDefault();
      removeElement.closest('.sortable-list__item').remove();
    }
  }
  pointerMoveHandler = ({clientX, clientY}) => {
    this.moveDragging(clientX, clientY);

    const prevEl = this.placeholder.previousElementSibling;
    const nextEl = this.placeholder.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { bottom: elementBottom, top: elementTop } = this.element.getBoundingClientRect();
    const { height: firstElementHeight } = firstElementChild.getBoundingClientRect();
    const { height: lastElementHeight } = lastElementChild.getBoundingClientRect();

    if (clientY < elementTop + firstElementHeight / 2) {
      return firstElementChild.before(this.placeholder);
    }
    if (clientY > elementBottom + lastElementHeight / 2) {
      return lastElementChild.after(this.placeholder);
    }
    if (prevEl) {
      const { top, height } = prevEl.getBoundingClientRect();
      const middlePrev = top + height / 2;

      if (clientY < middlePrev) {
        return prevEl.before(this.placeholder);
      }
    }
    if (nextEl) {
      const { top, height } = nextEl.getBoundingClientRect();
      const middleNext = top + height / 2;

      if (clientY > middleNext) {
        return nextEl.after(this.placeholder);
      }
    }
    this.scrollTo(clientY);
  }
  pointerUpHandler = () => this.dragStop()
  dragStart = (element, {clientX, clientY}) => {
    this.draggingElement = element;
    this.elementInitialIndex = [...this.element.children].indexOf(this.draggingElement);
    
    const { left, top, width, height } = element.getBoundingClientRect();
    
    this.offsetPointer = {
      x: clientX - left,
      y: clientY - top,
    };
    this.draggingElement.classList.add('sortable-list__item_dragging');
    this.draggingElement.style.width = `${width}px`;
    this.draggingElement.style.height = `${height}px`;

    this.placeholder = this.createPlaceholder(width, height);
    this.draggingElement.after(this.placeholder);
    this.element.append(this.draggingElement);
    this.moveDragging(clientX, clientY);

    this.initEventListeners();
  }
  dragStop = () => {
    const indexPlaceholder = [...this.element.children].indexOf(this.placeholder);

    this.draggingElement.style.cssText = '';
    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.placeholder.replaceWith(this.draggingElement);
    this.draggingElement = null;

    this.removeEventListeners();
    
    if (indexPlaceholder !== this.elementInitialIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.elementInitialIndex,
        to: indexPlaceholder,
      });
    }
  }
  scrollTo = (clientY) => {
    const scrollingVal = 10;
    const threshold = 20;

    if (clientY < threshold) {
      window.scrollBy(0, -scrollingVal);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      window.scrollBy(0, scrollingVal);
    }
  }
  createPlaceholder = (width, height) => {
    const placeholder = document.createElement('li');
    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;
    return placeholder;
  }
  moveDragging = (clientX, clientY) => {
    this.draggingElement.style.left = `${clientX - this.offsetPointer.x}px`;
    this.draggingElement.style.top = `${clientY - this.offsetPointer.y}px`;
  }
  initEventListeners = () => {
    document.addEventListener('pointermove', this.pointerMoveHandler);
    document.addEventListener('pointerup', this.pointerUpHandler);
  }
  removeEventListeners = () => {
    document.removeEventListener('pointermove', this.pointerMoveHandler);
    document.removeEventListener('pointerup', this.pointerUpHandler);
  }
  addItem = () => {
    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
    });
    this.element.append(...this.items);
  }
  dispatchEvent = (type, details) => {
    this.element.dispatchEvent(new Event(type, {
      bubbles: true,
      details,
    }));
  }
  remove = () => {
    this.element.remove();
  }
  destroy = () => {
    this.remove();
    this.removeEventListeners();
    this.element = null;
  }
}
