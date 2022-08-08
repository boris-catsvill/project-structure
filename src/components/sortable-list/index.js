export default class SortableList {
  curDraggableElement = {};
  placeholderElement;

  constructor({
    items = []
  } = {}) {
    this.listItems = items;
    this.init();
  }

  getIndexOfList(node) {
    let index = 0;
    for (const iterator of node.parentElement.children) {
      if (iterator === node) {
        break;
      }
      index += 1;
    }
    return index;
  }

  onPointerMove = event => {
    const {
      element: draggableElement,
      shiftX,
      shiftY
    } = this.curDraggableElement;
    draggableElement.style.left = event.clientX - shiftX + 'px';
    draggableElement.style.top = event.clientY - shiftY + 'px';

    draggableElement.style.display = 'none'; //с hidden не получается
    const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    draggableElement.style.removeProperty('display');

    if (!elemBelow) {
      return;
    }

    const droppableBelow = elemBelow.closest('.sortable-list__item');
    if (!droppableBelow || droppableBelow === this.placeholderElement) {
      return;
    }

    const direction = droppableBelow.getBoundingClientRect().top > this.placeholderElement.getBoundingClientRect().top ? 'after' : 'before';
    droppableBelow[direction](this.placeholderElement);

  }

  onDraggableElementointerUp = () => {

    const {
      element: draggableElement,
      index: indexBefore
    } = this.curDraggableElement;
    draggableElement.removeAttribute('style');
    draggableElement.classList.toggle('sortable-list__item_dragging');
    this.placeholderElement.replaceWith(draggableElement);

    const indexAfter = this.getIndexOfList(draggableElement);
    if (indexBefore !== indexAfter) {
      this.element.dispatchEvent(new CustomEvent('sortlist-change', {
        bubbles: true,
        detail: {
          "indexBefore": indexBefore,
          "indexAfter": indexAfter
        }
      }));
    }

    draggableElement.removeEventListener('pointerup', this.onDraggableElementointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerDown = event => {
    if (event.target.hasAttribute('data-delete-handle')) {
      const curListItem = event.target.closest('li');
      this.element.dispatchEvent(new CustomEvent('sortlist-change', {
        detail: {
          "indexBefore": this.getIndexOfList(curListItem),
          "indexAfter": -1
        }
      }));
      curListItem.remove();
      return;
    }

    if (!event.target.hasAttribute('data-grab-handle')) {
      return;
    }

    this.curDraggableElement.element = event.target.closest('li');
    const {
      left,
      top,
      width,
      height
    } = this.curDraggableElement.element.getBoundingClientRect();
    this.curDraggableElement.shiftX = event.clientX - left;
    this.curDraggableElement.shiftY = event.clientY - top;

    this.curDraggableElement.index = this.getIndexOfList(this.curDraggableElement.element);

    const {
      element: draggableElement,
      shiftX,
      shiftY
    } = this.curDraggableElement;

    draggableElement.after(this.placeholderElement);
    draggableElement.classList.toggle('sortable-list__item_dragging');
    draggableElement.style.left = event.clientX - shiftX + 'px';
    draggableElement.style.top = event.clientY - shiftY + 'px';
    draggableElement.style.width = width + 'px'; //делаем так, потому что: как только элемент отрывается от контейнера - он скукоживается
    draggableElement.style.height = height + 'px';

    draggableElement.addEventListener('pointerup', this.onDraggableElementointerUp);
    document.addEventListener('pointermove', this.onPointerMove);
  }

  init() {

    this.placeholderElement = document.createElement('li');
    this.placeholderElement.classList.add('sortable-list__item');
    this.placeholderElement.classList.add('sortable-list__placeholder');

    this.element = document.createElement('ui');
    this.element.classList.add('sortable-list');
    this.element.append(...this.listItems);
    this.element.addEventListener('pointerdown', this.onPointerDown);

  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }

  destroy() {
    document.removeEventListener('pointermove', this.onPointerMove);
    this.remove();
    this.placeholderElement = null;
    this.curDraggableElement = null;
  }

}
