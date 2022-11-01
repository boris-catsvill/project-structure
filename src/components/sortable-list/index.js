export default class SortableList {
  element;

  constructor({items = [], id = ''} = {}) {
    this.id = id;
    this.items = items;
    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');

    for (let item of this.items) {
      item.classList.add('sortable-list__item');
    }

    this.element.prepend(...this.items);
    this.element.addEventListener('pointerdown', event => this.onPointerDown(event));
  }

  onPointerDown(event) {
    const draggingElement = event.target.closest('.sortable-list__item');

    if (draggingElement) {
      if (event.target.closest('[data-delete-handle]')) {
        draggingElement.remove();
      }

      if (event.target.closest('[data-grab-handle]')) {
        this.startDragging(event, draggingElement);
      }
    }
  }

  startDragging(event, draggingElement) {
    this.createPlaceholder(draggingElement);
    this.draggingElementIndex = [...this.element.children].indexOf(draggingElement);
    this.draggingElement = draggingElement;

    this.xStartOffset = event.clientX - draggingElement.getBoundingClientRect().x;
    this.yStartOffset = event.clientY - draggingElement.getBoundingClientRect().y;

    draggingElement.style.width = `${draggingElement.offsetWidth}px`;
    draggingElement.style.height = `${draggingElement.offsetHeight}px`;
    draggingElement.classList.add('sortable-list__item_dragging');

    draggingElement.style.left = draggingElement.getBoundingClientRect().x  + 'px';
    draggingElement.style.top = draggingElement.getBoundingClientRect().y + 10 + 'px';

    draggingElement.after(this.placeholder);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  moveDraggingElement(clientX, clientY) {
    this.draggingElement.style.left = clientX - this.xStartOffset + 10 + 'px';
    this.draggingElement.style.top = clientY - this.yStartOffset + 10 + 'px';
  }

  onPointerMove = (event) => {
    this.moveDraggingElement(event.clientX, event.clientY);
    const {top, bottom} = this.element.getBoundingClientRect();
    this.placeholderIndex = [...this.element.children].indexOf(this.placeholder);

    if (event.clientY < top) {
      this.element.prepend(this.placeholder);
    } else if (event.clientY > bottom) {
      this.element.append(this.placeholder);
    } else {
      const children = this.element.children;

      for (let i = 0; i < children.length; i++) {
        const elem = children[i];

        if (elem !== this.draggingElement) {
          const {top, bottom} = elem.getBoundingClientRect();
          const offsetHeight = elem.offsetHeight;

          if (event.clientY > top && event.clientY < bottom) {
            if (event.clientY < top + offsetHeight / 2) {
              elem.before(this.placeholder);
              break;
            } else {
              elem.after(this.placeholder);
              break;
            }
          }
        }
      }
    }
  };

  onPointerUp = () => {
    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.placeholder.replaceWith(this.draggingElement);

    this.draggingElement.style.top = null;
    this.draggingElement.style.bottom = null;
    this.draggingElement.style.left = null;
    this.draggingElement.style.right = null;

    this.draggingElement = null;


    if (this.draggingElementIndex !== this.placeholderIndex) {
      const customEvent = new CustomEvent('change-order-in-sortable-list', {
        bubbles: true,
        detail: {
          from: this.draggingElementIndex,
          to: this.placeholderIndex,
          id: this.id
        }
      });
      this.element.dispatchEvent(customEvent);
    }

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  };

  createPlaceholder(draggingElement) {
    const placeholder = document.createElement('li');
    placeholder.className = 'sortable-list__placeholder';

    const width = draggingElement.offsetWidth;
    const height = draggingElement.offsetHeight;

    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;

    this.placeholder = placeholder;
  }

  remove() {
    this.element.remove();

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  destroy() {
    this.remove();
  }
}
