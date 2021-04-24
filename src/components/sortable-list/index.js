export default class SortableList {
  onPointerDown = ({ target, offsetX }) => {
    if (target.closest('[data-delete-handle]')) {
      this.removeItem(target);
    }

    if (target.closest('[data-grab-handle]')) {
      target.addEventListener('dragstart', event => {
        event.preventDefault();
      });

      this.startDragItem(target, offsetX);
    }
  }

  onPointerMove = ({ clientX, clientY }) => {
    const dragItemTop = clientY - this.sizes.height / 2;
    const dragItemLeft = clientX - this.sizes.shiftX;    
    const { top: elementTop, bottom: elementBottom } = this.element.getBoundingClientRect();

    if (dragItemTop < elementTop || dragItemTop > elementBottom) {
      this.onPointerUp();
      return;
    }

    this.dragItem.style.top = `${dragItemTop}px`;
    this.dragItem.style.left = `${dragItemLeft}px`;
    this.dragItem.style.display = 'none';

    const elementBelow = document.elementFromPoint(clientX, clientY);
    const sortableItemBelow = elementBelow.closest(`.sortable-list__item`);

    if (sortableItemBelow) {
      const {
        top: topBoundry
      } = sortableItemBelow.getBoundingClientRect();
      const {
        top: topPlaceholder
      } = this.placeholder.getBoundingClientRect();

      if (dragItemTop > topBoundry) {
        this.placeholder.before(sortableItemBelow);
      }

      if (topBoundry > dragItemTop && topBoundry < topPlaceholder) {
        sortableItemBelow.before(this.placeholder);
      }
    } 
    
    this.dragItem.style.display = '';
  }

  onPointerUp = () => {
    this.stopDragItem();

    document.removeEventListener('pointermove', this.onPointerMove);    
    this.element.removeEventListener('pointerup', this.onPointerUp);
  }

  constructor({ items = [] }) {
    this.items = items;

    this.render();
  }

  get getPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.classList.add('sortable-list__placeholder');

    placeholder.style.width = `${this.sizes.width}px`;
    placeholder.style.height = `${this.sizes.height}px`;

    return placeholder;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = `<ul class="sortable-list" data-element="sortable-list"></ul>`;

    this.element = element.firstElementChild;

    this.addItemsToList();
    this.addEventListeners();
  }

  addItemsToList() {
    this.items.forEach(item => {
      item.classList.add(`sortable-list__item`);
      this.element.append(item);
    });
  }

  addEventListeners() {
    this.element.addEventListener('selectstart', event => event.preventDefault());
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  removeItem(target) {
    target.closest(`.sortable-list__item`).remove();
  }

  startDragItem(target, offsetLeft) {
    this.dragItem = target.closest(`.sortable-list__item`);
    this.elementInitialIndex = [...this.element.children]
      .indexOf(this.dragItem);

    const { top, left, width, height } = this.dragItem.getBoundingClientRect();
    this.sizes = {
      top,
      left,
      width,
      height,
      shiftX: offsetLeft
    };
    
    this.placeholder = this.getPlaceholder;
    
    this.element.replaceChild(this.placeholder, this.dragItem);
    this.element.append(this.dragItem);

    this.dragItem.classList.add(`sortable-list__item_dragging`);
    this.dragItem.style.width = `${width}px`;
    this.dragItem.style.height = `${height}px`;
    this.dragItem.style.top = `${top}px`;
    this.dragItem.style.left = `${left}px`;

    document.addEventListener('pointermove', this.onPointerMove);    
    this.element.addEventListener('pointerup', this.onPointerUp);
  }

  stopDragItem() {
    const placeholderIndex = [...this.element.children]
      .indexOf(this.placeholder);

    this.dragItem.style.cssText = ``;

    this.sizes = {};

    this.dragItem.classList.remove(`sortable-list__item_dragging`);
    this.element.replaceChild(this.dragItem, this.placeholder);

    this.placeholder.remove();
    this.placeholder = null;

    if (this.elementInitialIndex !== placeholderIndex) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        detail: this.element
      }));
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
