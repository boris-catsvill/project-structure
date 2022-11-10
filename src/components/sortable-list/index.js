export default class SortableList {
  element;
  dragElement;
  placeholder;
  left;
  top;

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  getTemplate() {
    return `
      <ul class='sortable-list'>
      </ul>
    `;
  }

  getItems() {
    this.items.map((item) => {
      item.classList.add('sortable-list__item');

      this.element.append(item);
    });
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.getItems();
    this.initEventListeners();
  }

  onPointerDown = (event) => { 
    const element = event.target.closest('.sortable-list__item');

    if (element) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();
        this.onDragStart(event, element);
      }
      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();
        element.remove();
      }
    }
  }

  onDragStart(event, element) {
    this.left = event.clientX - element.getBoundingClientRect().left;
    this.top = event.clientY - element.getBoundingClientRect().top;

    this.dragElement = element;
    this.elementIndex = [...this.element.children].indexOf(element);
    this.dragElement.style.width = element.offsetWidth + 'px';
    this.dragElement.style.height = element.offsetHeight + 'px';
    this.dragElement.classList.add('sortable-list__item_dragging');

    this.moveAt(event.clientX, event.clientY);
    this.getPlaceholder(element);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  getPlaceholder(element) {
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'sortable-list__placeholder';
    this.placeholder.style.width = element.style.width;
    this.placeholder.style.height = element.style.height;
    
    element.after(this.placeholder);   
  }

  moveAt(clientX, clientY) {
    this.dragElement.style.left = `${clientX - this.left}px`;
    this.dragElement.style.top = `${clientY - this.top}px`;
  }

  onPointerMove = (event) => {
    this.moveAt(event.clientX, event.clientY);

    const prevElement = this.placeholder.previousElementSibling;
    const nextElement = this.placeholder.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect;

    if (event.clientY < firstElementTop) {
      return firstElementChild.before(this.placeholder);
    }

    if (event.clientY > bottom) {
      return lastElementChild.after(this.placeholder);
    }

    if (prevElement) {
      const { top, height } = prevElement.getBoundingClientRect();
      const middlePrevElement = top + height / 2;

      if (event.clientY < middlePrevElement) {
        return prevElement.before(this.placeholder);
      }
    }

    if (nextElement) {
      const { top, height } = nextElement.getBoundingClientRect();
      const middleNextElement = top + height / 2;

      if (event.clientY > middleNextElement) {
        return nextElement.after(this.placeholder);
      }
    }
  }

  onPointerUp = () => {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholder);

    this.placeholder.replaceWith(this.dragElement);
    
    this.dragElement.classList.remove('sortable-list__item_dragging');
    this.dragElement.style.cssText = '';

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

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

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  remove() {
    if (this.element) {
      this.element.remove();  
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.dragElement = null;
    this.placeholder = null;
  }
}
