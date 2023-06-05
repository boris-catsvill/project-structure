export default class SortableList {
  activeItem;
  placeHolder;

  constructor({ items = [] } = {}) {
    this.items = items;
    this.items.map(item => item.classList.add('sortable-list__item'));
    this.render();
  }

  static get EVENT_CHANGED_ORDER() {
    return 'changed-order';
  }

  draggingItem = e => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { shiftTop, shiftLeft } = this.activeItem.dataset;
    const { top: placeholderTop } = this.placeHolder.getBoundingClientRect();

    const itemTop = clientY - shiftTop;
    const itemLeft = clientX - shiftLeft;

    const isMoveDown = placeholderTop < itemTop;
    const isMoveTop = placeholderTop > itemTop;

    const getSiblingTop = sibling => sibling.getBoundingClientRect().top;

    if (isMoveDown) {
      const nextSibling = this.placeHolder.nextSibling;
      const isUnderSibling = nextSibling ? itemTop > getSiblingTop(nextSibling) : false;
      if (isUnderSibling) {
        nextSibling.after(this.placeHolder);
      }
    }
    if (isMoveTop) {
      const prevSibling = this.placeHolder.previousSibling;
      const isOverSibling = prevSibling ? itemTop < getSiblingTop(prevSibling) : false;
      if (isOverSibling) {
        prevSibling.before(this.placeHolder);
      }
    }

    this.activeItem.style.top = itemTop + 'px';
    this.activeItem.style.left = itemLeft + 'px';
  };

  onPointerDown(event) {
    event.preventDefault();
    const { target } = event;
    const item = target.closest('li');
    if (!item) {
      return;
    }
    const isTargetGrab = target.dataset.grabHandle !== undefined;
    const isItemGrab = item.dataset.grabHandle !== undefined;
    if (target.dataset.deleteHandle !== undefined) {
      item.remove();
    }

    //TODO Check this
    if (isTargetGrab || isItemGrab) {
      this.dragItem(item, event);
    }
  }

  dragItem(item, { clientX, clientY }) {
    const { width, height, left, top } = item.getBoundingClientRect();
    this.activeItem = item;
    this.placeHolder = this.getPlaceHolder(width, height);
    this.activeItem.before(this.placeHolder);
    this.activeItem.classList.add('sortable-list__item_dragging');

    this.activeItem.dataset.shiftTop = clientY - top;
    this.activeItem.dataset.shiftLeft = clientX - left;

    const style = {
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px'
    };
    for (const [prop, value] of Object.entries(style)) {
      this.activeItem.style[prop] = value;
    }

    document.body.addEventListener('pointermove', this.draggingItem);
  }

  dropItem(e) {
    e.preventDefault();
    if (this.activeItem) {
      const initialIndex = [...this.element.querySelectorAll('.sortable-list__item')].indexOf(
        this.activeItem
      );
      document.body.removeEventListener('pointermove', this.draggingItem);
      this.activeItem.classList.remove('sortable-list__item_dragging');
      ['left', 'top', 'width', 'height'].map(prop => (this.activeItem.style[prop] = ''));
      this.placeHolder.after(this.activeItem);
      this.placeHolder?.remove();

      this.activeItem.dataset.shiftTop = 0;
      this.activeItem.dataset.shiftLeft = 0;
      const currentIndex = [...this.element.querySelectorAll('.sortable-list__item')].indexOf(
        this.activeItem
      );
      this.activeItem = null;

      //TODO Need to refactor
      const isOrderChanged = initialIndex !== currentIndex;
      if (isOrderChanged) {
        this.dispatchChanged();
      }
    }
  }

  dispatchChanged() {
    this.element.dispatchEvent(
      new CustomEvent(SortableList.EVENT_CHANGED_ORDER, { bubbles: true })
    );
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');
    this.element.append(...this.items);

    this.initListeners();
  }

  getPlaceHolder(width, height) {
    if (this.placeHolder) {
      this.placeHolder.style.width = width + 'px';
      this.placeHolder.style.height = height + 'px';
      return this.placeHolder;
    }
    const placeHolder = document.createElement('div');
    placeHolder.classList.add('sortable-list__placeholder');
    placeHolder.style.width = width + 'px';
    placeHolder.style.height = height + 'px';
    return placeHolder;
  }

  initListeners() {
    this.element.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.element.addEventListener('pointerup', e => this.dropItem(e));
    this.items.map(item => {
      item.addEventListener('dragstart', () => false);
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
