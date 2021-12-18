export default class SortableList {
  constructor({ items = [] } = {}) {
    this.items = items;
    this.render();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <ul class="sortable-list" data-element="imageListContainer"></ul>
    `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.renderItems(this.items);
  }

  renderItems(items) {
    const sortableList = this.element.closest('.sortable-list');
    for (const item of items) {
      item.classList.add('sortable-list__item');
      sortableList.append(item);
    }
  }

  dragstartHandler = (event) => {
    if (!event.target.closest('[data-grab-handle]')) return;

    const sortableList = this.element.closest('.sortable-list');
    const target = event.target.closest('.sortable-list__item');

    this.elementInitialIndex = [...this.element.children].indexOf(target);

    const phantomPlaceholder = target.cloneNode(false);
    phantomPlaceholder.classList.add('sortable-list__placeholder');

    sortableList.insertBefore(phantomPlaceholder, target);
    const memoizedWidth = getComputedStyle(target).width;
    target.classList.add('sortable-list__item_dragging');
    target.style.width = memoizedWidth;

    const shiftX = event.clientX - phantomPlaceholder.getBoundingClientRect().left;
    const shiftY = event.clientY - phantomPlaceholder.getBoundingClientRect().top;

    function move(clientX, clientY) {
      target.style.left = clientX - shiftX + 'px';
      target.style.top = clientY - shiftY + 'px';
    }

    move(event.clientX, event.clientY);

    function onPointerMove(event) {
      move(event.clientX, event.clientY);

      target.style.display = 'none';
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      target.style.display = '';

      if (!elemBelow) return;

      const droppableBelow = elemBelow.closest('.sortable-list__item');

      const isDroppable = droppableBelow && target !== droppableBelow;
      if (!isDroppable) return;

      const { height, top } = droppableBelow.getBoundingClientRect();
      const droppableBelowCenter = top + height / 2;

      const dropPlace = (event.clientY < droppableBelowCenter) ?
        droppableBelow :
        droppableBelow.nextElementSibling;

      if (dropPlace && phantomPlaceholder === dropPlace.previousElementSibling
        || phantomPlaceholder === dropPlace) {
        return;
      }

      sortableList.insertBefore(phantomPlaceholder, dropPlace);
    }

    const onPointerUpHandler = () => {
      target.style.left = phantomPlaceholder.style.left;
      target.style.top = phantomPlaceholder.style.top;
      target.classList.remove('sortable-list__item_dragging');
      phantomPlaceholder.replaceWith(target);

      const placeholderIndex = [...this.element.children].indexOf(phantomPlaceholder);

      if (placeholderIndex !== this.elementInitialIndex) {
        this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
          bubbles: true
        }))
      }

      document.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUpHandler);
    }

    document.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUpHandler);
  }


  deleteItemHandler = (event) => {
    if (!event.target.closest('[data-delete-handle]')) return;
    event.target.closest('.sortable-list__item').remove();
  }

  onDragStartHandler = (event)  => {
    event.preventDefault();
  }

  attachEventListeners() {
    const sortableList = this.element.closest('.sortable-list');
    sortableList.addEventListener('pointerdown', this.dragstartHandler);
    sortableList.addEventListener('pointerdown', this.deleteItemHandler);
    sortableList.addEventListener('dragstart', this.onDragStartHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements = null;
    this.remove();
  }
}
