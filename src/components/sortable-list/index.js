export default class SortableList {
  element;

  onPointerDown = event => {
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

  onPointerMove = ({ clientX, clientY }) => {
    this.moveDraggingAt(clientX, clientY);

    const prevElement = this.placeholderElement.previousElementSibling;
    const nextElement = this.placeholderElement.nextElementSibling;

    this.draggingElement.style.display = 'none';

    const elementBelow = document.elementFromPoint(clientX, clientY);

    this.draggingElement.style.display = '';

    if (elementBelow) {
      const droppableBelow = elementBelow.closest('.sortable-list__item');

      if (droppableBelow === prevElement) {
        droppableBelow?.before(this.placeholderElement);
      }

      if (droppableBelow === nextElement) {
        droppableBelow?.after(this.placeholderElement);
      }
    }

    this.scrollIfCloseToWindowEdge(clientY);
  }

  onPointerUp = () => {
    this.dragEnd();
    this.removeDocumentEventListeners();
  }

  constructor({items = []} = {}) {
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

  createPlaceholderElement(width, height) {
    const element = document.createElement('li');

    element.className = 'sortable-list__placeholder';
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    return element;
  }

  moveDraggingAt(clientX, clientY) {
    this.draggingElement.style.left = `${clientX - this.pointerShift.x}px`;
    this.draggingElement.style.top = `${clientY - this.pointerShift.y}px`;
  }

  dragStart(element, { clientX, clientY }) {
    this.draggingElement = element;
    this.draggingElementIndex = [...this.element.children].indexOf(element);

    const { x, y } = element.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = element;

    this.pointerShift = {
      x: clientX - x,
      y: clientY - y
    };

    this.draggingElement.style.width = `${offsetWidth}px`;
    this.draggingElement.style.height = `${offsetHeight}px`;
    this.draggingElement.classList.add('sortable-list__item_dragging');

    this.placeholderElement = this.createPlaceholderElement(offsetWidth, offsetHeight);

    this.draggingElement.after(this.placeholderElement);
    this.element.append(this.draggingElement);
    this.moveDraggingAt(clientX, clientY);
    this.initDocumentEventListeners();
  }

  dragEnd() {
    const placeholderElementIndex = [...this.element.children].indexOf(this.placeholderElement);

    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.draggingElement.style.cssText = '';
    this.placeholderElement.replaceWith(this.draggingElement);
    this.draggingElement = null;

    if (placeholderElementIndex !== this.draggingElementIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.draggingElementIndex,
        to: placeholderElementIndex
      });
    }
  }

  scrollIfCloseToWindowEdge(clientY) {
    const scrollingValue = 10;
    const threshold = 30;

    if (clientY < threshold) {
      window.scrollBy(0, -scrollingValue);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      window.scrollBy(0, scrollingValue);
    }
  }

  dispatchEvent(type, detail) {
    this.element.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  initDocumentEventListeners() {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  removeDocumentEventListeners() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeDocumentEventListeners();
    this.element = null;
  }
}
