export default class SortableList {
  element;
  placeholderItem;
  selectedItem;
  shiftsSelectedItem = {};

  onItemPointerdownHandler = event => {
    event.preventDefault();
    const target = event.target;
    const selectedItem = target.closest('.sortable-list__item');

    if (!selectedItem) return;

    if (target.closest('[data-delete-handle]')) {
      selectedItem.remove();
    }

    if (target.closest('[data-grab-handle]')) {
      this.selectedItem = selectedItem;

      this.elementInitialIndex = [...this.element.children].indexOf(this.selectedItem);

      selectedItem.style.width = selectedItem.offsetWidth + 'px';
      selectedItem.style.height = selectedItem.offsetHeight + 'px';
      selectedItem.classList.add('sortable-list__item_dragging');

      this.setShiftsSelectedItem(event);
      this.setPosition(event);

      this.selectedItem.before(this.placeholderItem);
      this.element.prepend(this.selectedItem);

      this.element.addEventListener('pointermove', this.onItemPointermoveHandler);
      this.element.addEventListener('pointerup', this.onItemPointerupHandler);
    }
  };

  onItemPointermoveHandler = event => {
    event.preventDefault();

    this.setPosition(event);
    this.movePlaceholder();
  };

  onItemPointerupHandler = event => {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderItem);

    this.placeholderItem.after(this.selectedItem);
    this.placeholderItem.remove();

    this.selectedItem.style.width = '';
    this.selectedItem.style.height = '';
    this.selectedItem.style.left = '';
    this.selectedItem.style.top = '';
    this.selectedItem.classList.remove('sortable-list__item_dragging');

    this.element.removeEventListener('pointermove', this.onItemPointermoveHandler);
    this.element.removeEventListener('pointerup', this.onItemPointerupHandler);

    this.selectedItem = null;

    if (placeholderIndex !== this.elementInitialIndex + 1) {
      this.element.dispatchEvent(
        new CustomEvent('sortable-list-reorder', {
          bubbles: true
        })
      );
    }
  };

  setPosition({ clientX, clientY }) {
    this.selectedItem.style.left = clientX - this.shiftsSelectedItem.x + 'px';
    this.selectedItem.style.top = clientY - this.shiftsSelectedItem.y + 'px';
  }

  setShiftsSelectedItem({ pageX, pageY }) {
    this.shiftsSelectedItem = {
      x: pageX - this.selectedItem.getBoundingClientRect().left,
      y: pageY - this.selectedItem.getBoundingClientRect().top
    };
  }

  movePlaceholder() {
    const previousItem = this.placeholderItem.previousElementSibling;
    const nextItem = this.placeholderItem.nextElementSibling;

    if (
      this.selectedItem.getBoundingClientRect().bottom <=
      previousItem?.getBoundingClientRect().bottom
    ) {
      previousItem.before(this.placeholderItem);
    }

    if (this.selectedItem.getBoundingClientRect().top >= nextItem?.getBoundingClientRect().top) {
      nextItem.after(this.placeholderItem);
    }
  }

  setPlaceholder() {
    this.placeholderItem = document.createElement('div');
    this.placeholderItem.className = 'sortable-list__item sortable-list__placeholder';
  }

  constructor({ items = [] } = {}) {
    this.items = items;
    this.render();
  }

  render() {
    const wrapper = document.createElement('ul');
    wrapper.classList.add('sortable-list');
    wrapper.dataset.element = 'list';
    this.items.forEach(item => item.classList.add('sortable-list__item'));
    wrapper.append(...this.items);
    this.element = wrapper;

    this.initEventlisteners();
    this.setPlaceholder();
  }

  initEventlisteners() {
    this.element.addEventListener('pointerdown', this.onItemPointerdownHandler);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.selectedItem = null;
  }
}
