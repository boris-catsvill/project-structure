export default class SortableList {
  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
    this.initEventListners();
  }

  getTemplate(items) {
    return `
          <ul class="sortable-list">
              ${items.map(item => {
      item.classList.add('sortable-list__item');
      return item.outerHTML
    }).join('')}
          </ul>
      `;
  }

  getPlaceholder() {
    const wrapper = document.createElement('div');

    const placeholderTemplate = '<li class="sortable-list__item sortable-list__placeholder"></li>';

    wrapper.insertAdjacentHTML('beforeend', placeholderTemplate);

    wrapper.firstElementChild.style.width = this.styleWidth;
    wrapper.firstElementChild.style.height = this.styleHeight;

    return wrapper.firstElementChild;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate(this.items);

    const element = wrapper.firstElementChild;

    this.element = element;
  }

  restorePosition() {
    this.currentItem.style.left = "";
    this.currentItem.style.top = "";
    this.currentItem.style.width = "";
    this.currentItem.style.height = "";
  }

  setPositionForCurrentItem(pageX, pageY) {
    this.currentItem.style.left = pageX - this.shiftX + 'px';
    this.currentItem.style.top = pageY - this.shiftY + 'px';
  }

  setPositionForCurrentPlaceHolder(pageY) {
    const prevElem = this.currentPlaceholder.previousElementSibling;
    const nextElem = this.currentPlaceholder.nextElementSibling;

    if (prevElem) {
      const prevPosition = prevElem.getBoundingClientRect();

      if (prevPosition.top > pageY - this.shiftY) {
        this.currentPlaceholder.remove();
        prevElem.before(this.currentPlaceholder);
      }
    }

    if (nextElem) {
      const nextPosition = nextElem.getBoundingClientRect();

      if (nextPosition.top < pageY - this.shiftY) {
        this.currentPlaceholder.remove();
        nextElem.after(this.currentPlaceholder);
      }
    }
  }

  replaceElement(event) {
    this.setPositionForCurrentItem(event.pageX, event.pageY);
    this.setPositionForCurrentPlaceHolder(event.pageY);
  }

  initEventListners() {
    const itemsGrab = this.element.querySelectorAll('[data-grab-handle]');
    const itemsDelete = this.element.querySelectorAll('[data-delete-handle]');

    const moveListener = (event) => {
      this.replaceElement(event);
    }

    const downListener = (event) => {
      this.currentItem = event.target.closest('li');

      this.shiftX = event.pageX - this.currentItem.getBoundingClientRect().left;
      this.shiftY = event.pageY - this.currentItem.getBoundingClientRect().top;
      const offsetWidth = this.currentItem.offsetWidth;
      const offsetHeight = this.currentItem.offsetHeight;

      this.currentPlaceholder = this.getPlaceholder();
      this.currentItem.replaceWith(this.currentPlaceholder);

      this.setPositionForCurrentItem(event.pageX, event.pageY);

      this.currentItem.style.width = `${offsetWidth}px`;
      this.currentItem.style.height = `${offsetHeight}px`;

      this.element.append(this.currentItem);

      this.currentItem.classList.add('sortable-list__item_dragging');

      document.addEventListener('pointermove', moveListener);
    }

    const upListener = () => {
      document.removeEventListener('pointermove', moveListener);
      this.restorePosition();
      this.currentPlaceholder.replaceWith(this.currentItem);
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        detail: this.element
      }));
      this.currentItem.classList.remove('sortable-list__item_dragging');
    }

    const deleteListener = (event) => {
      this.currentItemDelete = event.target.closest('li');
      this.currentItemDelete.remove();
    }

    itemsDelete.forEach((item) => {
      item.addEventListener('pointerdown', deleteListener);
    });

    itemsGrab.forEach((item) => {
      item.addEventListener('pointerdown', downListener);
      item.addEventListener('pointerup', upListener);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
