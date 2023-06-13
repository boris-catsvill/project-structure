import { BaseComponent } from '../../base-component';
import { CUSTOM_EVENTS } from '../../constants';

export default class SortableList extends BaseComponent {
  activeItem;
  placeHolder;
  items;

  constructor(items = []) {
    super();
    this.items = items;
    this.items.map(item => item.classList.add('sortable-list__item'));
    this.element = document.createElement('ul');
    this.render();
  }

  draggingItem = e => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { shiftTop, shiftLeft } = this.activeItem?.dataset;
    const { top: placeholderTop } = this.placeHolder.getBoundingClientRect();

    const itemTop = clientY - parseInt(shiftTop ?? '0', 10);
    const itemLeft = clientX - parseInt(shiftLeft ?? '0', 10);

    const isMoveDown = placeholderTop < itemTop;
    const isMoveTop = placeholderTop > itemTop;

    const getSiblingTop = sibling => sibling.getBoundingClientRect().top;

    if (isMoveDown) {
      const nextSibling = this.placeHolder.nextSibling;
      const isUnderSibling =
        nextSibling instanceof HTMLElement ? itemTop > getSiblingTop(nextSibling) : false;
      if (isUnderSibling) {
        nextSibling?.after(this.placeHolder);
      }
    }
    if (isMoveTop) {
      const prevSibling = this.placeHolder.previousSibling;
      const isOverSibling =
        prevSibling instanceof HTMLElement ? itemTop < getSiblingTop(prevSibling) : false;
      if (isOverSibling) {
        prevSibling?.before(this.placeHolder);
      }
    }

    this.activeItem.style.top = itemTop + 'px';
    this.activeItem.style.left = itemLeft + 'px';
  };

  onPointerDown(e) {
    e.preventDefault();
    const { target } = e;
    const item = target.closest('li');
    if (!item) {
      return;
    }
    if (target.dataset.deleteHandle !== undefined) {
      item.remove();
    }

    const isTargetGrab = target.dataset.grabHandle !== undefined;
    const isItemGrab = item.dataset.grabHandle !== undefined;

    if (isTargetGrab || isItemGrab) {
      this.dragItem(item, e);
    }
  }

  dragItem(item, { clientX, clientY }) {
    const { width, height, left, top } = item.getBoundingClientRect();
    this.activeItem = item;
    this.placeHolder = this.getPlaceHolder(width, height);
    this.activeItem.before(this.placeHolder);
    this.activeItem.classList.add('sortable-list__item_dragging');

    this.activeItem.dataset.shiftTop = (clientY - top).toString();
    this.activeItem.dataset.shiftLeft = (clientX - left).toString();

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
      const getIndexItem = item =>
        [...this.element.querySelectorAll('.sortable-list__item')].indexOf(item);

      const indexBeforeDrop = getIndexItem(this.activeItem);
      document.body.removeEventListener('pointermove', this.draggingItem);
      this.activeItem.classList.remove('sortable-list__item_dragging');
      ['left', 'top', 'width', 'height'].map(prop => (this.activeItem.style[prop] = ''));
      this.placeHolder.after(this.activeItem);
      this.placeHolder?.remove();
      this.activeItem.dataset.shiftTop = '0';
      this.activeItem.dataset.shiftLeft = '0';
      const indexAfterDrop = getIndexItem(this.activeItem);
      this.activeItem = null;

      if (indexBeforeDrop !== indexAfterDrop) {
        this.dispatch();
      }
    }
  }

  dispatch() {
    this.element.dispatchEvent(new CustomEvent(CUSTOM_EVENTS.ChangedOrder, { bubbles: true }));
  }

  render() {
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
}
