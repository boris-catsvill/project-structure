export default class SortableList {
  element;

  onPointerDown = event => {
    if (event.which !== 1) return;
    const listItem = event.target.closest('.sortable-list__item');

    if (listItem) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();
        this.dragStart(listItem, event);
      }

      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();
        listItem.remove();
      }
    }
  };

  onPointerMove = ({ clientX, clientY }) => {
    this.moveDraggingItem(clientX, clientY);

    this.draggingItem.style.display = 'none';
    const itemBelow = document.elementFromPoint(clientX, clientY)?.closest('.sortable-list__item');
    this.draggingItem.style.display = '';
    
    const children = [...this.element.children];
    const itemBelowIndex = children.indexOf(itemBelow);
    const placeholderIndex = children.indexOf(this.placeholder);
    if (itemBelowIndex === -1 || placeholderIndex === -1) return;

    if (placeholderIndex < itemBelowIndex) {
      itemBelow.after(this.placeholder);
    } else {
      itemBelow.before(this.placeholder);
    }
  };

  onPointerUp = () => {
    this.dragStop();
  };

  constructor({ items = [] } = {}) {
    this.items = items;
    
    this.render();
    this.initEventListners();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';
    this.items.forEach(item => item.classList.add('sortable-list__item'));
    this.element.append(...this.items);
  }

  initEventListners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  dragStart(listItem, { clientX, clientY }) {
    const { left, top, width, height } = listItem.getBoundingClientRect();
    this.itemStartIndex = [...this.element.children].indexOf(listItem);

    this.placeholder = document.createElement('li');
    this.placeholder.className = 'sortable-list__placeholder';
    this.placeholder.style.width = width + 'px';
    this.placeholder.style.height = height + 'px';

    this.draggingItem = listItem;
    this.draggingItem.classList.add('sortable-list__item_dragging');
    this.draggingItem.style.width = width + 'px';
    this.draggingItem.style.height = height + 'px';
    this.draggingItem.before(this.placeholder);

    this.element.append(this.draggingItem);

    this.pointerOffset = {
      x: clientX - left,
      y: clientY - top,
    };

    this.moveDraggingItem(clientX, clientY);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  moveDraggingItem(clientX, clientY) {
    this.draggingItem.style.left = clientX - this.pointerOffset.x + 'px';
    this.draggingItem.style.top = clientY - this.pointerOffset.y + 'px';
  }

  dragStop() {
    const itemStopIndex = [...this.element.children].indexOf(this.placeholder);
    this.placeholder.replaceWith(this.draggingItem);
    this.draggingItem.classList.remove('sortable-list__item_dragging');

    this.draggingItem.style.left = '';
    this.draggingItem.style.top = '';
    this.draggingItem.style.width = '';
    this.draggingItem.style.height = '';

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.draggingItem = null;
    
    if (itemStopIndex !== this.itemStartIndex) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        details: {
          from: this.itemStartIndex,
          to: itemStopIndex,
        }
      }))
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerMove);
    this.element = null;
  }
}
